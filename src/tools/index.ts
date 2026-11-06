import type { Tool } from './types';
import { merge } from './merge';
import { split } from './split';
import { removePages } from './remove-pages';
import { extractPages } from './extract-pages';
import { organize } from './organize';
import { rotate } from './rotate';
import { compress } from './compress';
import { imageToPdf } from './image-to-pdf';
import { pdfToImage } from './pdf-to-image';
import { pageNumbers } from './page-numbers';
import { watermark } from './watermark';
import { protect } from './protect';
import { unlock } from './unlock';

export const TOOLS: Tool[] = [
  // Organize
  merge,
  split,
  removePages,
  extractPages,
  organize,
  // Optimize
  compress,
  // Convert
  imageToPdf,
  pdfToImage,
  // Edit
  rotate,
  pageNumbers,
  watermark,
  // Security
  protect,
  unlock,
];
