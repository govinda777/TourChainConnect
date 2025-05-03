import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import CrowdfundingPage from "@/pages/CrowdfundingPage";
import JourneyPage from "@/pages/JourneyPage";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function Router() {
  const [location] = useLocation();
  
  // Don't show header/footer on journey pages for immersive experience
  const isJourneyPage = location.startsWith("/journey");
  
  return (
    <>
      <ScrollToTop />
      {!isJourneyPage && <Header />}
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/crowdfunding" component={CrowdfundingPage} />
        <Route path="/journey/:type?" component={JourneyPage} />
        <Route component={NotFound} />
      </Switch>
      {!isJourneyPage && <Footer />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
