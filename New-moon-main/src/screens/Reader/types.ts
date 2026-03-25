import { ChapterFull } from '../../services/novel';

export interface NovelInfo {
  _id: string;
  title: string;
  cover: string;
  author: string;
  chaptersCount: number;
  authorEmail?: string;
}

export interface AuthorProfile {
  _id: string;
  name: string;
  picture?: string;
  banner?: string;
}

export interface ReaderSettings {
  fontSize: number;
  bgColor: string;
  textColor: string;
  fontFamily: typeof import('./constants').FONT_OPTIONS[0];
  textBrightness: number;
  enableDialogue: boolean;
  dialogueColor: string;
  dialogueSize: number;
  hideQuotes: boolean;
  selectedQuoteStyle: string;
  enableMarkdown: boolean;
  markdownColor: string;
  markdownSize: number;
  hideMarkdownMarks: boolean;
  selectedMarkdownStyle: string;
}

export interface ReplacementFolder {
  id: string;
  name: string;
  replacements: ReplacementItem[];
}

export interface ReplacementItem {
  original: string;
  replacement: string;
}

export interface CopyrightStyle {
  color: string;
  opacity: number;
  alignment: 'left' | 'center' | 'right';
  isBold: boolean;
  fontSize: number;
}