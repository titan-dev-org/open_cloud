import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fileId } = params

  try {
    const { password, expiry } = await request.json()

    const shareId = Math.random().toString(36).substring(2, 10)

    let expiresAt = null
    if (expiry && expiry !== "never") {
      const days = parseInt(expiry)
      const date = new Date()
      date.setDate(date.getDate() + days)
      expiresAt = date.toISOString()
    }

    // Update file with share info
    const { error } = await supabase
      .from("files")
      .update({
        share_id: shareId,
        share_password: password || null,
        share_expiry: expiry || "7d",
        share_created_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${shareId}`

    return NextResponse.json({ shareId, shareUrl })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
                              }
