import { NextRequest, NextResponse } from "next/server";
import { createShareLink } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { fileId, password, expiry } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "fileId required" },
        { status: 400 }
      );
    }

    const shareId = await createShareLink(fileId, password, expiry);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`;

    return NextResponse.json({
      shareId,
      shareUrl,
    });
  } catch (error) {
    console.error("Create share error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}
