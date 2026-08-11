import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { getShareData, incrementDownloads } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;
    console.log("🔍 Accessing share:", shareId);

    // Get share data from Supabase
    const shareData = await getShareData(shareId);
    console.log("📦 Share data:", shareData);

    if (!shareData || !shareData.file) {
      return NextResponse.json(
        { error: "Link tidak valid atau telah kadaluarsa" },
        { status: 404 }
      );
    }

    const { file } = shareData;

    // Generate Presigned URL untuk download
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.key,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Increment download count (async, jangan tunggu)
    incrementDownloads(shareId).catch(console.error);

    return NextResponse.json({
      downloadUrl,
      fileKey: file.key,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.mime_type,
    });
  } catch (error) {
    console.error("❌ Share error:", error);
    return NextResponse.json(
      { error: "Failed to get file" },
      { status: 500 }
    );
  }
}
