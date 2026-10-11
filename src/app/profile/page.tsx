"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit2, Check, ArrowLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
  const { user, setUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "John Doe");
  const [email, setEmail] = useState(user?.email || "john.doe@example.com");

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-base font-bold text-slate-800">You are not logged in</h2>
        <Link
          href="/login"
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    setUser({ ...user, name, email });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
      {/* Top back */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-xs">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-slate-150">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full border-2 border-slate-100 object-cover bg-slate-100"
              />
            </div>

            <div>
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 text-sm font-bold text-slate-900"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-slate-200 rounded px-2 py-1 text-xs text-slate-600"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                  <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                </>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                  PRO MEMBER
                </span>
                <span className="text-[11px] text-slate-400">Joined Jan 2026</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Save Profile
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" /> Edit Profile
              </>
            )}
          </button>
        </div>

        {/* 3 Metric Cards matching wireframe */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div className="bg-slate-50/70 border border-slate-150 rounded-2xl p-5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Checklists
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {user.totalChecklists}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-150 rounded-2xl p-5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Items Completed
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {user.totalItemsCompleted}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-150 rounded-2xl p-5 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Current Streak
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {user.currentStreak} <span className="text-sm font-semibold text-slate-400">days</span>
            </div>
          </div>
        </div>

        {/* Account Details list */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Account Details
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Email</span>
              <span className="text-slate-900 font-semibold">{user.email}</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Language</span>
              <span className="text-slate-900 font-semibold">{user.language}</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Default Mode</span>
              <span className="text-slate-900 font-semibold uppercase">{user.defaultMode}</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Two-Factor Auth</span>
              <span className="text-emerald-600 font-semibold">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
