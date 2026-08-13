import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const folderId = searchParams.get("folderId")
  const trash = searchParams.get("trash") === "true"
  const starred = searchParams.get("starred") === "true"

  let query = supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)

  if (trash) {
    query = query.not("deleted_at", "is", null)
  } else {
    query = query.is("deleted_at", null)
  }

  if (folderId) {
    query = query.eq("folder_id", folderId)
  }

  if (starred) {
    query = query.eq("is_starred", true)
  }

  const { data, error } = await query.order("uploaded_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ files: data })
}
