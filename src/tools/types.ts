import type { ComponentType } from 'preact';
import type { LucideIcon } from 'lucide-preact';

export type Category = 'organize' | 'optimize' | 'convert-to' | 'convert-from' | 'edit' | 'security';

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'organize', label: 'Organize' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'convert-to', label: 'Convert to PDF' },
  { id: 'convert-from', label: 'Convert from PDF' },
  { id: 'edit', label: 'Edit' },
  { id: 'security', label: 'Security' },
];

export interface ToolProps {
  files: File[];
  /** Replace the current file set (e.g. add more files). */
  setFiles: (files: File[]) => void;
  /** Go back to the empty drop state. */
  reset: () => void;
}

export type ToolComponent = ComponentType<ToolProps>;

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: Category;
  icon: LucideIcon;
  /** Accepted input types, as `accept` attribute values. */
  accept: string;
  /** Whether the drop zone accepts more than one file at once. */
  multiple: boolean;
  /** Short hint shown under the drop zone. */
  hint?: string;
  /** Marks a tool as not yet available. */
  soon?: boolean;
  /**
   * Loads the tool's UI on demand. Keeps the PDF libraries out of the initial
   * page load and out of the pre-render step.
   */
  load: () => Promise<ToolComponent>;
}
