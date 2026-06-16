import { NextRequest } from 'next/server'
import { getSystemPrompt, getUserPrompt } from '@/lib/repurpose/prompts'
import { OUTPUT_FORMATS } from '@/lib/repurpose/types'
import type { OutputFormat } from '@/lib/repurpose/types'
import OpenAI from 'openai'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const { transcript, formats, language, platform } = await request.json()

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key 未配置' }), { status: 500 })
  }

  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com'
  const modelName = baseURL.includes('deepseek') ? 'deepseek-chat' : 'gpt-4o'

  const openai = new OpenAI({ apiKey, baseURL })

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Launch all format generations in parallel
        const tasks = (formats as OutputFormat[]).map(async (format) => {
          const meta = OUTPUT_FORMATS[format]
          if (!meta) return

          const systemPrompt = getSystemPrompt(format, language || 'zh')
          const userPrompt = getUserPrompt(format, transcript, language || 'zh')

          try {
            const response = await openai.chat.completions.create({
              model: modelName,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.7,
              max_tokens: 4000,
              stream: true,
            })

            let fullContent = ''

            for await (const chunk of response) {
              if (closed) break
              const text = chunk.choices[0]?.delta?.content || ''
              if (text) {
                fullContent += text
                send({ type: 'chunk', format, text })
              }
            }

            // Extract title from first line
            const lines = fullContent.trim().split('\n')
            let title = meta.label
            let content = fullContent.trim()
            if (lines[0]?.startsWith('# ')) {
              title = lines[0].replace(/^# /, '').trim()
              content = lines.slice(1).join('\n').trim()
            }

            send({
              type: 'complete',
              format,
              title,
              metadata: {
                wordCount: content.length,
                readingTime: Math.ceil(content.length / 300),
              },
            })
          } catch (err) {
            send({
              type: 'error',
              format,
              message: err instanceof Error ? err.message : 'Generation failed',
            })
          }
        })

        await Promise.allSettled(tasks)
        send({ type: 'done' })
      } catch (err) {
        send({ type: 'error', message: err instanceof Error ? err.message : 'Stream error' })
      } finally {
        closed = true
        controller.close()
      }
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
