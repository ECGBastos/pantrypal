export type DetectedInventoryItem = {
  name: string;
  category: string;
  confidence: number;
  suggestedQuantity?: number | null;
  suggestedUnit?: string | null;
  suggestedLocation?: string | null;
  matchedExistingInventoryItemId?: string | null;
};

export type AnalyzeInventoryPhotoInput = {
  image: File;
  householdId: string;
};

export type PhotoAnalysisProvider = {
  analyzeInventoryPhoto(input: AnalyzeInventoryPhotoInput): Promise<DetectedInventoryItem[]>;
};
