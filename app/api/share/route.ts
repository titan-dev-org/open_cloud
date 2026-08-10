import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";

// Simulasi database (untuk production pake database beneran)
const shareLinks = new Map<string, { fileKey: string; createdAt: Date }>();

export async function POST(request: NextRequest) {
  try {
    const { fileKey } = await request.json();

    if (!fileKey) {
      return NextResponse.json({ error: "Missing fileKey" }, { status: 400 });
    }

    const shareId = randomUUID().slice(0, 8);
    shareLinks.set(shareId, { fileKey, createdAt: new Date() });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`;

    return NextResponse.json({ shareUrl, shareId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const shareId = request.nextUrl.searchParams.get("id");

  if (!shareId || !shareLinks.has(shareId)) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  const { fileKey } = shareLinks.get(shareId)!;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });

  return NextResponse.json({ downloadUrl, fileKey });
    }
