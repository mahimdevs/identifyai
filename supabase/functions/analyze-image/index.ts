import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a real-time visual analysis AI. Analyze images to identify objects, items, scenes, or animals.

Your response MUST be valid JSON matching this exact structure:
{
  "name": "Identified object/item name",
  "category": "Category / Subcategory",
  "confidence": "high" | "medium" | "low",
  "attributes": [
    { "label": "Attribute name", "value": "Attribute value" }
  ],
  "details": [
    { "title": "Section title", "content": "Detailed information..." }
  ],
  "tips": ["Actionable tip 1", "Tip 2", ...]
}

Guidelines:
- confidence: "high" if clearly visible and identifiable, "medium" if somewhat obscured or ambiguous, "low" if uncertain
- attributes: 4-6 key visible properties (size, color, type, state, etc.)
- details: 2-4 expandable sections with deeper info:
  - For food: nutrition, ingredients, preparation tips
  - For plants: species info, care instructions
  - For animals: breed info, traits, care notes
  - For gadgets: specs, features, usage tips
  - For other objects: relevant contextual information
- tips: 3-5 practical, safe suggestions relevant to the identified object

IMPORTANT:
- Base all observations strictly on visible elements
- Provide value ranges if exact info cannot be determined
- Clearly mark uncertainty when image quality is low
- Avoid medical, financial, or legally sensitive advice
- Return ONLY the JSON object, no markdown or other text`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      console.error('No image data provided');
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing image with Gemini API...');

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = imageData.includes(',') 
      ? imageData.split(',')[1] 
      : imageData;

    // Determine MIME type
    const mimeMatch = imageData.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT + "\n\nAnalyze this image and provide the JSON response:" },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini response received');

    // Extract text from response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      console.error('No text content in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'No analysis result from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let analysisResult;
    try {
      // Remove markdown code blocks if present
      const cleanedText = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysisResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis result', raw: textContent }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete:', analysisResult.name);

    return new Response(
      JSON.stringify({ result: analysisResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-image function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
