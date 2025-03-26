import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

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
import OrganizationsSettings from "@/pages/settings/organizations";
import NewOrganization from "@/pages/settings/organizations/new";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/pages" component={PagesIndex} />
      <ProtectedRoute path="/pages/new" component={PageEditor} />
      <ProtectedRoute path="/pages/edit/:id" component={PageEditor} />
      <ProtectedRoute path="/blog" component={BlogIndex} />
      <ProtectedRoute path="/blog/new" component={BlogEditor} />
      <ProtectedRoute path="/blog/edit/:id" component={BlogEditor} />
      <ProtectedRoute path="/media" component={MediaIndex} />
      <ProtectedRoute path="/courses" component={CoursesIndex} />
      <ProtectedRoute path="/settings/users" component={UsersSettings} />
      <ProtectedRoute path="/settings/branding" component={BrandingSettings} />
      <ProtectedRoute path="/settings/appearance" component={AppearanceSettings} />
      <ProtectedRoute path="/settings/integrations" component={IntegrationsSettings} />
      <ProtectedRoute path="/settings/api" component={ApiSettings} />
      <ProtectedRoute path="/settings/organizations" component={OrganizationsSettings} />
      <ProtectedRoute path="/settings/organizations/new" component={NewOrganization} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
