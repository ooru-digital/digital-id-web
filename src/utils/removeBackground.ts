import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';

// WASM is pinned to the installed @mediapipe/tasks-vision version; the model is self-hosted in public/models
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL = '/models/selfie_segmenter.tflite';

let segmenterPromise: Promise<ImageSegmenter> | null = null;

// Loads once and is reused; call early (e.g. when the camera starts) to hide the download
export const preloadSegmenter = () => {
  segmenterPromise ??= FilesetResolver.forVisionTasks(WASM_URL)
    .then(fileset => ImageSegmenter.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
      runningMode: 'IMAGE',
      outputConfidenceMasks: true,
      outputCategoryMask: false
    }))
    .catch(error => {
      segmenterPromise = null; // allow a retry on the next capture
      throw error;
    });
  return segmenterPromise;
};

// Replaces everything that is not the person with plain white, soft-blended at the edges
export async function removeBackground(canvas: HTMLCanvasElement): Promise<void> {
  const segmenter = await preloadSegmenter();
  const result = segmenter.segment(canvas);
  try {
    const mask = result.confidenceMasks?.[0];
    if (!mask || mask.width !== canvas.width || mask.height !== canvas.height) {
      throw new Error('Segmentation mask missing or wrong size');
    }
    const person = mask.getAsFloat32Array();
    const ctx = canvas.getContext('2d')!;
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = image.data;
    for (let i = 0; i < person.length; i++) {
      const a = person[i];
      const o = i * 4;
      px[o] = px[o] * a + 255 * (1 - a);
      px[o + 1] = px[o + 1] * a + 255 * (1 - a);
      px[o + 2] = px[o + 2] * a + 255 * (1 - a);
    }
    ctx.putImageData(image, 0, 0);
  } finally {
    result.close();
  }
}
