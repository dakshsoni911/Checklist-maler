import React from "react";
import Link from "next/link";
import { CheckSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-6 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <div className="w-4 h-4 rounded bg-slate-900 flex items-center justify-center text-white">
            <CheckSquare className="w-3 h-3 stroke-[2.5]" />
          </div>
          <span>ChecklistMaker</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-slate-800 transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-slate-800 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-slate-800 transition-colors">
            Contact Support
          </Link>
        </div>

        <div>
          © 2026 ChecklistMaker. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
