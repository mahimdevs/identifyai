import { supabase } from "@/integrations/supabase/client";
import { AnalysisResult } from "@/types/analysis";

interface AnalysisResponse {
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  attributes: { label: string; value: string }[];
  details: { title: string; content: string }[];
  tips: string[];
}

export const analyzeImage = async (imageData: string): Promise<AnalysisResult> => {
  const { data, error } = await supabase.functions.invoke('analyze-image', {
    body: { imageData },
  });

  if (error) {
    console.error('Analysis error:', error);
    throw new Error(error.message || 'Failed to analyze image');
  }

  if (data.error) {
    console.error('API error:', data.error);
    throw new Error(data.error);
  }

  const result: AnalysisResponse = data.result;

  // Transform to AnalysisResult format
  return {
    id: Date.now().toString(),
    timestamp: Date.now(),
    imageData,
    name: result.name,
    category: result.category,
    confidence: result.confidence,
    attributes: result.attributes,
    details: result.details,
    tips: result.tips,
    isFavorite: false,
  };
};
