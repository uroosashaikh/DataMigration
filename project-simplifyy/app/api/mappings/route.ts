import { generateText, gateway } from "ai"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const sourceFields = Array.isArray(body.sourceFields) ? body.sourceFields : []
  const targetFields = Array.isArray(body.targetFields) ? body.targetFields : []

  const result = await generateText({
    model: gateway("openai/gpt-5-mini"),
    system: "You help map source database fields to destination database fields. Return concise mapping recommendations as JSON when possible.",
    prompt: `Compare these source fields: ${JSON.stringify(sourceFields)} with these target fields: ${JSON.stringify(targetFields)}. Suggest the best field matches and explain confidence briefly.`,
    maxOutputTokens: 500,
  })

  return Response.json({ mapping: result.text, generatedAt: new Date().toISOString() })
}
