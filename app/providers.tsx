"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { useState } from "react";

const config = createConfig({ chains: [baseSepolia], connectors: [injected()], transports: { [baseSepolia.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || undefined) }, ssr: true });
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <WagmiProvider config={config}><QueryClientProvider client={client}>{children}</QueryClientProvider></WagmiProvider>;
}
