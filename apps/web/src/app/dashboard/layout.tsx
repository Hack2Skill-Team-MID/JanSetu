import React from 'react';
import { StitchShell } from '../../components/layout/stitch-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StitchShell>{children}</StitchShell>;
}
