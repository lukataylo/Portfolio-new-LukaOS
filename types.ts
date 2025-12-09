/**
 * Type Definitions for LukaOS Portfolio
 *
 * This module contains all TypeScript interfaces and enums used throughout
 * the application. Types are organized by domain: content, window management,
 * and communication.
 *
 * @module types
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// FILE SYSTEM TYPES
// ============================================================================

/**
 * File type enumeration for desktop items.
 * Determines how an item is rendered and what component handles its content.
 */
export enum FileType {
  /** Slide-based presentation viewer (case studies, about) */
  PRESENTATION = 'PRESENTATION',
  /** Password-protected content requiring unlock */
  PROTECTED = 'PROTECTED',
  /** Opens in internal browser window */
  LINK = 'LINK',
  /** Opens directly in new browser tab */
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  /** Internal application (Chat, etc.) */
  APP = 'APP',
  /** iOS-style Notes app */
  BLOG = 'BLOG',
  /** Site navigation and file listing */
  SITEMAP = 'SITEMAP',
  /** Book library with reviews */
  BOOKS = 'BOOKS',
  /** AI-powered terminal */
  TERMINAL = 'TERMINAL',
  /** Email composition window */
  MAIL = 'MAIL',
  /** macOS-style Finder file browser */
  FINDER = 'FINDER',
  /** System preferences panel */
  PREFERENCES = 'PREFERENCES',
}

// ============================================================================
// CONTENT TYPES
// ============================================================================

/**
 * Book review data for the Library app.
 */
export interface Book {
  /** Unique identifier */
  id: string;
  /** Book title */
  title: string;
  /** Author name */
  author: string;
  /** Category (Business, History, Economics, etc.) */
  category: string;
  /** Rating out of 10 */
  rating: number;
  /** Cover image URL */
  cover: string;
  /** Amazon purchase link */
  amazonUrl: string;
  /** Personal review text */
  review: string;
}

/**
 * Individual slide in a presentation.
 * Used by PresentationViewer for case studies and about pages.
 */
export interface ContentSlide {
  /** Slide title */
  title: string;
  /** Optional header image URL */
  image?: string;
  /** Slide body content (supports line breaks) */
  body: string;
}

/**
 * Blog/Note post data for the Notes app.
 */
export interface BlogPost {
  /** Unique identifier */
  id: string;
  /** Post title */
  title: string;
  /** Short description shown in list view */
  excerpt: string;
  /** Full content (HTML or Markdown string) */
  content: string;
  /** Publication date (ISO string or formatted) */
  date: string;
  /** Estimated read time (e.g., "5 min read") */
  readTime: string;
  /** Author name */
  author: string;
  /** Categorization tags */
  tags: string[];
  /** Optional header image URL */
  image?: string;
}

// ============================================================================
// DESKTOP ITEM TYPES
// ============================================================================

/**
 * Desktop item representing a file, folder, or application.
 * The core data structure for all desktop and dock icons.
 */
export interface DesktopItem {
  /** Unique identifier (used for window ID generation) */
  id: string;
  /** Display title */
  title: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Determines rendering behavior and component */
  type: FileType;
  /** Presentation slides (for PRESENTATION type) */
  content?: ContentSlide[];
  /** URL for LINK and EXTERNAL_LINK types */
  url?: string;
  /** Password for PROTECTED type */
  password?: string;
  /** Target app ID for APP type shortcuts */
  appId?: string;
  /** Content revealed after password unlock */
  lockedContent?: ContentSlide[];
  /** Posts for BLOG type */
  blogPosts?: BlogPost[];
  /** Books for BOOKS type */
  books?: Book[];
  /** SEO meta description */
  seoDescription?: string;
  /** URL-friendly slug for routing */
  slug?: string;
}

// ============================================================================
// WINDOW MANAGEMENT TYPES
// ============================================================================

/**
 * Screen coordinates and dimensions for a rectangle.
 * Used for window positioning and animation origins.
 */
export interface WindowRect {
  /** X coordinate (left) */
  x: number;
  /** Y coordinate (top) */
  y: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Complete state for a window instance.
 * Managed by useWindowManager hook and WindowFrame component.
 */
export interface WindowState {
  /** Unique window identifier (format: "window-{itemId}") */
  id: string;
  /** ID of the DesktopItem this window displays */
  itemId: string;
  /** Window title bar text */
  title: string;
  /** Whether window is open (always true while in windows array) */
  isOpen: boolean;
  /** Whether window is minimized to dock */
  isMinimized: boolean;
  /** Whether window is maximized to full screen */
  isMaximized: boolean;
  /** Stacking order (higher = on top) */
  zIndex: number;
  /** Current window position */
  position: { x: number; y: number };
  /** Current window dimensions */
  size: { width: number; height: number };
  /** Origin icon position for open/close animations */
  originRect?: WindowRect;
  /** Pre-snap position/size for restoration when unsnapping */
  preSnapRect?: { x: number; y: number; width: number; height: number };
  /** Whether window is currently snapped (left, right, or full) */
  isSnapped?: boolean;
}

// ============================================================================
// COMMUNICATION TYPES
// ============================================================================

/**
 * Chat message for the AI assistant.
 * Used by ChatApp and Gemini service.
 */
export interface ChatMessage {
  /** Message sender: 'user' or 'model' (AI) */
  role: 'user' | 'model';
  /** Message text content */
  text: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * System notification data.
 * Used by NotificationCenter component.
 */
export interface Notification {
  /** Unique identifier */
  id: string;
  /** Notification title */
  title: string;
  /** Notification body text */
  message: string;
  /** Creation timestamp */
  time: Date;
}

// ============================================================================
// THEME TYPES
// ============================================================================

/** Application theme */
export type Theme = 'light' | 'dark';

/** Clock display modes (Easter egg) */
export type ClockMode = 'normal' | 'binary' | 'hex' | 'coffee';
