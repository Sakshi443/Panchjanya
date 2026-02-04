import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import PrivateRoute from "@/components/auth/PrivateRoute";

// Layout
import Layout from "./components/layout/Layout";

// User Pages
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Share from "./pages/Share";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

import TempleArchitecture from "@/pages/TempleArchitecture";
import ArchitectureViewer from "@/pages/ArchitectureViewer";
import SthanaVandan from "@/pages/SthanaVandan";
import SwamiYatra from "@/pages/SwamiYatra";
import Profile from "@/pages/Profile";
import Saved from "@/pages/Saved";
import Literature from "@/pages/Literature";
import SthanaDetail from "@/pages/SthanaDetail";
import AudioPlayer from "@/pages/AudioPlayer";
import VideoPlayer from "@/pages/VideoPlayer";
import VandanHistory from "@/pages/VandanHistory";
import WhatsNew from "@/pages/WhatsNew";
import Jigyasa from "@/pages/Jigyasa";
import ELibrary from "@/pages/ELibrary";
import HelpCenter from "@/pages/HelpCenter";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import SthanaDirectory from "@/pages/admin/SthanaDirectory";

import AdminAddTemple from "@/pages/admin/AdminAddTemple";
import AdminCsvImport from "@/pages/admin/AdminCsvImport";
import AdminCsvUpload from "./pages/admin/AdminCsvUpload";
import TempleArchitectureAdmin from "@/pages/admin/TempleArchitectureAdmin";
import ManageYatra from "@/pages/admin/ManageYatra";
import RajViharanAdmin from "@/pages/admin/RajViharanAdmin";
import AbbreviationsManager from "@/pages/admin/AbbreviationsManager";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <Routes>
                  {/* ---------------------- ADMIN AUTH ---------------------- */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* ---------------------- ADMIN PROTECTED ROUTES ---------------------- */}
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute adminRequired={true} >
                        <AdminDashboard />
                      </PrivateRoute>
                    }
                  />

                  <Route path="/admin/dashboard" element={
                    <PrivateRoute adminRequired={true} >
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                  />

                  <Route path="/admin/sthana-directory" element={
                    <PrivateRoute adminRequired={true} >
                      <SthanaDirectory />
                    </PrivateRoute>
                  }
                  />

                  <Route
                    path="/admin/temples/add"
                    element={
                      <PrivateRoute adminRequired={true} >
                        <AdminAddTemple />
                      </PrivateRoute>
                    }
                  />


                  <Route
                    path="/admin/csv-import"
                    element={
                      <PrivateRoute adminRequired={true}>
                        <AdminCsvImport />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/admin/manage-yatra"
                    element={
                      <PrivateRoute adminRequired={true}>
                        <ManageYatra />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/admin/raj-viharan"
                    element={
                      <PrivateRoute adminRequired={true}>
                        <RajViharanAdmin />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/admin/abbreviations"
                    element={
                      <PrivateRoute adminRequired={true}>
                        <AbbreviationsManager />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/admin/csv-upload"
                    element={
                      <PrivateRoute adminRequired={true}>
                        <AdminCsvUpload />
                      </PrivateRoute>
                    }
                  />

                  {/* ---------------------- USER ROUTES WITH LAYOUT ---------------------- */}
                  <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/sthana-vandan" element={<SthanaVandan />} />
                    <Route path="/raj-viharan" element={<SwamiYatra />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/share" element={<Share />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/literature" element={<Literature />} />
                    <Route path="/vandan-history" element={<VandanHistory />} />
                    <Route path="/whats-new" element={<WhatsNew />} />
                    <Route path="/jigyasa" element={<Jigyasa />} />
                    <Route path="/e-library" element={<ELibrary />} />
                    <Route path="/help-center" element={<HelpCenter />} />
                  </Route>

                  {/* ---------------------- MEDIA PLAYERS (FULLSCREEN) ---------------------- */}
                  <Route path="/audio/:id" element={<AudioPlayer />} />
                  <Route path="/video/:id" element={<VideoPlayer />} />

                  {/* ---------------------- TEMPLE ARCHITECTURE (USER) ---------------------- */}
                  <Route path="/temple/:id/architecture" element={<TempleArchitecture />} />
                  <Route path="/temple/:id/architecture-view" element={<ArchitectureViewer />} />
                  <Route path="/temple/:id/architecture/sthana/:sthanaId" element={<SthanaDetail />} />

                  {/* ---------------------- ADMIN ARCHITECTURE ---------------------- */}
                  <Route
                    path="/admin/architecture/:id"
                    element={
                      <PrivateRoute adminRequired={true}>
                        <TempleArchitectureAdmin />
                      </PrivateRoute>
                    }
                  />

                  {/* ---------------------- 404 ---------------------- */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
