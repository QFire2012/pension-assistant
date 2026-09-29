'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ProfileDrawer } from '@/components/dashboard/ProfileDrawer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar onOpenSettings={() => setDrawerOpen(true)} />
      <main className="ml-64 p-6">{children}</main>
      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => {
          window.dispatchEvent(new CustomEvent('forecast-refresh'));
        }}
      />
    </div>
  );
}