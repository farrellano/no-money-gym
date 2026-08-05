import { groq } from '@ai-sdk/groq';
import {
  convertToModelMessages,
  isStepCount,
  streamText,
  type InferUITools,
  type UIMessage,
} from 'ai';
import { createAiCoachTools } from '@/lib/ai-coach-tools';
import { AI_COACH_SYSTEM_PROMPT } from '@/lib/ai-coach-prompt';
import { prisma } from '@/lib/prisma';

interface AiCoachRequestBody {
  messages?: UIMessage[];
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as AiCoachRequestBody;
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!Array.isArray(messages)) {
    return new Response('Invalid request body', { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return new Response('User not found', { status: 401 });
  }

  const tools = createAiCoachTools(userId);
  const uiMessages = messages as Array<UIMessage<unknown, never, InferUITools<typeof tools>>>;

  try {
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: AI_COACH_SYSTEM_PROMPT,
      messages: await convertToModelMessages(uiMessages, { tools }),
      tools,
      stopWhen: isStepCount(5),
      onError: (event) => {
        console.error('[ai-coach] Stream error:', event.error);
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
    });
  } catch (error) {
    console.error('[ai-coach] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
