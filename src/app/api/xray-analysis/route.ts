import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const SYSTEM_PROMPT = `You are an expert dental radiologist AI assistant. Analyse the provided dental X-ray image and return a structured JSON response with exactly these fields:
{
  "findings": string[],        // array of observed findings
  "severity": "normal" | "monitor" | "urgent",
  "treatments": string[],      // recommended treatment steps
  "confidence": number         // 0-100
}
Be specific, clinical, and concise. Only describe what is visible in the X-ray. Return ONLY valid JSON, no markdown or other text.`

let _anthropic: Anthropic | null = null
function getAnthropic() {
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _anthropic
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

    const { image, xray_type } = await request.json()

    if (!image || !xray_type) {
      return NextResponse.json(
        { error: "Image and X-ray type are required" },
        { status: 400 }
      )
    }

    const validTypes = ["periapical", "panoramic", "bitewing", "cbct"]
    if (!validTypes.includes(xray_type)) {
      return NextResponse.json({ error: "Invalid X-ray type" }, { status: 400 })
    }

    // Upload image to Supabase Storage (use admin client to bypass storage RLS)
    const adminClient = createAdminClient()
    const imageBuffer = Buffer.from(image, "base64")
    const fileName = `${userData.clinic_id}/${Date.now()}.jpg`

    // Ensure bucket exists
    const { data: buckets } = await adminClient.storage.listBuckets()
    if (!buckets?.find(b => b.name === "xray-images")) {
      await adminClient.storage.createBucket("xray-images", { public: false })
    }

    const { error: uploadError } = await adminClient.storage
      .from("xray-images")
      .upload(fileName, imageBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      )
    }

    const { data: urlData } = adminClient.storage
      .from("xray-images")
      .getPublicUrl(fileName)

    // Call Claude API with vision
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: `Analyse this ${xray_type} dental X-ray image.`,
            },
          ],
        },
      ],
    })

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : ""

    // Parse JSON from response (handle potential markdown wrapping)
    let analysisResult: {
      findings: string[]
      severity: "normal" | "monitor" | "urgent"
      treatments: string[]
      confidence: number
    }

    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("No JSON found in response")
      analysisResult = JSON.parse(jsonMatch[0])
    } catch {
      console.error("Failed to parse Claude response:", rawText)
      return NextResponse.json(
        { error: "Failed to parse analysis results" },
        { status: 500 }
      )
    }

    // Save to database
    const { data: record, error: dbError } = await supabase
      .from("xray_analyses")
      .insert({
        clinic_id: userData.clinic_id,
        image_url: urlData.publicUrl,
        xray_type,
        findings: analysisResult.findings,
        severity: analysisResult.severity,
        treatments: analysisResult.treatments,
        confidence: analysisResult.confidence,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      )
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("X-ray analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyse X-ray" },
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
      .from("xray_analyses")
      .select("*")
      .eq("clinic_id", userData.clinic_id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    )
  }
}
