import { type ReactNode } from 'react';
import type { BookEditionResponse } from '../api/books';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: string;
  wasPrice?: string;
  tag: string;
  tagClass?: string;
  badgeTextColor?: string;
  badgeBgColor?: string;
  desc: string;
  description?: string;
  svgCover: ReactNode;
  attributes?: Record<string, string>;
  otherVersions?: BookEditionResponse[];
  thumbnailUrl?: string;
  imageUrls?: string[];
  introduce?: string;
  badges?: { text: string; textColor: string; bgColor: string; shape?: string }[];
  soldCount?: number;
  ratingsCount?: number;
  rating?: number;
}
