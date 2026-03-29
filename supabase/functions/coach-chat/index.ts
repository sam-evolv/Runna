// Supabase Edge Function: coach-chat
// AI-powered fitness coaching chat using NVIDIA NIM API
//
// Deploy with: supabase functions deploy coach-chat

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')!;
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  user_context?: {
    name?: string;
    goal_type?: string;
    goal_subtype?: string;
    fitness_level?: string;
    current_week?: number;
    total_weeks?: number;
    recent_rpe_avg?: number;
    recent_workouts_completed?: number;
  };
}

const SYSTEM_PROMPT = `You are Pulse Coach — an expert, evidence-based fitness coach. You are knowledgeable, supportive, and direct. You speak like a trusted personal trainer who genuinely cares about the user's progress.

Your expertise covers:
- Strength training and hypertrophy programming (RP Strength level)
- Running coaching (Pfitzinger/Daniels level)
- Nutrition fundamentals (macros, meal timing, hydration)
- Recovery and sleep optimisation
- Injury prevention and management
- Mental performance and motivation

Rules:
- Be specific and evidence-based. Cite the science when relevant but keep it accessible.
- Be concise — under 150 words per response unless the question requires detail.
- Speak to the user as an athlete, not a patient. Use "your training" not "your exercise routine."
- Never give medical advice. If someone describes pain, recommend seeing a physiotherapist.
- If you don't know something, say so. Don't make things up.
- Use the user's training context to personalise answers when available.
- Be encouraging but honest. If they're overtraining, tell them. If they're not training hard enough, tell them.
- Format responses for mobile readability — short paragraphs, bullet points when listing.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversation_history, user_context }: ChatRequest = await req.json();

    // Build context-aware system prompt
    let contextNote = '';
    if (user_context) {
      const parts: string[] = [];
      if (user_context.name) parts.push(`User's name: ${user_context.name}`);
      if (user_context.goal_type) parts.push(`Goal: ${user_context.goal_type}${user_context.goal_subtype ? ` (${user_context.goal_subtype})` : ''}`);
      if (user_context.fitness_level) parts.push(`Level: ${user_context.fitness_level}`);
      if (user_context.current_week && user_context.total_weeks) {
        parts.push(`Plan progress: Week ${user_context.current_week} of ${user_context.total_weeks}`);
      }
      if (user_context.recent_rpe_avg) parts.push(`Recent avg RPE: ${user_context.recent_rpe_avg}`);
      if (user_context.recent_workouts_completed !== undefined) {
        parts.push(`Workouts completed this week: ${user_context.recent_workouts_completed}`);
      }
      if (parts.length > 0) {
        contextNote = `\n\nCURRENT USER CONTEXT:\n${parts.join('\n')}`;
      }
    }

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT + contextNote },
    ];

    // Add conversation history (last 10 messages to stay within context)
    if (conversation_history && conversation_history.length > 0) {
      const recent = conversation_history.slice(-10);
      for (const msg of recent) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${errorBody}`);
    }

    const nvidiaResponse = await response.json();
    const content = nvidiaResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI');
    }

    return new Response(
      JSON.stringify({ response: content.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('[coach-chat] Error:', (error as Error).message);
    return new Response(
      JSON.stringify({
        response: "I'm having trouble connecting right now. Your question is a good one though — try asking again in a moment, or check the training tips in your plan notes.",
        error: true,
      }),
      {
        status: 200, // Return 200 so the client gets a usable response
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
