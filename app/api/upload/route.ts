import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { s3Client, BUCKET_NAME } from "@/lib/s3-client";

export async function POST(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await request.json();
    const { filename, filetype } = body;

    if (!filename || !filetype) {
      return NextResponse.json(
        { error: "Missing filename or filetype" },
        { status: 400, headers }
      );
    }

    const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const fileExt = sanitized.split(".").pop();
    const key = `uploads/${randomUUID()}.${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: filetype,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900,
    });

    return NextResponse.json(
      {
        presignedUrl,
        fileKey: key,
        publicUrl: `https://${BUCKET_NAME}.s3.filebase.io/${key}`,
      },
      { headers }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500, headers }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
      }
