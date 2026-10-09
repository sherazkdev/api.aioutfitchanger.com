export type BytePlusImageGenerationRequest = {
  model: string;
  prompt: string;
  image?: string | string[];
  size?: string;
  output_format?: string;
  response_format?: "url" | "b64_json";
  watermark?: boolean;
};

export type BytePlusImageData = {
  url?: string;
  b64_json?: string;
};

export type BytePlusImageGenerationResponse = {
  data?: BytePlusImageData[];
  error?: { message?: string; code?: string };
};

export type BytePlusBeautyGenerationInput = {
  prompt: string;
  personDataUrl: string;
  referenceDataUrl?: string;
  width?: number;
  height?: number;
};

export type BytePlusBeautyGenerationResult = {
  resultUrl: string;
  durationMs: number;
  model: string;
};
