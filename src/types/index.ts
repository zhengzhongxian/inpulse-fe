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
}

export interface UserSession {
  userId: string;
  username: string;
  email: string;
  displayMode: string;
  choiceLanguage: string;
  deviceTrusted: boolean;
}

export interface MfaMethod {
  type: string;
  displayName: string;
}
