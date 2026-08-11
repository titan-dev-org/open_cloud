import { NextRequest, NextResponse } from "next/server";
import { createShareLink } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { fileIds, password, expiry } = await request.json();

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: "fileIds required (array of file ids)" },
        { status: 400 }
      );
    }

    const shareId = await createShareLink(fileIds, password, expiry);
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`;

    return NextResponse.json({
      shareId,
      shareUrl,
      fileCount: fileIds.length,
    });
  } catch (error) {
    console.error("Create share error:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
        }
