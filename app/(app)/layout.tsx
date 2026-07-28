import { BottomNav } from '@/components/BottomNav';
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-16">
      <main className="flex-1">{children}</main>
      <BottomNav />
      <ServiceWorkerRegistrar />
    </div>
  );
}
