import { LucideIcon } from 'lucide-react';

export enum FileType {
  PRESENTATION = 'PRESENTATION',
  PROTECTED = 'PROTECTED',
  LINK = 'LINK',
  EXTERNAL_LINK = 'EXTERNAL_LINK', // Opens directly in new tab
  APP = 'APP', // Internal apps like Chat
  BLOG = 'BLOG',
  SITEMAP = 'SITEMAP',
  BOOKS = 'BOOKS',
  TERMINAL = 'TERMINAL',
  MAIL = 'MAIL'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  rating: number; // out of 10
  cover: string;
  amazonUrl: string;
  review: string;
}

export interface ContentSlide {
  title: string;
  image?: string;
  body: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML or Markdown string
  date: string;
  readTime: string;
  author: string;
  tags: string[];
  image?: string;
}

export interface DesktopItem {
  id: string;
  title: string;
  icon: LucideIcon;
  type: FileType;
  content?: ContentSlide[]; // For presentations
  url?: string; // For links
  password?: string; // For protected files
  appId?: string; // For internal apps
  lockedContent?: ContentSlide[]; // Content revealed after unlock
  blogPosts?: BlogPost[]; // For blog app
  books?: Book[]; // For books app
  seoDescription?: string; // Explicit description for SEO tags
  slug?: string; // For routing
}

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  itemId: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  originRect?: WindowRect; // The screen coordinates of the icon that launched this window
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}