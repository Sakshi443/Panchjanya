// src/components/PrivateRoute.tsx

import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: ReactNode;
  adminRequired?: boolean; // if true, only allow admins
}

const PrivateRoute = ({ children, adminRequired = false }: Props) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  // Not logged in
  if (!user) {
    return <Navigate to={adminRequired ? "/admin/login" : "/login"} replace />;
  }

  // Admin page, but user is not admin
  if (adminRequired && !isAdmin) {
    return <Navigate to="/" replace />; // redirect non-admin users
  }

  return <>{children}</>;
};

export default PrivateRoute;
