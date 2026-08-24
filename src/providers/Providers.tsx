"use client";

import ReduxProvider from "@/Redux/provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "react-hot-toast";

// Create React Query client
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider>
        {children}
        <Toaster position="top-right" />
        {/* <DarkModeToggle /> */}
      </ReduxProvider>
    </QueryClientProvider>
  );
}
