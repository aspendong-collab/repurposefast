import { OpenAI } from 'openai'

export const maxDuration = 30

export async function POST(request: Request) {
  const { format, originalContent, instruction } = await request.json()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API Key 未配置' }, { status: 500 })
  }

  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
  const modelName = baseURL.includes('deepseek') ? 'deepseek-chat' : 'gpt-4o-mini'

  const openai = new OpenAI({ apiKey, baseURL })

  const response = await openai.chat.completions.create({
    model: modelName,
    messages: [
      {
        role: 'system',
        content: `You are a content editor. The user will give you content and an instruction. Apply the change and return ONLY the revised content. Keep the same format/structure. If the instruction is simple (like "shorter", "add emoji"), make that change.`,
      },
      {
        role: 'user',
        content: `Original content:\n---\n${originalContent}\n---\n\nInstruction: ${instruction}\n\nReturn only the revised content:`,
      },
    ],
    temperature: 0.3,
    max_tokens: 4000,
  })

  const refined = response.choices[0]?.message?.content?.trim() || originalContent

  return Response.json({
    refined,
    content: `已根据"${instruction}"调整了内容。`,
    diff: {
      before: originalContent.slice(0, 500),
      after: refined.slice(0, 500),
    },
  })
}
