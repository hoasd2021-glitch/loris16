
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { PRODUCTS } from "../constants";
import { Product } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chatSession: Chat | null = null;
let currentProducts: Product[] = [...PRODUCTS];

export const updateAIProducts = (products: Product[]) => {
  currentProducts = products;
  chatSession = null; // Reset session to force new system instruction
};

const getSystemInstruction = () => `
أنت "مساعد متجر الحسام"، خبير مبيعات ذكي وودود.
هدف: مساعدة العملاء في العثور على المنتجات، الإجابة على استفساراتهم حول المخزون، وتقديم توصيات.

لديك حق الوصول إلى قائمة المنتجات التالية في المتجر (بصيغة JSON):
${JSON.stringify(currentProducts)}

القواعد:
1. تحدث باللغة العربية دائماً وبلهجة ودودة ومحترفة.
2. استخدم فقط المعلومات المقدمة في قائمة المنتجات للإجابة على الأسئلة حول الأسعار والمواصفات.
3. إذا سأل العميل عن منتج غير موجود، اعتذر بأدب واقترح بديلاً إذا كان متاحاً في القائمة.
4. حافظ على الإجابات موجزة ومفيدة.
5. يمكنك تنسيق الإجابة باستخدام Markdown بسيط (مثل القوائم النقطية).

مثال:
المستخدم: "هل لديكم ساعات؟"
أنت: "نعم، لدينا ساعة ذكية رياضية بسعر 450 ريال. تتميز بتتبع اللياقة ونبضات القلب."
`;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: getSystemInstruction(),
        temperature: 0.7,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chat = getChatSession();
  try {
    const stream = await chat.sendMessageStream({ message });
    return stream;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
