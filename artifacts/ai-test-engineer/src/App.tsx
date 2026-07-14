import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DocumentProvider } from "@/context/DocumentContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import RequirementAnalysis from "@/pages/RequirementAnalysis";
import TestCaseGenerator from "@/pages/TestCaseGenerator";
import TestDataGenerator from "@/pages/TestDataGenerator";
import DefectPrediction from "@/pages/DefectPrediction";
import DuplicateDetectionPage from "@/pages/DuplicateDetectionPage";
import TestReport from "@/pages/TestReport";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/analysis" component={RequirementAnalysis} />
        <Route path="/test-cases" component={TestCaseGenerator} />
        <Route path="/test-data" component={TestDataGenerator} />
        <Route path="/prediction" component={DefectPrediction} />
        <Route path="/duplicates" component={DuplicateDetectionPage} />
        <Route path="/report" component={TestReport} />
        <Route component={Dashboard} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DocumentProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </DocumentProvider>
        <Toaster />
        <Sonner position="top-right" theme="dark" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
