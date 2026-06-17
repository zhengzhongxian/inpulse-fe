import React from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: string;
  wasPrice?: string;
  tag?: string;
  tagClass?: string;
  desc: string;
  svgCover: React.ReactNode;
  attributes?: Record<string, string>;
}
