import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { HomeInfoProvider } from "./context/HomeInfoContext";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home/Home";
import AnimeInfo from "./pages/animeInfo/AnimeInfo";
import Profile from "./pages/profile/Profile";
import AuthCallback from "./pages/auth/AuthCallback";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Error from "./components/error/Error";
import Category from "./pages/category/Category";
import AtoZ from "./pages/a2z/AtoZ";
import { azRoute, categoryRoutes } from "./utils/category.utils";
import "./App.css";
import Search from "./pages/search/Search";
import Watch from "./pages/watch/Watch";
import Producer from "./components/producer/Producer";
import SplashScreen from "./components/splashscreen/SplashScreen";
import Terms from "./pages/terms/Terms";
import DMCA from "./pages/dmca/DMCA";
import Contact from "./pages/contact/Contact";
import Genres from "./pages/genres/Genres";
import SchedulePage from "./pages/schedule/SchedulePage";

function App() {
  const location = useLocation();

  // Scroll to top on location change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Check if the current route is for the splash screen or watch page
  const isSplashScreen = location.pathname === "/";
  const isWatchPage = location.pathname.startsWith("/watch");

  return (
    <AuthProvider>
      <HomeInfoProvider>
        <div className={`app-container ${isWatchPage ? "p-0 m-0 w-full" : "px-4 lg:px-10"}`}>
          <main className={`content w-full ${isWatchPage ? "max-w-none m-0 p-0" : "max-w-[2048px] mx-auto"}`}>
            {!isSplashScreen && <Navbar />}
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/random" element={<AnimeInfo random={true} />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/scheduled" element={<SchedulePage />} />
              <Route path="/estimated-schedule" element={<SchedulePage />} />
              <Route path="/404-not-found-page" element={<Error error="404" />} />
              <Route path="/error-page" element={<Error />} />
              <Route path="/terms-of-service" element={<Terms />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/producer/:id" element={<Producer />} />
            <Route path="/search" element={<Search />} />
            <Route path="/filter" element={<Search />} />
            <Route path="/filtter" element={<Search />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/genre" element={<Genres />} />
            <Route path="/genre/:genre" element={<Category />} />
            <Route path="/genres/:genre" element={<Category />} />
            {/* Render category routes */}
            {categoryRoutes.map((path) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <Category path={path} label={path.split("-").join(" ")} />
                }
              />
            ))}
            {/* Render A to Z routes */}
            {azRoute.map((path) => (
              <Route
                key={path}
                path={`/${path}`}
                element={<AtoZ path={path} />}
              />
            ))}
            {/* Anime info route */}
            <Route path="/:id" element={<AnimeInfo />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<Error error="404" />} />
          </Routes>
          {!isSplashScreen && <Footer />}
        </main>
        <Analytics />
        <SpeedInsights />
        </div>
      </HomeInfoProvider>
    </AuthProvider>
  );
}

export default App;
