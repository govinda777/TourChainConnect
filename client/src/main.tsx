import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { BlockchainProvider } from "./lib/blockchain/providers/BlockchainProvider";
import "./index.css";
// Remixicon is already loaded via CDN in index.html, removed to avoid conflicts

// Criar cliente de query para gerenciar solicitações de dados
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BlockchainProvider>
      <App />
    </BlockchainProvider>
  </QueryClientProvider>
);
