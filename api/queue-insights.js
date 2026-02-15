// Vercel Serverless Function (Node runtime)
// Calls Claude (Anthropic Messages API) and returns STRICT JSON per skills/queue-insights/SKILL.md

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929'
const ANTHROPIC_VERSION = process.env.ANTHROPIC_VERSION || '2023-06-01'

function json(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

async function loadSkillMarkdown() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const skillPath = path.resolve(here, '..', 'skills', 'queue-insights', 'SKILL.md')
  return await readFile(skillPath, 'utf8')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return json(res, 503, { error: 'not_configured' })

  let payload
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return json(res, 400, { error: 'invalid_json' })
  }

  const messages = Array.isArray(payload?.messages) ? payload.messages : []

  let skillMarkdown = ''
  try {
    skillMarkdown = await loadSkillMarkdown()
  } catch {
    return json(res, 500, { error: 'skill_missing' })
  }

  // Skill-driven: the SKILL.md is the contract + guardrails.
  // The wrapper below is generic; the behavior is defined in the skill file.
  const system = [
    'Follow this skill definition exactly.',
    'You MUST call the provided tool to return structured output.',
    '',
    skillMarkdown,
  ].join('\n')

  const user = JSON.stringify(
    {
      messages: messages.map((m) => ({
        id: m.id,
        body: typeof m.body === 'string' ? m.body : '',
        category: m.category,
        priority: m.priority,
        resolved: m.resolved,
        date: m.date,
      })),
    },
    null,
    0,
  )

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 800,
        temperature: 0.2,
        system,
        tools: [
          {
            name: 'queue_insights',
            description: 'Return 2–4 actionable support queue insights as structured data.',
            input_schema: {
              type: 'object',
              properties: {
                insights: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      body: { type: 'string' },
                      severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
                      actions: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['title', 'body', 'severity', 'actions'],
                  },
                },
              },
              required: ['insights'],
            },
          },
        ],
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Generate queue insights for this queue. Use the queue_insights tool.' },
              { type: 'text', text: user },
            ],
          },
        ],
      }),
    })

    if (!r.ok) {
      return json(res, 502, { error: 'model_error', status: r.status })
    }

    const data = await r.json()
    const toolUse = Array.isArray(data?.content) ? data.content.find((b) => b?.type === 'tool_use' && b?.name === 'queue_insights') : null
    if (toolUse?.input) return json(res, 200, toolUse.input)

    // Fallback: if a model returns plain text, try parsing it as JSON.
    const text = Array.isArray(data?.content) ? data.content.find((b) => b?.type === 'text')?.text : null
    if (typeof text === 'string') {
      try {
        return json(res, 200, JSON.parse(text.trim()))
      } catch {
        return json(res, 502, { error: 'model_invalid_json' })
      }
    }

    return json(res, 502, { error: 'model_no_output' })
  } catch (e) {
    return json(res, 502, { error: 'model_exception' })
  }
}

