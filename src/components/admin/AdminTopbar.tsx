import React from "react";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function AdminTopbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">Temple Admin Dashboard</h1>
      <div>
        <Button variant="destructive" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
