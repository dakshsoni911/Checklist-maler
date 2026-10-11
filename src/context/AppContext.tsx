"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  defaultMode: "auto" | "normal" | "detailed";
  darkMode: boolean;
  totalChecklists: number;
  totalItemsCompleted: number;
  currentStreak: number;
  language: string;
}

export interface Subtopic {
  id: string;
  title: string;
  completed?: boolean;
}

export interface ChecklistItem {
  id: string;
  topic: string;
  description: string;
  completed?: boolean;
  subtopics: Subtopic[];
}

export interface SavedChecklist {
  id: string;
  userId?: string;
  title: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
  modeUsed: "normal" | "detailed";
  autoModeRationale?: string;
  summary: string;
  progressPercent: number;
  items: ChecklistItem[];
}

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  history: SavedChecklist[];
  saveChecklist: (checklist: SavedChecklist) => Promise<void>;
  updateChecklist: (checklist: SavedChecklist) => Promise<void>;
  deleteChecklist: (id: string) => Promise<void>;
  getChecklistById: (id: string) => SavedChecklist | undefined;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password?: string) => Promise<void>;
  signupWithEmail: (email: string, password?: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUser: UserProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=JohnDoe",
  defaultMode: "auto",
  darkMode: false,
  totalChecklists: 24,
  totalItemsCompleted: 182,
  currentStreak: 5,
  language: "English (US)",
};

