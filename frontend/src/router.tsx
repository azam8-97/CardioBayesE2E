import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import Demo from "./pages/Demo";
import Auth from "./pages/Auth";
import Inference from "./pages/Inference";
import Results from "./pages/Results";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Models from "./pages/Models";
import Research from "./pages/Research";
import Docs from "./pages/Docs";
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminJobs from "./pages/admin/Jobs";
import AdminModels from "./pages/admin/Models";
import AdminEvents from "./pages/admin/Events";
import AdminRoles from "./pages/admin/Roles";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/demo",
    element: <Demo />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/inference",
    element: (
      <ProtectedRoute>
        <Inference />
      </ProtectedRoute>
    ),
  },
  {
    path: "/results/:jobId",
    element: (
      <ProtectedRoute>
        <Results />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/models",
    element: <Models />,
  },
  {
    path: "/research",
    element: <Research />,
  },
  {
    path: "/docs",
    element: <Docs />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminOverview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminUsers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/jobs",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminJobs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/models",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminModels />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/events",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminEvents />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/roles",
    element: (
      <ProtectedRoute requiredRole="superadmin">
        <AdminRoles />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
