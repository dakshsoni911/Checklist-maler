"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Plus, FileText, ChevronRight, Share2, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function HistoryPage() {
  const { history, deleteChecklist } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const filteredHistory = history
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.fileName && item.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesMode = filterMode === "all" || item.modeUsed === filterMode;
      return matchesSearch && matchesMode;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8">
      {/* Title & "New Checklist" button matching wireframe */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Your History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage and access your past checklists.
          </p>
        </div>

        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Checklist</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title or file name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Modes</option>
            <option value="detailed">Detailed</option>
            <option value="normal">Normal</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* History Grid matching wireframe cards */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">No checklists found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try adjusting your search query or generate a new checklist.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Create Checklist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-700 shrink-0">
                      <FileText className="w-4 h-4 text-slate-800" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-slate-700 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {item.createdAt} • {item.modeUsed.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteChecklist(item.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div>
                {/* Progress bar inside card */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                  <span>{item.progressPercent}% completed</span>
                  <span>{item.items.length} sections</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>

                {/* Card actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={`/result/${item.id}`}
                    className="text-center py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/result/${item.id}`
                      );
                      alert("Checklist link copied to clipboard!");
                    }}
                    className="text-center py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
