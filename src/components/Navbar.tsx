"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { CheckSquare, Menu, X, User as UserIcon, LogOut, Settings as SettingsIcon, Clock } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdown(false);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  return (
    <>
      <header className="border-b border-slate-150 bg-white sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 tracking-tight text-lg">
          <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white">
            <CheckSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>ChecklistMaker</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/"
            className={`transition-colors hover:text-slate-900 ${
              pathname === "/" ? "text-slate-900 font-semibold" : ""
            }`}
          >
            How it works
          </Link>
          <Link
            href="/history"
            className={`transition-colors hover:text-slate-900 ${
              pathname === "/history" ? "text-slate-900 font-semibold" : ""
            }`}
          >
            History
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 pl-2 text-slate-800 hover:text-slate-900 cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover bg-slate-100"
                />
                <span className="text-sm font-medium">{user.name}</span>
              </button>

              {userDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setUserDropdown(false)}
                >
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                    Settings
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    My Checklists
                  </Link>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-slate-700 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-6 py-4 flex flex-col gap-3 text-sm z-30 shadow-md">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 text-slate-700 font-medium"
          >
            Home / Generator
          </Link>
          <Link
            href="/history"
            onClick={() => setMobileMenuOpen(false)}
            className="py-1.5 text-slate-700 font-medium"
          >
            History
          </Link>
          <div className="h-px bg-slate-100 my-1" />
          {user ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-slate-700 font-medium flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" /> Profile ({user.name})
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 text-slate-700 font-medium flex items-center gap-2"
              >
                <SettingsIcon className="w-4 h-4" /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-left py-1.5 text-rose-600 font-medium flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 text-center rounded-lg border border-slate-300 font-medium text-slate-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2 text-center rounded-lg bg-slate-900 font-medium text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
