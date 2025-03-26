import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Dashboard from "@/pages/dashboard";
import PagesIndex from "@/pages/pages/index";
import PageEditor from "@/pages/pages/editor";
import BlogIndex from "@/pages/blog/index";
import BlogEditor from "@/pages/blog/editor";
import MediaIndex from "@/pages/media/index";
import CoursesIndex from "@/pages/courses/index";
import UsersSettings from "@/pages/settings/users";
import BrandingSettings from "@/pages/settings/branding";
import AppearanceSettings from "@/pages/settings/appearance";
import IntegrationsSettings from "@/pages/settings/integrations";
import ApiSettings from "@/pages/settings/api";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pages" component={PagesIndex} />
      <Route path="/pages/new" component={PageEditor} />
      <Route path="/pages/edit/:id" component={PageEditor} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/new" component={BlogEditor} />
      <Route path="/blog/edit/:id" component={BlogEditor} />
      <Route path="/media" component={MediaIndex} />
      <Route path="/courses" component={CoursesIndex} />
      <Route path="/settings/users" component={UsersSettings} />
      <Route path="/settings/branding" component={BrandingSettings} />
      <Route path="/settings/appearance" component={AppearanceSettings} />
      <Route path="/settings/integrations" component={IntegrationsSettings} />
      <Route path="/settings/api" component={ApiSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
