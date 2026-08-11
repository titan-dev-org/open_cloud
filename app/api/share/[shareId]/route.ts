import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";
import { getShareData } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = await params;
    const shareData = getShareData(shareId);

    if (!shareData) {
      return NextResponse.json(
        { error: "Link tidak valid atau telah kadaluarsa" },
        { status: 404 }
      );
    }

    const { fileId } = shareData;

    // Generate Presigned URL untuk download
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileId,
    });

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({
      downloadUrl,
      fileKey: fileId,
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json(
      { error: "Failed to get file" },
      { status: 500 }
    );
  }
      }
