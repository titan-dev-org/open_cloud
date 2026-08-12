import { NextRequest, NextResponse } from "next/server";
import { createShareLink } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 Request body:", body);

    const { fileIds, password, expiry } = body;

    // Validasi
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      console.log("❌ Invalid fileIds:", fileIds);
      return NextResponse.json(
        { error: "fileIds required (array of file ids, minimum 1)" },
        { status: 400 }
      );
    }

    console.log(`📦 Creating share for ${fileIds.length} files`);

    const shareId = await createShareLink(fileIds, password, expiry);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`;

    console.log("✅ Share created successfully:", shareId);

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      fileCount: fileIds.length,
    });
  } catch (error) {
    console.error("❌ Create share error:", error);
    return NextResponse.json(
      { error: "Failed to create share link: " + (error as Error).message },
      { status: 500 }
    );
  }
}
