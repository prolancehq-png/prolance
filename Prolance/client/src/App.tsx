import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GigsList from "@/pages/GigsList";
import GigDetails from "@/pages/GigDetails";
import Dashboard from "@/pages/Dashboard";
import OrderDetails from "@/pages/OrderDetails";
import CreateGig from "@/pages/CreateGig";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  
  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gigs" component={GigsList} />
      <Route path="/gigs/new">
        {() => <ProtectedRoute component={CreateGig} />}
      </Route>
      <Route path="/gigs/:id" component={GigDetails} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/orders/:id">
        {() => <ProtectedRoute component={OrderDetails} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
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
