import { pdfjs } from 'react-pdf';
// Vite-compatible worker URL: bundles `pdf.worker.min.mjs` and gives us a URL.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let isConfigured = false;

export function configurePdfWorker() {
  if (isConfigured) return;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  isConfigured = true;
}
