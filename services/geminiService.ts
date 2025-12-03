import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// نقرأ الـ API key من Vite env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY environment variable is missing.");
}

// نهيّأ الكلاينت بتاع Gemini
const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });

const shotTypeInstructions: Record<string, string> = {
    'close-up': 'Focus the description on a close-up shot, emphasizing facial expression and small details.',
    'medium': 'Frame the description as a medium shot, from the subject\'s waist up, showing their interaction with the immediate surroundings.',
    'full-body': 'Describe the scene as a full-body shot, detailing their posture and how they fit into the environment.',
    'environmental': 'Describe a wide, environmental scene where the subject is a small but important element, emphasizing the atmosphere and scale of the location.',
};

export const expandPrompt = async (
    shortPrompt: string,
    persona: string,
    shotType: string
): Promise<string> => {
    let personaDescription = 'A person';
    switch (persona) {
        case 'man': personaDescription = 'A man'; break;
        case 'woman': personaDescription = 'A woman'; break;
        case 'woman_hijabi': personaDescription = 'A woman wearing a stylish hijab'; break;
        case 'child_boy': personaDescription = 'A young boy'; break;
        case 'child_girl': personaDescription = 'A young girl'; break;
    }

    const shotInstruction = shotType === 'random' ? '' : (shotTypeInstructions[shotType] || '');

    const systemInstruction = `You are a creative director specialized in modern, realistic Egyptian lifestyle photography. 
Your job is to take a short idea and turn it into a vivid, cinematic scene description that feels authentic, unposed, and full of realistic detail. ${shotInstruction}

Rules:
- The final scene MUST be set in modern-day, contemporary Egypt. No clichés, no pyramids unless the user explicitly requests them.
- The environment, clothing, and people should reflect Egypt today, not a historical or stereotypical version.
- The output MUST be a single, continuous paragraph.
- Do NOT use lists or bullet points.
- Describe a natural, candid activity related to the user's idea.
- Include specific details about the environment, lighting, and clothing that fit the scene.
- Weave in a subtle, realistic photographic effect (like soft motion blur, awkward framing, lens flare) to enhance the candid feel.
- The tone should be descriptive and narrative.`;

    const expansionRequest = `User's Idea: "${shortPrompt}".
Subject: ${personaDescription}.

Expand this into a full scene description.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: expansionRequest,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
            }
        });

        // نحاول نطلع النص بأمان
        const text = (response as GenerateContentResponse).text?.() ?? "";
        if (!text.trim()) {
            throw new Error("Gemini لم يرجع أي نص.");
        }
        return text.trim();
    } catch (error) {
        console.error("Error in expandPrompt:", error);
        throw new Error("حدث خطأ أثناء توسيع البرومبت. يرجى المحاولة مرة أخرى.");
    }
};

export const generateExpandedImage = async (
    prompt: string,
    aspectRatio: string,
    style: string
): Promise<string> => {
    let aestheticInstructions = '';

    switch (style) {
        case 'candid':
            aestheticInstructions = `
**Aesthetic Mandate: The 'Candid Masterpiece' - Professional Documentary Style.** 
    *   **The Scenario:** A world-class documentary photographer capturing a decisive moment.
    *   **Technical Perfection:** Masterful composition, tack-sharp subject, beautiful bokeh.
    *   **Clarity & Emotion:** Pristine, detailed, free of accidental flaws.
    *   **CRITICAL QUALITY NOTE:** The image must be ULTRA-SHARP, HIGH RESOLUTION, and extremely detailed. 8k resolution style.
        `;
            break;
        default:
            aestheticInstructions = `
**Aesthetic Mandate: Clean Cinematic Photography.**
    * Beautiful natural light, rich but realistic colors.
    * High resolution, clear faces, no weird distortions.
    * Inspired by high-end editorial photography.`;
            break;
    }

    let frameAnalogy = '';
    let expansionDirection = '';
    switch (aspectRatio) {
        case '9:16':
            frameAnalogy = 'You are a filmmaker shooting a vertical scene for a phone. The frame is rigidly fixed at a 9:16 aspect ratio.';
            expansionDirection = 'Since the reference image may be closer to a square, you must expand the world above and below the subject to perfectly fill the tall 9:16 frame.';
            break;
        case '16:9':
            frameAnalogy = 'You are a cinematographer shooting a widescreen movie. The frame is rigidly fixed at a 16:9 aspect ratio.';
            expansionDirection = 'Since the reference image may be closer to a square, you must expand the world to the left and right to perfectly fill the wide 16:9 frame.';
            break;
        default:
            frameAnalogy = 'The frame has a fixed aspect ratio. You must respect it perfectly.';
            expansionDirection = 'Expand the world around the subject so that the full frame is naturally filled.';
            break;
    }

    const fullTextPrompt = `
You are generating a brand-new, high-resolution photograph that must perfectly match an exact aspect ratio: ${aspectRatio}.

${frameAnalogy}

${expansionDirection}

**SCENE DESCRIPTION:** "${prompt}"

**AESTHETIC STYLE:**
${aestheticInstructions}

**SUBTLE TEXT:**
Subtly integrate "M.Hefny" into the scene's environment (e.g., on a coffee cup, a faded sign), not as a watermark.

**FINAL CHECK:** 
1. Does my final image perfectly match the ${aspectRatio} aspect ratio? 
2. Is the image HIGH RESOLUTION and clear, avoiding any low-quality blur or pixelation?
If not, you have failed.
`;

    const model = 'gemini-2.5-flash-image';

    try {
        const response = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: fullTextPrompt,
                        },
                    ],
                },
            ],
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            let errorDetails = "حدث خطأ غير متوقع ولم يتم إنشاء الصورة. يرجى المحاولة مرة أخرى.";
            const feedback = response.promptFeedback;
            if (feedback?.blockReason) {
                const blockReasonText =
                    feedback.blockReason === 'SAFETY'
                        ? 'تم رفض الطلب بسبب سياسات السلامة في جوجل (Safety Policies).'
                        : String(feedback.blockReason);
                errorDetails += ` سبب الرفض: ${blockReasonText}.`;
            }
            console.error("API response missing candidates:", response);
            throw new Error(errorDetails);
        }

        const firstCandidate = response.candidates[0];
        if (!firstCandidate.content || !firstCandidate.content.parts) {
            let errorDetails = "لم يتم العثور على أي محتوى في استجابة النموذج.";
            if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
                errorDetails += ` سبب الإنهاء: ${firstCandidate.finishReason}.`;
            }
            console.error("API response missing content:", firstCandidate);
            throw new Error(errorDetails);
        }

        const imagePart = firstCandidate.content.parts.find(part => (part as any).inlineData);

        if (!imagePart || !(imagePart as any).inlineData) {
            let errorDetails = "لم يتم العثور على بيانات الصورة في الاستجابة. ربما رفض النموذج الطلب بسبب المحتوى.";
            if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP') {
                const finishReasonText =
                    firstCandidate.finishReason === 'SAFETY'
                        ? 'مخالف لسياسات السلامة'
                        : String(firstCandidate.finishReason);
                errorDetails += ` سبب الإنهاء: ${finishReasonText}.`;
            }
            console.error("API response missing image data:", firstCandidate);
            throw new Error(errorDetails);
        }

        const imageData = (imagePart as any).inlineData.data as string | undefined;
        if (!imageData) {
            throw new Error("Image data is missing from the Gemini response.");
        }
        return imageData;
    } catch (error) {
        console.error("Error calling Gemini API:", error);

        let errorMessage: string = "حدث خطأ فني. يرجى المحاولة مرة أخرى لاحقًا.";
        let rawMessage: string = "";
        let isHandled = false;

        try {
            if (error instanceof Error) {
                rawMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                rawMessage = JSON.stringify(error);
            } else {
                rawMessage = String(error);
            }

            if (rawMessage) {
                if (rawMessage.includes("RESOURCE_EXHAUSTED")) {
                    errorMessage = "لقد تجاوزت الحصة المحددة لك من الاستهلاك (Quota). يرجى المحاولة مرة أخرى لاحقًا أو التحقق من خطة الفوترة الخاصة بك.";
                    isHandled = true;
                } else if (rawMessage.includes("PERMISSION_DENIED")) {
                    errorMessage = "خطأ في الأذونات. يرجى التحقق من مفتاح الواجهة البرمجية (API Key) الخاص بك.";
                    isHandled = true;
                } else if (rawMessage.includes("API key not valid")) {
                    errorMessage = "مفتاح الواجهة البرمجية (API Key) غير صالح. يرجى التحقق منه.";
                    isHandled = true;
                } else {
                    const lowerMsg = rawMessage.toLowerCase();
                    if (lowerMsg.includes("fetch failed") || lowerMsg.includes("network error")) {
                        errorMessage = "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
                        isHandled = true;
                    }
                }
            }
        } catch {
            // تجاهل أي خطأ في تحليل الرسالة الخام
        }

        if (!isHandled) {
            const isArabic = /[\u0600-\u06FF]/.test(rawMessage);
            if (isArabic) {
                errorMessage = rawMessage;
            }
        }

        throw new Error(errorMessage);
    }
};
