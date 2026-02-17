import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider } from "../auth/AuthContext";
import { LanguageProvider } from "../shared/contexts/LanguageContext";
import { ThemeProvider } from "../shared/contexts/ThemeContext";
import PrivateRoute from "@/shared/components/auth/PrivateRoute";

// Layout
import Layout from "../shared/components/layout/Layout";

// User Pages
import Dashboard from "./user/Dashboard";
import About from "./public/About";
import Share from "./public/Share";
import Explore from "./user/Explore";
import Settings from "./user/Settings";
import NotFound from "./public/NotFound";

import TempleArchitecture from "@/app/user/TempleArchitecture";
import ArchitectureViewer from "@/app/user/ArchitectureViewer";
import SthanaVandan from "@/app/user/SthanaVandan";
import SwamiYatra from "@/app/user/SwamiYatra";
import Profile from "@/app/user/Profile";
import Saved from "@/app/user/Saved";
import Literature from "@/app/user/Literature";
import SthanaDetail from "@/app/user/SthanaDetail";
import AudioPlayer from "@/app/user/AudioPlayer";
import VideoPlayer from "@/app/user/VideoPlayer";
import VandanHistory from "@/app/user/VandanHistory";
import WhatsNew from "@/app/user/WhatsNew";
import Jigyasa from "@/app/user/Jigyasa";
import ELibrary from "@/app/user/ELibrary";
import HelpCenter from "@/app/public/HelpCenter";

// Admin Pages
import AdminLogin from "@/app/admin/AdminLogin";
import AdminDashboard from "@/app/admin/AdminDashboard";
import SthanaDirectory from "@/app/admin/SthanaDirectory";

import AdminAddTemple from "@/app/admin/AdminAddTemple";
import AdminCsvImport from "@/app/admin/AdminCsvImport";
import AdminCsvUpload from "./admin/AdminCsvUpload";
import TempleArchitectureAdmin from "@/app/admin/TempleArchitectureAdmin";
import ManageYatra from "@/app/admin/ManageYatra";
import RajViharanAdmin from "@/app/admin/RajViharanAdmin";
import AbbreviationsManager from "@/app/admin/AbbreviationsManager";

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
