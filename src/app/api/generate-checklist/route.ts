import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

export const maxDuration = 60; // Allow sufficient time for processing documents

const ChecklistSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, descriptive title for the checklist based on the document",
    },
    modeUsed: {
      type: Type.STRING,
      description: "The list mode applied: 'normal' (main topics only) or 'detailed' (topics with subtopics breakdown)",
    },
    autoModeRationale: {
      type: Type.STRING,
      description: "If mode requested was 'auto', a brief explanation (1 sentence) why 'normal' or 'detailed' was chosen based on content density/complexity. Otherwise leave empty.",
    },
    summary: {
      type: Type.STRING,
      description: "A 1-2 sentence overview of the content analyzed",
    },
    items: {
      type: Type.ARRAY,
      description: "The list of topics/checklist items extracted from the document",
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "Unique string id for the item, e.g. item_1",
          },
          topic: {
            type: Type.STRING,
            description: "The main topic or actionable checklist item title",
          },
          description: {
            type: Type.STRING,
            description: "Brief contextual note or key requirement for this item",
          },
          subtopics: {
            type: Type.ARRAY,
            description: "Sub-items or finer action points (should be populated if mode is detailed, or empty array if normal)",
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "Unique string id for the subtopic, e.g. item_1_sub_1",
                },
                title: {
                  type: Type.STRING,
                  description: "Subtopic title or specific task",
                },
              },
              required: ["id", "title"],
            },
          },
        },
        required: ["id", "topic", "description", "subtopics"],
      },
    },
  },
  required: ["title", "modeUsed", "summary", "items"],
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = (formData.get("mode") as string) || "auto"; // "detailed" | "normal" | "auto"
    // Use master backend Gemini API key securely from process.env
    const apiKey = process.env.GEMINI_API_KEY || (formData.get("apiKey") as string);
    const rawText = formData.get("text") as string | null;
    const file = formData.get("file") as File | null;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Backend Gemini API key is missing. Please add your GEMINI_API_KEY in the server .env.local file.",
        },
        { status: 500 }
      );
    }

    if (!file && (!rawText || rawText.trim().length === 0)) {
      return NextResponse.json(
        { error: "Please provide either a file (PDF, image, text) or pasted content." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents: any[] = [];

    // System instruction & prompt definition
    let modeInstruction = "";
    if (mode === "normal") {
      modeInstruction = `The user selected NORMAL mode: Extract ONLY high-level main topics/checkpoints. Do NOT include subtopics (leave subtopics as an empty list [] for all items). Keep items concise and focused on high-level milestones or core subjects.`;
    } else if (mode === "detailed") {
      modeInstruction = `The user selected DETAILED mode: Deconstruct the material thoroughly into main topics AND detailed subtopics / sub-action items. Every main topic should include specific, concrete subtopics.`;
    } else {
      modeInstruction = `The user selected AUTO mode: 
First, analyze the complexity, length, and depth of the provided document or text:
- If the content is brief, high-level, a simple list, or a concise overview: choose 'normal' mode (extract only main topics, subtopics empty).
- If the content is multi-layered, technical, a comprehensive study guide, a lengthy report, a multi-step project plan, or detailed documentation: choose 'detailed' mode (include both main topics and nested subtopics).
State your chosen mode in 'modeUsed' and describe your rationale in 'autoModeRationale'.`;
    }

    const systemPrompt = `You are an expert document analyzer and intelligent checklist curator.
Your task is to analyze the provided document/text and generate an organized, actionable checklist of topics and tasks.

Rules:
${modeInstruction}
- Make sure checklist items are directly grounded in the content.
- Ensure unique IDs for all items and subtopics.
- Return structured data strictly matching the requested JSON schema.`;

    contents.push({ text: systemPrompt });

    // Handle uploaded file or text
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");
      const mimeType = file.type || "application/octet-stream";

      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      });

      contents.push({
        text: `Analyze this uploaded document (${file.name}, mime: ${mimeType}) and produce the structured checklist according to the mode rules.`,
      });
    }

    if (rawText && rawText.trim().length > 0) {
      contents.push({
        text: `Additional or direct text content provided:\n"""\n${rawText}\n"""\nAnalyze this content and generate the structured checklist.`,
      });
    }

    // Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: ChecklistSchema,
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      return NextResponse.json(
        { error: "Model returned an empty response. Please try again or check the file format." },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (err: any) {
    console.error("Checklist generation error:", err);
    return NextResponse.json(
      {
        error:
          err.message ||
          "An error occurred while analyzing the document with Gemini. Please check your API key and file size.",
      },
      { status: 500 }
    );
  }
}
