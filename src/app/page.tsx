"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  ListTodo,
  Layers,
  Wand2,
  CheckCircle2,
  Cpu,
  FileCheck2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useApp, SavedChecklist } from "@/context/AppContext";

export default function HomePage() {
  const router = useRouter();
  const { saveChecklist } = useApp();

  const [mode, setMode] = useState<"auto" | "normal" | "detailed">("auto");
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading screen states matching wireframe: ChecklistMaker - Loading
  const [loadingStep, setLoadingStep] = useState("Reading your file...");
  const [loadingProgress, setLoadingProgress] = useState(25);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = [
      "pdf",
      "png",
      "jpg",
      "jpeg",
      "webp",
      "txt",
      "md",
      "csv",
      "json",
    ];
    const ext = selectedFile.name.split(".").pop()?.toLowerCase() || "";

    // If unsupported file type according to wireframe error:
    if (!validExtensions.includes(ext)) {
      router.push(`/error?filename=${encodeURIComponent(selectedFile.name)}`);
      return;
    }

    // Size limit check (10MB as in wireframe)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleGenerate = async () => {
    if (!file && !textInput.trim()) {
      setError("Please drop a file or paste text content to generate a checklist.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep("Reading your file...");
    setLoadingProgress(30);

    const stepTimer1 = setTimeout(() => {
      setLoadingStep("AI is analyzing and extracting key topics...");
      setLoadingProgress(65);
    }, 1800);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep("Formulating structured checkpoints...");
      setLoadingProgress(88);
    }, 3800);

    try {
      const formData = new FormData();
      formData.append("mode", mode);
      if (file) formData.append("file", file);
      if (textInput.trim()) formData.append("text", textInput.trim());

      const res = await fetch("/api/generate-checklist", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate checklist.");
      }

      const generatedData = data.data;

      // Construct saved checklist object
      const newSavedChecklist: SavedChecklist = {
        id: `chk_${Date.now()}`,
        title: generatedData.title || (file ? file.name.replace(/\.[^/.]+$/, "") : "Custom Checklist"),
        fileName: file ? file.name : undefined,
        fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
        createdAt: new Date().toISOString().split("T")[0],
        modeUsed: generatedData.modeUsed || (mode === "auto" ? "detailed" : mode),
        autoModeRationale: generatedData.autoModeRationale,
        summary: generatedData.summary || "Structured checklist extracted from provided content.",
        progressPercent: 0,
        items: generatedData.items.map((item: any) => ({
          ...item,
          completed: false,
          subtopics: (item.subtopics || []).map((sub: any) => ({
            ...sub,
            completed: false,
          })),
        })),
      };

      saveChecklist(newSavedChecklist);

      // Navigate to Result screen with the generated checklist ID
      router.push(`/result/${newSavedChecklist.id}`);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setError(err.message || "Failed to process document. Please check your API key.");
    }
  };

  // FULLSCREEN LOADING STATE MATCHING WIREFRAME: ChecklistMaker - Loading
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto min-h-[70vh]">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin flex items-center justify-center" />
          <FileText className="w-6 h-6 text-slate-800 absolute inset-0 m-auto" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {loadingStep}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mb-6">
          Our AI is scanning topics and curating your checklist. This usually takes 5-10 seconds.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-slate-900 h-full rounded-full transition-all duration-500"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>

        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-500 max-w-sm">
          💡 <span className="font-semibold text-slate-700">Tip:</span> Auto mode adapts seamlessly to short summaries or multi-page briefs!
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="pt-12 pb-8 px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn any document into a checklist
        </h1>
        <p className="text-sm md:text-base text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
          Upload a file or paste text, and we'll generate an actionable list of topics you can tick off.
        </p>
      </section>

      {/* Main Interactive Card */}
      <section className="max-w-2xl mx-auto w-full px-4 pb-16">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
          {/* File Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              file
                ? "border-slate-800 bg-slate-50/50"
                : "border-slate-300 hover:border-slate-400 bg-white"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.json"
              onChange={handleFileChange}
            />

            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-600">
              <UploadCloud className="w-5 h-5" />
            </div>

            {file ? (
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-slate-900 max-w-sm truncate">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400 mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drop to replace
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="mt-3 text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove file
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-800">
                  Drag and drop your file here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, Image, or Text (Max 10MB)
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
                >
                  Browse files
                </button>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-150" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Paste Text
            </span>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your text here..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
            />
          </div>

          {/* Choose Generation Mode */}
          <div className="mt-8">
            <h3 className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Choose Generation Mode
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Detailed */}
              <div
                onClick={() => setMode("detailed")}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === "detailed"
                    ? "border-slate-900 ring-1 ring-slate-900 bg-slate-50/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">Detailed</span>
                  </div>
                  {mode === "detailed" && (
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px]">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Main topics + deep subtopics for exhaustive coverage.
                </p>
              </div>

              {/* Normal */}
              <div
                onClick={() => setMode("normal")}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === "normal"
                    ? "border-slate-900 ring-1 ring-slate-900 bg-slate-50/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">Normal</span>
                  </div>
                  {mode === "normal" && (
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px]">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Focus on main topics only for a quick overview.
                </p>
              </div>

              {/* Auto */}
              <div
                onClick={() => setMode("auto")}
                className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between ${
                  mode === "auto"
                    ? "border-slate-900 ring-1 ring-slate-900 bg-slate-50/40"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900">Auto</span>
                  </div>
                  {mode === "auto" && (
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px]">
                      ✓
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  We'll pick the best fit based on your content.
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerate}
              className="w-full md:w-auto md:min-w-[240px] py-3 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              Generate Checklist
            </button>
          </div>
        </div>
      </section>

      {/* 3 Steps "How it works" Section from wireframe */}
      <section className="border-t border-slate-150 bg-white py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center mb-3">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Upload File</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Upload any PDF document, image file, or paste your raw text.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center mb-3">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">AI Analysis</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Our AI extracts key points, chapters, and topics from your file.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center mb-3">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Tick it off</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Interact with your new checklist and track real-time progress.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
