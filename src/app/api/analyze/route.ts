import { NextRequest, NextResponse } from "next/server";
import { analyzeFoodImage, type NutritionResult } from "@/lib/gemini";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const nutrition: NutritionResult = await analyzeFoodImage(
      base64,
      file.type
    );

    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${timestamp}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("food-photos")
      .upload(fileName, bytes, { contentType: file.type });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload photo" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("food-photos")
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase.from("scans").insert({
      foto_url: urlData.publicUrl,
      nama_makanan: nutrition.nama_makanan,
      estimasi_porsi: nutrition.estimasi_porsi,
      kalori: nutrition.kalori,
      protein_g: nutrition.protein_g,
      karbohidrat_g: nutrition.karbohidrat_g,
      lemak_g: nutrition.lemak_g,
    });

    if (dbError) {
      console.error("DB error:", dbError);
      return NextResponse.json(
        { error: "Failed to save scan data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: nutrition });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
