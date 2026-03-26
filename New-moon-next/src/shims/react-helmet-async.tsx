'use client';

import React from 'react';
import Head from 'next/head';

export function HelmetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Helmet({ children }: { children?: React.ReactNode }) {
  return <Head>{children}</Head>;
}
