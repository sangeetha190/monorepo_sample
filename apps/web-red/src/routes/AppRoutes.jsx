import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import routes from "./routes";

// ✅ Lazy imports
const Home = lazy(() => import("../pages/Home/Home"));
const About = lazy(() => import("../pages/About"));

// Auth
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ForgotOTP = lazy(() => import("../pages/Auth/ForgotOTP"));
const NewPassword = lazy(() => import("../pages/Auth/NewPassword"));

const AllGamesPage = lazy(() => import("../pages/Games/AllGamesPage"));

const FilteredGamesPage = lazy(() => import("../pages/Games/FilteredGamesPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ padding: 20 }}></div>}>
      <Routes>
        <Route path={routes.home} element={<Home />} />
        <Route path={routes.about} element={<About />} />

        {/* all Games */}
        <Route path={routes.games.all} element={<AllGamesPage />} />
        <Route path={routes.games.topGames} element={<AllGamesPage />} />

        <Route
            path={routes.games.filteredGames}
            element={<FilteredGamesPage />}
          />

        {/* Auth */}
        <Route path={routes.auth.login} element={<LoginPage />} />
        <Route path={routes.auth.register} element={<Register />} />
        <Route path={routes.auth.forgotPassword} element={<ForgotPassword />} />
        <Route path={routes.auth.forgotOTP} element={<ForgotOTP />} />
        <Route path={routes.auth.newPassword} element={<NewPassword />} />


        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 20 }}>404 - Not Found</div>} />
      </Routes>
    </Suspense>
  );
}
