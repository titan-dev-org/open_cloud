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

    const shareData = await getShareData(shareId);
    console.log("📦 Share data:", shareData);

    if (!shareData || !shareData.files || shareData.files.length === 0) {
      return NextResponse.json(
        { error: "Link tidak valid atau telah kadaluarsa" },
        { status: 404 }
      );
    }

    // Generate Presigned URL untuk setiap file
    const filesWithUrls = await Promise.all(
      shareData.files.map(async (file) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.key,
        });

        const downloadUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          ...file,
          downloadUrl,
        };
      })
    );

    // Increment download count (async)
    incrementDownloads(shareId).catch(console.error);

    return NextResponse.json({
      files: filesWithUrls,
      totalFiles: filesWithUrls.length,
      shareId,
    });
  } catch (error) {
    console.error("❌ Share error:", error);
    return NextResponse.json(
      { error: "Failed to get files" },
      { status: 500 }
    );
  }
}
