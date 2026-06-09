/**
 * Shared FileType → icon / label mapping used by Finder, Spotlight, and any
 * other surface that lists items generically.
 */

import {
  FileText,
  Lock,
  BookOpen,
  Library,
  Terminal,
  Mail,
  Map,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import { FileType } from '../types';

export const getIconForType = (type: FileType): LucideIcon => {
  switch (type) {
    case FileType.PRESENTATION:
      return FileText;
    case FileType.PROTECTED:
      return Lock;
    case FileType.BLOG:
      return BookOpen;
    case FileType.BOOKS:
      return Library;
    case FileType.TERMINAL:
      return Terminal;
    case FileType.MAIL:
      return Mail;
    case FileType.SITEMAP:
      return Map;
    case FileType.EXTERNAL_LINK:
    case FileType.LINK:
      return ExternalLink;
    default:
      return FileText;
  }
};

export const getTypeLabel = (type: FileType): string => {
  switch (type) {
    case FileType.PRESENTATION:
      return 'Presentation';
    case FileType.PROTECTED:
      return 'Protected';
    case FileType.BLOG:
      return 'Notes';
    case FileType.BOOKS:
      return 'Library';
    case FileType.TERMINAL:
      return 'Terminal';
    case FileType.MAIL:
      return 'Mail';
    case FileType.SITEMAP:
      return 'Sitemap';
    case FileType.EXTERNAL_LINK:
      return 'External Link';
    case FileType.LINK:
      return 'Link';
    default:
      return 'File';
  }
};
