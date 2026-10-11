"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const filename = searchParams.get("filename") || "Project_Data.csv";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 my-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 max-w-sm w-full shadow-xs text-center flex flex-col items-center">
        {/* Grey alert icon circle matching wireframe */}
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
          <AlertCircle className="w-6 h-6 stroke-[1.8]" />
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Unsupported File Type
        </h2>

        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          We couldn't process <strong className="text-slate-800">{filename}</strong>. Currently, we only support PDF, images (JPG/PNG), and plain text files.
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <Link
            href="/"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Try Again
          </Link>

          <button
            type="button"
            onClick={() => alert("Support ticket opened. Our team will contact you shortly!")}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            Contact Support
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 w-full text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            Common Solutions
          </span>
          <div className="flex flex-col gap-1 text-xs text-slate-500">
            <a href="#" className="hover:underline">How to convert files to PDF?</a>
            <a href="#" className="hover:underline">Maximum file size limits</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading error view...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
