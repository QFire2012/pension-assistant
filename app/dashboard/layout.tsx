'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ProfileDrawer } from '@/components/dashboard/ProfileDrawer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f2ea]">
      <Sidebar onOpenSettings={() => setDrawerOpen(true)} />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:ml-72 lg:px-8 lg:pb-10 lg:pt-8">
        {children}
      </main>
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
