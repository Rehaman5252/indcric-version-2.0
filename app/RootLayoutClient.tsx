// app/RootLayoutClient.tsx
"use client";

import { usePathname } from "next/navigation";
import ClientOnly from "@/components/ClientOnly";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

const BottomNav = dynamic(() => import("@/components/BottomNav"), {
  ssr: false,
});

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="relative flex flex-col min-h-screen">
      <main className="flex-1 pb-20">{children}</main>
      {!isAdmin && (
        <ClientOnly
          fallback={
            <Alert variant="destructive" className="fixed bottom-0 w-full rounded-none">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Navigation Failed</AlertTitle>
              <AlertDescription>
                Could not load app navigation. Please refresh.
              </AlertDescription>
            </Alert>
          }
        >
          <BottomNav />
        </ClientOnly>
      )}
    </div>
  );
}
