import { NextRequest, NextResponse } from "next/server"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { s3Client, BUCKET_NAME } from "@/lib/s3-client"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  const { shareId } = params

  try {
    // Get share data
    const supabase = createClient()
    const { data: share, error: shareError } = await supabase
      .from("files")
      .select("*")
      .eq("share_id", shareId)
      .single()

    if (shareError || !share) {
      return NextResponse.json(
        { error: "File not found or share expired" },
        { status: 404 }
      )
    }

    // Check expiry
    if (share.share_expiry && share.share_expiry !== "never") {
      const created = new Date(share.share_created_at)
      const days = parseInt(share.share_expiry)
      const expiryDate = new Date(created.getTime() + days * 24 * 60 * 60 * 1000)
      if (expiryDate < new Date()) {
        return NextResponse.json(
          { error: "Share link has expired" },
          { status: 410 }
        )
      }
    }

    // Generate presigned URL
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: share.key,
    })

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    })

    return NextResponse.json({
      file: {
        id: share.id,
        name: share.name,
        size: share.size,
        mime_type: share.mime_type,
        uploaded_at: share.uploaded_at,
      },
      downloadUrl,
    })
  } catch (error) {
    console.error("Share error:", error)
    return NextResponse.json(
      { error: "Failed to get file" },
      { status: 500 }
    )
  }
      }
