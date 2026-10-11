"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Copy,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Check,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useApp, SavedChecklist } from "@/context/AppContext";

function ResultContent({ id }: { id: string }) {
  const router = useRouter();
  const { getChecklistById, updateChecklist, history } = useApp();

  const [checklist, setChecklist] = useState<SavedChecklist | null>(null);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [currentMode, setCurrentMode] = useState<"detailed" | "normal" | "auto">("detailed");

  useEffect(() => {
    const item = getChecklistById(id);
    if (item) {
      setChecklist(item);
      setCurrentMode(item.modeUsed);
    } else if (history.length > 0) {
      setChecklist(history[0]);
      setCurrentMode(history[0].modeUsed);
    }
  }, [id, history, getChecklistById]);

  if (!checklist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">Checklist Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          This checklist might have been removed or hasn't been generated yet.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Back to Generator
        </Link>
      </div>
    );
  }

  // Calculate progress
  let totalTasks = 0;
  let finishedTasks = 0;
  checklist.items.forEach((item) => {
    totalTasks += 1;
    if (item.completed) finishedTasks += 1;
    item.subtopics?.forEach((sub) => {
      totalTasks += 1;
      if (sub.completed) finishedTasks += 1;
    });
  });
  const progressPercent = totalTasks > 0 ? Math.round((finishedTasks / totalTasks) * 100) : 0;

  const toggleMainTopic = (itemId: string) => {
    const updatedItems = checklist.items.map((item) => {
      if (item.id === itemId) {
        const nextState = !item.completed;
        // Optionally mark all subtopics to match
        const updatedSubs = item.subtopics?.map((s) => ({
          ...s,
          completed: nextState,
        })) || [];
        return {
          ...item,
          completed: nextState,
          subtopics: updatedSubs,
        };
      }
      return item;
    });

    const updatedChecklist = {
      ...checklist,
      progressPercent,
      items: updatedItems,
    };
    setChecklist(updatedChecklist);
    updateChecklist(updatedChecklist);

    if (finishedTasks + 1 >= totalTasks) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const toggleSubtopic = (itemId: string, subId: string) => {
    const updatedItems = checklist.items.map((item) => {
      if (item.id === itemId) {
        const updatedSubs = item.subtopics?.map((sub) =>
          sub.id === subId ? { ...sub, completed: !sub.completed } : sub
        );
        const allSubsDone = updatedSubs.every((s) => s.completed);
        return {
          ...item,
          completed: allSubsDone,
          subtopics: updatedSubs,
        };
      }
      return item;
    });

    const updatedChecklist = {
      ...checklist,
      progressPercent,
      items: updatedItems,
    };
    setChecklist(updatedChecklist);
    updateChecklist(updatedChecklist);
  };

  const toggleCollapse = (itemId: string) => {
    setCollapsedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const copyMarkdown = () => {
    let md = `# ${checklist.title}\n\n`;
    md += `> Mode: ${checklist.modeUsed.toUpperCase()}\n\n`;
    md += `${checklist.summary}\n\n---\n\n`;
    checklist.items.forEach((item) => {
      md += `- [${item.completed ? "x" : " "}] **${item.topic}**\n`;
      if (item.description) md += `  *${item.description}*\n`;
      item.subtopics?.forEach((sub) => {
        md += `  - [${sub.completed ? "x" : " "}] ${sub.title}\n`;
      });
      md += "\n";
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    let md = `# ${checklist.title}\n\n`;
    md += `> Mode: ${checklist.modeUsed.toUpperCase()}\n\n`;
    md += `${checklist.summary}\n\n---\n\n`;
    checklist.items.forEach((item) => {
      md += `- [${item.completed ? "x" : " "}] **${item.topic}**\n`;
      if (item.description) md += `  *${item.description}*\n`;
      item.subtopics?.forEach((sub) => {
        md += `  - [${sub.completed ? "x" : " "}] ${sub.title}\n`;
      });
      md += "\n";
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${checklist.title.replace(/\s+/g, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
      {/* Top back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: File Info, Generation Mode Selector, Actions */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* File Info Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              File Info
            </h4>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-150">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                <FileText className="w-5 h-5 text-slate-800" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {checklist.fileName || checklist.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {checklist.fileSize || "Text input"} • {checklist.createdAt}
                </p>
              </div>
            </div>
          </div>

          {/* Generation Mode Selector */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Generation Mode
            </h4>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setCurrentMode("detailed")}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentMode === "detailed"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Detailed
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode("normal")}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentMode === "normal"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setCurrentMode("auto")}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all ${
                  currentMode === "auto"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Actions
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyMarkdown}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>

              <button
                onClick={downloadMarkdown}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTAINER: Checklist & Progress */}
        <main className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
          {/* Header & Percentage */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-150">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {checklist.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Generated from document outline
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-slate-900">
                {progressPercent}%
              </span>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Completed
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="my-5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Checklist Sections / Topics */}
          <div className="flex flex-col gap-4 mt-6">
            {checklist.items.map((item, idx) => {
              const isCollapsed = collapsedItems.has(item.id);
              const showSubs = currentMode !== "normal" && item.subtopics && item.subtopics.length > 0;

              return (
                <div
                  key={item.id}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
                >
                  {/* Topic Header Row */}
                  <div className="p-4 flex items-start justify-between gap-3 bg-slate-50/50">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleMainTopic(item.id)}
                        className="mt-0.5 text-slate-400 hover:text-slate-800 transition-colors"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-slate-900 fill-slate-900 text-white" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div
                        className="cursor-pointer select-none"
                        onClick={() => toggleMainTopic(item.id)}
                      >
                        <h3
                          className={`text-sm font-bold tracking-tight ${
                            item.completed ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {idx + 1}. {item.topic}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {showSubs && (
                      <button
                        onClick={() => toggleCollapse(item.id)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Nested Subtopics */}
                  {showSubs && !isCollapsed && (
                    <div className="px-5 py-3 bg-white flex flex-col gap-2.5 border-t border-slate-150 pl-11">
                      {item.subtopics.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => toggleSubtopic(item.id, sub.id)}
                          className="flex items-center gap-2.5 cursor-pointer py-1 select-none group"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSubtopic(item.id, sub.id);
                            }}
                            className="text-slate-400 hover:text-slate-800 transition-colors"
                          >
                            {sub.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-slate-900" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`text-xs transition-colors ${
                              sub.completed
                                ? "line-through text-slate-400"
                                : "text-slate-700 group-hover:text-slate-900 font-medium"
                            }`}
                          >
                            {sub.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading checklist...</div>}>
      <ResultContent id={resolvedParams.id} />
    </React.Suspense>
  );
}