const initialHistoryMock: SavedChecklist[] = [
  {
    id: "hist_1",
    title: "Project Requirements Checklist",
    fileName: "Project_Requirement_v2.pdf",
    fileSize: "1.2 MB",
    createdAt: "2026-10-10",
    modeUsed: "detailed",
    summary: "Complete breakdown of frontend, backend authentication and deployment pipeline requirements.",
    progressPercent: 45,
    items: [
      {
        id: "item_1",
        topic: "Functional Requirements",
        description: "Core application features and user pathways",
        completed: false,
        subtopics: [
          { id: "sub_1_1", title: "User Authentication Flow", completed: true },
          { id: "sub_1_2", title: "Social Logins (Google)", completed: true },
          { id: "sub_1_3", title: "Email & Password Validation", completed: true },
        ],
      },
      {
        id: "item_2",
        topic: "File Upload System",
        description: "Document handling and storage constraints",
        completed: false,
        subtopics: [
          { id: "sub_2_1", title: "Payload parsing & file format checks", completed: false },
          { id: "sub_2_2", title: "Size limit validation up to 10MB", completed: false },
        ],
      },
      {
        id: "item_3",
        topic: "Technical Specifications",
        description: "Architectural guidelines & API contracts",
        completed: false,
        subtopics: [
          { id: "sub_3_1", title: "Next.js App Router API handlers", completed: true },
          { id: "sub_3_2", title: "Gemini 2.5 Flash model prompt tuning", completed: false },
        ],
      },
    ],
  },
  {
    id: "hist_2",
    title: "Onboarding Checklist Draft",
    fileName: "HR_Onboarding.pdf",
    fileSize: "850 KB",
    createdAt: "2026-10-08",
    modeUsed: "normal",
    summary: "Key milestones for first-week engineer onboarding.",
    progressPercent: 100,
    items: [
      {
        id: "onb_1",
        topic: "Workspace Setup & Credentials",
        description: "Set up machine and developer accounts",
        completed: true,
        subtopics: [],
      },
      {
        id: "onb_2",
        topic: "Repository Clone & Local Run",
        description: "Build and verify test suites",
        completed: true,
        subtopics: [],
      },
    ],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [user, setUser] = useState<UserProfile | null>(defaultUser);
  const [history, setHistory] = useState<SavedChecklist[]>([]);

  // Sync real next-auth session if logged in via Google
  useEffect(() => {
    if (sessionData?.user) {
      const u = sessionData.user;
      setUser({
        id: u.id,
        name: u.name || "Google User",
        email: u.email || "",
        avatar: u.image || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.email}`,
        defaultMode: "auto",
        darkMode: false,
        totalChecklists: 1,
        totalItemsCompleted: 2,
        currentStreak: 1,
        language: "English (US)",
      });
    }
  }, [sessionData]);

  // Initialize Auth & Data
  useEffect(() => {
    // 1. If Supabase configured, listen to real session
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const u = session.user;
          const userObj: UserProfile = {
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
            email: u.email || "",
            avatar: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.email}`,
            defaultMode: "auto",
            darkMode: false,
            totalChecklists: 0,
            totalItemsCompleted: 0,
            currentStreak: 1,
            language: "English (US)",
          };
          setUser(userObj);
          fetchSupabaseHistory(u.id);
        } else {
          loadLocalState();
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const userObj: UserProfile = {
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
            email: u.email || "",
            avatar: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.email}`,
            defaultMode: "auto",
            darkMode: false,
            totalChecklists: 0,
            totalItemsCompleted: 0,
            currentStreak: 1,
            language: "English (US)",
          };
          setUser(userObj);
          fetchSupabaseHistory(u.id);
        } else {
          loadLocalState();
        }
      });

      return () => subscription.unsubscribe();
    } else {
      loadLocalState();
    }
  }, []);

  const loadLocalState = () => {
    const savedUser = localStorage.getItem("clm_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    const savedHist = localStorage.getItem("clm_history");
    if (savedHist) {
      try {
        setHistory(JSON.parse(savedHist));
      } catch (e) {
        setHistory(initialHistoryMock);
      }
    } else {
      setHistory(initialHistoryMock);
    }
  };

  const fetchSupabaseHistory = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data && !error && data.length > 0) {
        const formatted: SavedChecklist[] = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          title: d.title,
          fileName: d.file_name,
          fileSize: d.file_size,
          createdAt: d.created_at.split("T")[0],
          modeUsed: d.mode_used,
          autoModeRationale: d.auto_mode_rationale,
          summary: d.summary,
          progressPercent: d.progress_percent,
          items: d.items,
        }));
        setHistory(formatted);
      } else {
        loadLocalState();
      }
    } catch (e) {
      loadLocalState();
    }
  };

  const saveChecklist = async (newChecklist: SavedChecklist) => {
    setHistory((prev) => {
      const updated = [newChecklist, ...prev.filter((c) => c.id !== newChecklist.id)];
      localStorage.setItem("clm_history", JSON.stringify(updated));
      return updated;
    });

    if (supabase && user?.id) {
      await supabase.from("checklists").upsert({
        id: newChecklist.id,
        user_id: user.id,
        title: newChecklist.title,
        file_name: newChecklist.fileName,
        file_size: newChecklist.fileSize,
        mode_used: newChecklist.modeUsed,
        auto_mode_rationale: newChecklist.autoModeRationale,
        summary: newChecklist.summary,
        progress_percent: newChecklist.progressPercent,
        items: newChecklist.items,
        updated_at: new Date().toISOString(),
      });
    }
  };

  const updateChecklist = async (updated: SavedChecklist) => {
    setHistory((prev) => {
      const next = prev.map((item) => (item.id === updated.id ? updated : item));
      localStorage.setItem("clm_history", JSON.stringify(next));
      return next;
    });

    if (supabase && user?.id) {
      await supabase.from("checklists").update({
        progress_percent: updated.progressPercent,
        items: updated.items,
        updated_at: new Date().toISOString(),
      }).eq("id", updated.id);
    }
  };

  const deleteChecklist = async (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem("clm_history", JSON.stringify(next));
      return next;
    });

    if (supabase) {
      await supabase.from("checklists").delete().eq("id", id);
    }
  };

  const getChecklistById = (id: string) => {
    return history.find((item) => item.id === id);
  };

  const loginWithGoogle = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        console.error("Google sign-in error:", error);
      }
    } else {
      // Local demo fallback if keys not entered yet
      const newUser: UserProfile = {
        ...defaultUser,
        name: "Google User",
        email: "google.user@example.com",
      };
      setUser(newUser);
      localStorage.setItem("clm_user", JSON.stringify(newUser));
    }
  };

  const loginWithEmail = async (email: string, password?: string) => {
    if (supabase && password) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } else {
      const newUser: UserProfile = {
        ...defaultUser,
        email,
        name: email.split("@")[0],
      };
      setUser(newUser);
      localStorage.setItem("clm_user", JSON.stringify(newUser));
    }
  };

  const signupWithEmail = async (email: string, password?: string, fullName?: string) => {
    if (supabase && password) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
    } else {
      const newUser: UserProfile = {
        ...defaultUser,
        email,
        name: fullName || email.split("@")[0],
      };
      setUser(newUser);
      localStorage.setItem("clm_user", JSON.stringify(newUser));
    }
  };

  const logout = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
    } catch (e) {}
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem("clm_user");
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        history,
        saveChecklist,
        updateChecklist,
        deleteChecklist,
        getChecklistById,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
