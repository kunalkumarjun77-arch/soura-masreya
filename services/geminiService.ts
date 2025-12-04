// services/geminiService.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// اقرأ الـ API key من Vite env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? "";

if (!apiKey) {
  console.warn(
    "VITE_GEMINI_API_KEY is missing. Set it in .env.local locally and in Vercel -> Project Settings -> Environment Variables."
  );
}

// نهيّأ الكلاينت والموديلات
const genAI = new GoogleGenerativeAI(apiKey);

const textModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const imageModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const shotTypeInstructions: Record<string, string> = {
  "close-up":
    "Focus the description on a close-up shot, emphasizing facial expression and small details.",
  medium:
    "Frame the description as a medium shot, from the subject's waist up, showing their interaction with the immediate surroundings.",
  "full-body":
    "Describe the scene as a full-body shot, detailing their posture and how they fit into the environment.",
  environmental:
    "Describe a wide, environmental scene where the subject is a small but important element, emphasizing the atmosphere and scale of the location.",
};

// ---------------------- توسيع البرومبت النصي ----------------------

export const expandPrompt = async (
  shortPrompt: string,
  persona: string,
  shotType: string
): Promise<string> => {
  let personaDescription = "A person";
  switch (persona) {
    case "man":
      personaDescription = "A man";
      break;
    case "woman":
      personaDescription = "A woman";
      break;
    case "woman_hijabi":
      personaDescription = "A woman wearing a stylish hijab";
      break;
    case "child_boy":
      personaDescription = "A young boy";
      break;
    case "child_girl":
      personaDescription = "A young girl";
      break;
  }

  const shotInstruction =
    shotType === "random" ? "" : shotTypeInstructions[shotType] || "";

  const systemInstruction = `You are a creative director specialized in modern, realistic Egyptian lifestyle photography.
Your job is to take a short idea and turn it into a vivid, cinematic scene description that feels authentic, unposed, and full of realistic detail. ${shotInstruction}

Rules:
- The final scene MUST be set in modern-day, contemporary Egypt.
- No clichés or pharaonic stereotypes unless explicitly requested.
- The environment, clothing, and people should reflect Egypt today.
- The output MUST be a single, continuous paragraph.
- Do NOT use lists or bullet points.
- Describe a natural, candid activity related to the user's idea.
- Include specific details about the environment, lighting, and clothing.
- The tone should be descriptive and narrative.`;

  const promptText = `${systemInstruction}

User's idea: "${shortPrompt}"
Subject: ${personaDescription}.

Expand this into a full, detailed scene description.`;

  try {
    const result: any = await textModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
      },
    });

    const response: any = result.response;
    // هنا بنستخدم text() function من SDK الجديد – مش property
    const expandedText = ((response as any).text ?? "").toString().trim();


    const cleaned = (expandedText || "").toString().trim();

    if (!cleaned) {
      throw new Error("The model returned an empty description.");
    }

    return cleaned;
  } catch (error) {
    console.error("Error expanding prompt:", error);
    throw new Error("فشل في توسيع وصف المشهد.");
  }
};

// ---------------------- توليد الصورة ----------------------

export const generateCandidImage = async (
  prompt: string,
  base64Image: string,
  mimeType: string,
  aesthetic: string,
  aspectRatio: string
): Promise<string> => {
  const aestheticInstructions =
    aesthetic === "candid"
      ? "Candid, documentary-style photography. Natural light, unposed, realistic expressions."
      : "Clean cinematic photography with realistic colors and natural light.";

  const fullPrompt = `
You are generating a brand-new, high-resolution photograph that must match aspect ratio: ${aspectRatio}.

SCENE DESCRIPTION:
"${prompt}"

AESTHETIC STYLE:
${aestheticInstructions}

Subtly integrate the signature "M.Hefny" into the environment (for example on a coffee cup, shop sign, or small detail), not as a big watermark.
`.trim();

  try {
    const result: any = await imageModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: fullPrompt },
            {
              inlineData: {
                data: base64Image,
                mimeType,
              },
            },
          ],
        },
      ],
    });

    const response: any = result.response;
    const candidate = response?.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    const imagePart = parts.find(
      (p: any) => p.inlineData && p.inlineData.data
    );

    if (!imagePart || !imagePart.inlineData?.data) {
      throw new Error("لم يتم العثور على بيانات الصورة في استجابة Gemini.");
    }

    const imageData: string = imagePart.inlineData.data;
    return imageData;
  } catch (error: any) {
    console.error("Error generating image:", error);
    let msg = "حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى.";

    const raw = error?.message || String(error || "");
    if (raw.includes("RESOURCE_EXHAUSTED")) {
      msg =
        "تم استهلاك الكوتا الخاصة بـ Google Gemini (RESOURCE_EXHAUSTED). جرّب لاحقًا أو حدّث البيلينج.";
    } else if (raw.includes("PERMISSION_DENIED")) {
      msg =
        "هناك مشكلة في صلاحيات الـ API Key (PERMISSION_DENIED). تأكد من المفتاح والبروجيكت.";
    } else if (raw.includes("API key not valid")) {
      msg = "مفتاح الـ API غير صحيح أو منتهي. راجع Google AI Studio.";
    }

    throw new Error(msg);
  }
};

// alias احتياطي علشان TypeScript suggestion "Did you mean 'generateExpandedImage'?"
export const generateExpandedImage = generateCandidImage;
