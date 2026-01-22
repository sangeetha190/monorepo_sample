import { useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@repo/frontend-core/bootstrap"; // or "@core/bootstrap" if exports not set
import "./index.css";
import "swiper/css";
import App from "./App.jsx";
// import "bootstrap/dist/css/bootstrap.min.css";
// ✅ React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AuthContext, { AuthProvider } from "@core/auth/AuthContext";
import RouteTracker from "@core/auth/RouteTracker";

// ✅ Forbidden page usually stays in app UI
import ForbiddenPage from "./pages/ErrorPages/ForbiddenPage.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

function RootApp() {
  const { portalStatus, portalErrorMsg } = useContext(AuthContext);

  if (portalStatus === "loading") {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-white">
        Loading portal...
      </div>
    );
  }

  if (portalStatus === "forbidden") return <ForbiddenPage />;

  return <App />;
}

createRoot(document.getElementById("root")).render(
  // StrictMode can cause dev-only double effects (same as you noted)
  <>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouteTracker>
            <RootApp />
          </RouteTracker>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </>
);
