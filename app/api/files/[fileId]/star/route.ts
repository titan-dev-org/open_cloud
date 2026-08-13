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

  // Toggle star
  const { data: file, error: getError } = await supabase
    .from("files")
    .select("is_starred")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .single()

  if (getError) {
    return NextResponse.json({ error: getError.message }, { status: 500 })
  }

  const { error } = await supabase
    .from("files")
    .update({ is_starred: !file.is_starred })
    .eq("id", fileId)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, isStarred: !file.is_starred })
}
