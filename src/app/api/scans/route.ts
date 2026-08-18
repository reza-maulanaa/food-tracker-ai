import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const date = searchParams.get("date");

    let query = supabase
      .from("scans")
      .select("*")
      .order("created_at", { ascending: false });

    if (date) {
      query = query
        .gte("created_at", `${date}T00:00:00`)
        .lt("created_at", `${date}T23:59:59`);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch scans" },
        { status: 500 }
      );
    }

    return NextResponse.json({ scans: data });
  } catch (error) {
    console.error("Scans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scans" },
      { status: 500 }
    );
  }
}
