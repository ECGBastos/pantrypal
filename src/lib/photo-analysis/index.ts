import { mockPhotoAnalysisProvider } from "./mock";
import type { PhotoAnalysisProvider } from "./types";

export function getPhotoAnalysisProvider(): PhotoAnalysisProvider {
  const externalEnabled = process.env.ENABLE_EXTERNAL_IMAGE_ANALYSIS === "true";
  const provider = process.env.IMAGE_ANALYSIS_PROVIDER ?? "mock";

  if (!externalEnabled || provider === "mock") {
    return mockPhotoAnalysisProvider;
  }

  // Future extension point for OpenAI vision, local OCR/barcode recognition, or another
  // opt-in provider. External providers must document that images leave the NAS.
  return mockPhotoAnalysisProvider;
}

export type { DetectedInventoryItem } from "./types";
