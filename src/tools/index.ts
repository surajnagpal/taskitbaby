import { Droplets, FileMinus, FileOutput, Hash, Image, Images, LayoutGrid, Lock, LockOpen, Merge, RotateCw, Scissors, Shrink } from 'lucide-preact';
import type { Tool } from './types';

const PDF = 'application/pdf,.pdf';

/**
 * Tool registry. Metadata only — each tool's UI (and the PDF libraries it
 * pulls in) is loaded on demand through `load()`.
 */
export const TOOLS: Tool[] = [
  // ---- Organize ----
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine several PDFs into one, in the order you choose.',
    category: 'organize',
    icon: Merge,
    accept: PDF,
    multiple: true,
    hint: 'Drop two or more PDFs, or click to choose',
    load: () => import('./merge').then((m) => m.default),
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Break a PDF into separate files by page ranges, every page or every N pages.',
    category: 'organize',
    icon: Scissors,
    accept: PDF,
    multiple: false,
    load: () => import('./split').then((m) => m.default),
  },
  {
    id: 'remove-pages',
    name: 'Remove pages',
    description: 'Delete the pages you don’t need and save a new PDF.',
    category: 'organize',
    icon: FileMinus,
    accept: PDF,
    multiple: false,
    load: () => import('./remove-pages').then((m) => m.default),
  },
  {
    id: 'extract-pages',
    name: 'Extract pages',
    description: 'Pull selected pages out into a new PDF, together or one file per page.',
    category: 'organize',
    icon: FileOutput,
    accept: PDF,
    multiple: false,
    load: () => import('./extract-pages').then((m) => m.default),
  },
  {
    id: 'organize-pdf',
    name: 'Organize PDF',
    description: 'Reorder, rotate and remove pages visually, then save.',
    category: 'organize',
    icon: LayoutGrid,
    accept: PDF,
    multiple: false,
    load: () => import('./organize').then((m) => m.default),
  },

  // ---- Optimize ----
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Shrink PDFs for email and sharing, with a choice of quality.',
    category: 'optimize',
    icon: Shrink,
    accept: PDF,
    multiple: true,
    load: () => import('./compress').then((m) => m.default),
  },

  // ---- Convert ----
  {
    id: 'image-to-pdf',
    name: 'JPG to PDF',
    description: 'Turn JPG, PNG, WebP or other images into a PDF, one image per page.',
    category: 'convert-to',
    icon: Images,
    accept: 'image/*',
    multiple: true,
    hint: 'Drop images, or click to choose',
    load: () => import('./image-to-pdf').then((m) => m.default),
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Save every page, or just some, as JPG or PNG images.',
    category: 'convert-from',
    icon: Image,
    accept: PDF,
    multiple: false,
    load: () => import('./pdf-to-image').then((m) => m.default),
  },

  // ---- Edit ----
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Turn all pages, or just the ones you pick, by 90, 180 or 270 degrees.',
    category: 'edit',
    icon: RotateCw,
    accept: PDF,
    multiple: false,
    load: () => import('./rotate').then((m) => m.default),
  },
  {
    id: 'add-page-numbers',
    name: 'Add page numbers',
    description: 'Stamp page numbers wherever you like, in the format you like.',
    category: 'edit',
    icon: Hash,
    accept: PDF,
    multiple: true,
    load: () => import('./page-numbers').then((m) => m.default),
  },
  {
    id: 'add-watermark',
    name: 'Add watermark',
    description: 'Stamp text across every page, centred or tiled, at any angle and opacity.',
    category: 'edit',
    icon: Droplets,
    accept: PDF,
    multiple: true,
    load: () => import('./watermark').then((m) => m.default),
  },

  // ---- Security ----
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Add a password and set what readers may print, copy or edit.',
    category: 'security',
    icon: Lock,
    accept: PDF,
    multiple: true,
    load: () => import('./protect').then((m) => m.default),
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove a password or restrictions from a PDF you have the right to open.',
    category: 'security',
    icon: LockOpen,
    accept: PDF,
    multiple: true,
    load: () => import('./unlock').then((m) => m.default),
  },
];

export const toolById = (id: string) => TOOLS.find((t) => t.id === id);
