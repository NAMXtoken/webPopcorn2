/*
 * Lightweight loader for Tesseract.js via CDN to avoid bundling the heavy worker directly.
 * This keeps the prototype zero-config while still giving us real OCR capability.
 */

type TesseractModule = {
  createWorker: (
    lang?: string,
    options?: Record<string, unknown>,
  ) => Promise<TesseractWorker>;
};

type RecognitionResult = {
  data: {
    text: string;
    lines: Array<{
      text: string;
      confidence: number;
    }>;
  };
};

export interface TesseractWorker {
  recognize(image: string | HTMLCanvasElement | HTMLVideoElement): Promise<RecognitionResult>;
  terminate(): Promise<void>;
}

let workerPromise: Promise<TesseractWorker> | null = null;

async function importTesseractModule(): Promise<TesseractModule> {
  const module = await import(
    /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js'
  );

  return module as TesseractModule;
}

async function createWorkerInstance(): Promise<TesseractWorker> {
  const module = await importTesseractModule();

  const worker = await module.createWorker('eng', {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract-core.wasm.js',
  });

  return worker;
}

export async function getTesseractWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = createWorkerInstance();
  }
  return workerPromise;
}

export async function disposeTesseractWorker() {
  if (workerPromise) {
    try {
      const worker = await workerPromise;
      await worker.terminate();
    } catch (error) {
      console.error('Failed to terminate Tesseract worker', error);
    }
    workerPromise = null;
  }
}
