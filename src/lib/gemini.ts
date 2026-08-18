import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type NutritionResult = {
  nama_makanan: string;
  estimasi_porsi: string;
  kalori: number;
  protein_g: number;
  karbohidrat_g: number;
  lemak_g: number;
};

const NUTRITION_PROMPT = `Kamu adalah ahli gizi. Analisa foto makanan ini dan kembalikan hasil dalam format JSON murni (tanpa markdown, tanpa code block) dengan struktur seperti ini:

{
  "nama_makanan": "nama makanan",
  "estimasi_porsi": "ukuran porsi",
  "kalori": angka,
  "protein_g": angka,
  "karbohidrat_g": angka,
  "lemak_g": angka
}

Pastikan semua nilai numerik berupa angka (bukan string). Jika ada beberapa makanan, gabung jadi satu estimasi. Jangan tambahkan penjelasan lain, hanya JSON.`;

export async function analyzeFoodImage(
  imageBase64: string,
  mimeType: string
): Promise<NutritionResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent([
    NUTRITION_PROMPT,
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  const response = result.response.text().trim();

  const cleaned = response
    .replace(/^```json\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  return JSON.parse(cleaned) as NutritionResult;
}
