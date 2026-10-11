"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Sliders, Shield, Bell, LogOut, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useApp();

  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "security" | "notifications">("account");
  const [displayName, setDisplayName] = useState(user?.name || "John Doe");
  const [email, setEmail] = useState(user?.email || "john.doe@example.com");
  const [defaultMode, setDefaultMode] = useState<"auto" | "normal" | "detailed">(user?.defaultMode || "auto");
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        name: displayName,
        email: email,
        defaultMode: defaultMode,
        darkMode: darkMode,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
        Settings
      </h1>

      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
        {/* Left Settings Sidebar */}
        <div className="md:col-span-4 border-r border-slate-150 p-4 bg-slate-50/40 flex flex-col justify-between">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === "account"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <User className="w-4 h-4" /> Account
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === "preferences"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Sliders className="w-4 h-4" /> Preferences
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === "security"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Shield className="w-4 h-4" /> Data & Privacy
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-colors ${
                activeTab === "notifications"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
          </div>

          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-8 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Right Settings Body matching wireframe */}
        <div className="md:col-span-8 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
              Account Settings
            </h3>

            <div className="flex flex-col gap-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Change Password
                </button>
              </div>

              <div className="h-px bg-slate-150 my-2" />

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Preferences
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Default Generation Mode
                </label>
                <select
                  value={defaultMode}
                  onChange={(e) => setDefaultMode(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="detailed">Detailed</option>
                  <option value="normal">Normal</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Dark Mode</span>
                  <span className="text-[11px] text-slate-400">Switch to dark theme UI</span>
                </div>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-150 mt-6">
            <button
              type="button"
              className="text-xs font-semibold text-rose-500 hover:text-rose-600"
            >
              Delete account
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Saved!
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
