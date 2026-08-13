import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fileId } = params

  // Soft delete - move to trash
  const { error } = await supabase
    .from("files")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", fileId)
    .eq("user_id", user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { fileId } = params
    const body = await request.json()
    const { name, folderId, isStarred } = body

    const updateData: any = {}
    if (name) updateData.name = name
    if (folderId !== undefined) updateData.folder_id = folderId
    if (isStarred !== undefined) updateData.is_starred = isStarred
    updateData.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from("files")
      .update(updateData)
      .eq("id", fileId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
    }
