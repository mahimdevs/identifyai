export interface AnalysisResult {
  id: string;
  timestamp: number;
  imageData: string;
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  attributes: {
    label: string;
    value: string;
  }[];
  details: {
    title: string;
    content: string;
  }[];
  tips: string[];
  isFavorite: boolean;
  notes?: string;
}
