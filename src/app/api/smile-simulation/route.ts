import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createClient } from "@/lib/supabase/server"

let _genai: GoogleGenAI | null = null
function getGenAI() {
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })
  }
  return _genai
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()
    if (!userData?.clinic_id) {
      return NextResponse.json({ error: "No clinic found" }, { status: 404 })
    }

    const { image, treatment_type, notes } = await request.json()

    if (!image || !treatment_type) {
      return NextResponse.json(
        { error: "Image and treatment type are required" },
        { status: 400 }
      )
    }

    // Build the editing prompt
    const notesClause = notes ? ` Additional notes: ${notes}` : ""
    const prompt = `Edit this photo to show the result of ${treatment_type}. Keep the person's face, skin tone, and everything else completely identical. Only modify the teeth. Make the result look natural and photorealistic.${notesClause}`

    // Call Gemini API for image editing
    const ai = getGenAI()
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: image,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    })

    // Extract generated image from response
    let afterImageBase64: string | null = null

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          afterImageBase64 = part.inlineData.data
          break
        }
      }
    }

    if (!afterImageBase64) {
      return NextResponse.json(
        { error: "Failed to generate simulation image" },
        { status: 500 }
      )
    }

    // Upload before image to Supabase Storage
    const timestamp = Date.now()
    const beforeFileName = `${userData.clinic_id}/${timestamp}_before.jpg`
    const afterFileName = `${userData.clinic_id}/${timestamp}_after.jpg`

    const beforeBuffer = Buffer.from(image, "base64")
    const afterBuffer = Buffer.from(afterImageBase64, "base64")

    const [beforeUpload, afterUpload] = await Promise.all([
      supabase.storage
        .from("smile-simulations")
        .upload(beforeFileName, beforeBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        }),
      supabase.storage
        .from("smile-simulations")
        .upload(afterFileName, afterBuffer, {
          contentType: "image/jpeg",
          upsert: false,
        }),
    ])

    if (beforeUpload.error || afterUpload.error) {
      console.error("Storage upload error:", beforeUpload.error || afterUpload.error)
      return NextResponse.json(
        { error: "Failed to upload images" },
        { status: 500 }
      )
    }

    const { data: beforeUrlData } = supabase.storage
      .from("smile-simulations")
      .getPublicUrl(beforeFileName)
    const { data: afterUrlData } = supabase.storage
      .from("smile-simulations")
      .getPublicUrl(afterFileName)

    // Return the result with base64 for immediate display
    return NextResponse.json({
      before_image_url: beforeUrlData.publicUrl,
      after_image_url: afterUrlData.publicUrl,
      after_image_base64: afterImageBase64,
      treatment_type,
      notes: notes || null,
    })
  } catch (error) {
    console.error("Smile simulation error:", error)
    return NextResponse.json(
      { error: "Failed to generate simulation" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from("users")
      .select("clinic_id")
      .eq("id", user.id)
      .single()
    if (!userData?.clinic_id) {
      return NextResponse.json({ error: "No clinic found" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("smile_simulations")
      .select("*")
      .eq("clinic_id", userData.clinic_id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch simulations" },
      { status: 500 }
    )
  }
}
