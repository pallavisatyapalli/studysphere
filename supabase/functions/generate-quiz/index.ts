import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const formData = await req.formData();
    const text = formData.get('text') as string || '';
    const pdfFile = formData.get('pdf') as File | null;
    const difficulty = formData.get('difficulty') as string || 'medium';
    const mcqs = parseInt(formData.get('mcqs') as string) || 2;
    const fibs = parseInt(formData.get('fibs') as string) || 2;
    const tfs = parseInt(formData.get('tfs') as string) || 2;

    let content = text;

    // If PDF is uploaded, extract text (basic extraction)
    if (pdfFile) {
      const pdfBuffer = await pdfFile.arrayBuffer();
      const pdfText = new TextDecoder().decode(pdfBuffer);
      // Basic text extraction - for better PDF parsing, consider using a PDF library
      content = text + '\n' + pdfText.replace(/[^\x20-\x7E\n]/g, ' ');
    }

    if (!content.trim()) {
      throw new Error('No content provided');
    }

    // Truncate content if too long
    const maxLength = 4000;
    if (content.length > maxLength) {
      content = content.substring(0, maxLength);
    }

    const prompt = `Based on the following content, generate quiz questions with these specifications:
- Difficulty level: ${difficulty}
- Number of Multiple Choice Questions (MCQs): ${mcqs}
- Number of Fill in the Blanks (F-I-Bs): ${fibs}
- Number of True or False (T or F): ${tfs}

Content:
${content}

Please format the output EXACTLY as follows:

MCQs:
Q1: [Question text]
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]
Answer: [Correct answer text]

F-I-Bs:
Q1: [Question with blank indicated as ___]
Answer: [Word that fills the blank]

T or F:
Q1: [Statement] Answer: True
Q2: [Statement] Answer: False

Important:
- For MCQs, the Answer should be the full text of the correct option, not just the letter.
- For Fill in Blanks, use ___ to indicate the blank.
- For True/False, include the answer (True/False) at the end of the question line.
- Generate exactly the number of questions specified for each type.
- Make questions appropriate for the ${difficulty} difficulty level.`;

    console.log('Generating quiz with Groq API...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generator. Generate clear, accurate, and educational quiz questions based on the provided content. Follow the exact format specified.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', response.status, errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const questions = data.choices?.[0]?.message?.content;

    if (!questions) {
      throw new Error('No questions generated');
    }

    console.log('Quiz generated successfully');

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate quiz' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
