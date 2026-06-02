import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { getKit, RECIPE_ROLES, type RecipeRole } from '@/lib/starterKits';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SlideCopySchema = z.object({
  title: z
    .string()
    .min(2)
    .max(80)
    .describe(
      "Short, punchy headline for this slide. 2-7 words. Use \\n to break across lines (typically after 2-3 words). No punctuation at the end except '?' or '.' Example: 'Build something\\nbeautiful.'",
    ),
  subtitle: z
    .string()
    .max(140)
    .describe(
      'Optional supporting line, under 100 characters. Empty string if not used.',
    ),
  showSubtitle: z.boolean().describe('Whether to show the subtitle on this slide.'),
});

const ResultSchema = z.object({
  slides: z
    .array(SlideCopySchema)
    .describe('One copy block per slide, in the same order as the requested roles.'),
});

interface GenerateRequest {
  appName: string;
  description: string;
  audience?: string;
  tone?: string;
  kitId: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          'AI generation is not configured. Set the ANTHROPIC_API_KEY environment variable in .env.local and restart the dev server.',
      },
      { status: 503 },
    );
  }

  let body: GenerateRequest;
  try {
    body = (await req.json()) as GenerateRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { appName, description, audience, tone, kitId } = body;
  if (!appName || !description || !kitId) {
    return NextResponse.json(
      { error: 'appName, description, and kitId are required.' },
      { status: 400 },
    );
  }

  const kit = getKit(kitId);
  if (!kit) {
    return NextResponse.json({ error: `Unknown kit: ${kitId}` }, { status: 400 });
  }

  const roles: RecipeRole[] = kit.slides.map((s) => (s.role || 'secondary') as RecipeRole);
  const roleOutline = roles
    .map((r, i) => {
      const meta = RECIPE_ROLES.find((rr) => rr.id === r);
      return `${i + 1}. ${meta?.label ?? r} — ${meta?.hint ?? ''}`;
    })
    .join('\n');

  const system = `You are an expert App Store and Google Play marketing copywriter. You write concise, punchy headlines and subheadlines for app screenshot decks used by top apps like Uber, Airbnb, and Spotify.

RULES:
- Each slide title must be 2 to 7 words. Tight and bold.
- Use a line break (\\n) inside the title for visual rhythm — typically after 2-3 words.
- Subtitles are optional, under 100 characters, plain prose. Use only when they meaningfully add value.
- The first slide ("Hero") must be the strongest hook — it's the only one most users will see in App Store search results.
- The last slide should be social proof or a confident closer (numbers, ratings, awards, "join X+ people").
- Match the kit's vibe (tagline supplied) but never sacrifice clarity for cleverness.
- Never use vague hype like "the best app ever" or "transform your life" without specifics.
- Do not invent fake numbers, ratings, or quotes. For social proof, write copy that the user can later replace with real data.
- Output exactly ${roles.length} slide copy blocks, in the order of the roles given, using the requested JSON schema.`;

  const userPrompt = `App name: ${appName}

Product description:
${description}

${audience ? `Target audience: ${audience}\n` : ''}${tone ? `Tone: ${tone}\n` : ''}
Visual kit selected: "${kit.name}" (${kit.tagline})

Write the screenshot deck. Generate copy for these ${roles.length} slides in order:

${roleOutline}

Return JSON matching the schema. Do not include any other commentary.`;

  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-4-7',
      max_tokens: 4000,
      output_config: {
        format: zodOutputFormat(ResultSchema),
        effort: 'medium',
      },
      system,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json(
        { error: 'Model returned no structured output. Try again.' },
        { status: 502 },
      );
    }

    const slides = parsed.slides.slice(0, roles.length);
    while (slides.length < roles.length) {
      slides.push({ title: 'Edit me', subtitle: '', showSubtitle: false });
    }

    return NextResponse.json({
      slides: slides.map((s, i) => ({
        role: roles[i],
        title: s.title,
        subtitle: s.subtitle,
        showSubtitle: s.showSubtitle && !!s.subtitle,
      })),
      kitId,
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: 'Invalid ANTHROPIC_API_KEY.' },
        { status: 401 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'Rate limited by Anthropic. Try again in a moment.' },
        { status: 429 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error (${err.status}): ${err.message}` },
        { status: 502 },
      );
    }
    console.error('AI generate error:', err);
    return NextResponse.json(
      { error: 'Generation failed. See server logs.' },
      { status: 500 },
    );
  }
}
