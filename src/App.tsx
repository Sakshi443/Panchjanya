// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "@/components/auth/PrivateRoute";

// Layout
import Layout from "./components/layout/Layout";

// User Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Share from "./pages/Share";
import Explore from "./pages/Explore";
import Settings from "./pages/Settings";
// import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

import TempleArchitecture from "@/pages/TempleArchitecture";

// Admin Pages
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

import AdminAddTemple from "@/pages/admin/AdminAddTemple";
import AdminTempleEdit from "@/pages/admin/AdminTempleEdit";
import AdminCsvImport from "@/pages/admin/AdminCsvImport";
import AdminCsvUpload from "./pages/admin/AdminCsvUpload";
import TempleArchitectureAdmin from "@/pages/admin/TempleArchitectureAdmin";
import ManageYatra from "@/pages/admin/ManageYatra";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Router>
        <AuthProvider>
          <Routes>
            {/* ---------------------- USER AUTH ---------------------- */}
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/signup" element={<Signup />} />

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

            {/* <Route path="/admin/csv-upload" element={<AdminCsvUpload />} /> */}


            <Route
              path="/admin/temples/add"
              element={
                <PrivateRoute adminRequired={true} >
                  <AdminAddTemple />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/temples/edit/:id"
              element={
                <PrivateRoute adminRequired={true} >
                  <AdminTempleEdit />
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
              path="/admin/csv-upload"
              element={
                <PrivateRoute adminRequired={true}>
                  <AdminCsvUpload />
                </PrivateRoute>
              }
            />

            {/* ---------------------- USER ROUTES WITH LAYOUT ---------------------- */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/about" element={<About />} />
              <Route path="/share" element={<Share />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* ---------------------- TEMPLE ARCHITECTURE (USER) ---------------------- */}
            <Route path="/temple/:id/architecture" element={<TempleArchitecture />} />

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
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
