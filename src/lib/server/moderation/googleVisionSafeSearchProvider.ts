import type { ImageSafetyProvider, ImageSafetyResult } from "./imageSafetyTypes";
import { applyImageSafetyPolicy, normalizeLikelihood } from "./imageSafetyPolicy";

type VisionClientLike = {
  safeSearchDetection(
    request: { image: { content: Buffer } }
  ): Promise<
    Array<{
      safeSearchAnnotation?: {
        adult?: string | number;
        racy?: string | number;
        violence?: string | number;
      } | null;
    }>
  >;
};

let cachedClient: VisionClientLike | null = null;

async function getVisionClient(): Promise<VisionClientLike> {
  if (cachedClient) return cachedClient;
  const vision = await import("@google-cloud/vision");
  cachedClient = new vision.ImageAnnotatorClient() as unknown as VisionClientLike;
  return cachedClient;
}

/** Production provider — uses ADC or GOOGLE_APPLICATION_CREDENTIALS on the server only. */
export class GoogleVisionSafeSearchProvider implements ImageSafetyProvider {
  async moderate(buffer: Buffer): Promise<ImageSafetyResult> {
    const client = await getVisionClient();
    const [result] = await client.safeSearchDetection({ image: { content: buffer } });
    const ann = result?.safeSearchAnnotation;
    if (!ann) {
      throw new Error("VISION_EMPTY_RESPONSE");
    }
    const categories = {
      adult: normalizeLikelihood(ann.adult),
      racy: normalizeLikelihood(ann.racy),
      violence: normalizeLikelihood(ann.violence),
    };
    return applyImageSafetyPolicy(categories);
  }
}

/** Test-only: clear cached client between tests. */
export function resetGoogleVisionClientCache(): void {
  cachedClient = null;
}
