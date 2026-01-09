import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";
import AdminLayout from "@/components/admin/AdminLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Compass, Search, MapPin, Loader2, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [temples, setTemples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // 🔍 DEBUG: Check auth state and admin claims
  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then(token => {
        if (!token.claims.admin) {
          console.warn("⚠️ User is logged in but does NOT have admin claim!");
        }
      });
    }
  }, [user]);

  const handleRefreshToken = async () => {
    const { refreshToken } = useAuth();
    try {
      await refreshToken();
      toast({ title: "Token Refreshed", description: "Please refresh the page to see changes." });
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  const fetchTemples = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "temples"));
      setTemples(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error: any) {
      console.error("Error fetching temples:", error);
      toast({
        title: "Error",
        description: `Failed to fetch temples: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this temple? This action cannot be undone.")) return;

    try {
      await deleteDoc(doc(db, "temples", id));
      setTemples((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Success",
        description: "Temple deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting temple:", error);
      toast({
        title: "Error",
        description: "Failed to delete temple",
        variant: "destructive",
      });
    }
  };

  const filteredTemples = temples.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="font-heading text-4xl font-bold tracking-tight italic">Admin Dashboard</h1>
            <p className="text-muted-foreground font-medium">Managing the sacred archives of Bharat's heritage.</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate("/admin/temples/add")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Sthana
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Total Sthanas", value: temples.length, icon: MapPin, color: "text-primary", bg: "bg-primary/5" },
            { title: "Archived Media", value: "245", icon: Share, color: "text-accent", bg: "bg-accent/5" },
            { title: "Active Contributors", value: "8", icon: Edit, color: "text-secondary", bg: "bg-secondary/5" }
          ].map((stat, i) => (
            <Card key={i} className="rounded-[2rem] border-none shadow-soft overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">{stat.title}</p>
                  <div className="text-4xl font-heading font-black">{stat.value}</div>
                </div>
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-8 h-8", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Temples List Table */}
          <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-soft overflow-hidden">
            <CardHeader className="p-8 border-b border-border/50 bg-background/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <CardTitle className="font-heading text-2xl font-bold italic lowercase">Archive Records</CardTitle>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search the archive..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-11 bg-muted/30 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm font-medium text-muted-foreground italic">Fetching sacred scrolls...</p>
                </div>
              ) : filteredTemples.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground font-medium italic">No matching sthanas found in our records.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-left">Name</TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-left">Location</TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTemples.map((temple) => (
                        <TableRow key={temple.id} className="group border-b border-border/30 hover:bg-muted/30 transition-colors">
                          <TableCell className="px-8 py-6 font-heading font-bold text-lg text-foreground/80 lowercase">{temple.name}</TableCell>
                          <TableCell className="px-8 py-6">
                            <span className="text-sm font-medium text-muted-foreground">
                              {temple.city || temple.district || "Hidden Sthana"}
                            </span>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigate(`/admin/architecture/${temple.id}`)}
                                className="rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary"
                                title="Manage Architecture"
                              >
                                <Compass className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => navigate(`/admin/temples/edit/${temple.id}`)}
                                className="rounded-xl border-border/50 hover:bg-secondary/10 hover:text-secondary"
                                title="Edit Details"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(temple.id)}
                                className="rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive"
                                title="Delete Temple"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity/Sidebar Section */}
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-soft p-8 space-y-6">
              <h3 className="font-heading text-xl font-bold tracking-tight italic">System Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/admin/manage-yatra")}
                  variant="outline"
                  className="w-full justify-start h-12 rounded-2xl border-primary/20 hover:bg-primary/5 hover:text-primary font-medium"
                >
                  <Compass className="w-4 h-4 mr-3" />
                  Manage Swami's Yatra
                </Button>
                <Button
                  onClick={handleRefreshToken}
                  variant="outline"
                  className="w-full justify-start h-12 rounded-2xl border-border/50 hover:bg-muted/50 font-medium"
                >
                  <Loader2 className="w-4 h-4 mr-3" />
                  Refresh Session
                </Button>
                <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl">
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Authenticated</p>
                  <p className="text-sm font-bold truncate text-foreground/70">{user?.email}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-soft p-8">
              <h3 className="font-heading text-xl font-bold tracking-tight italic mb-6">Recent Activity</h3>
              <div className="space-y-6">
                {[
                  { user: "Admin", action: "Updated architecture", time: "2 hrs ago", target: "Renuka Mata" },
                  { user: "Editor", action: "Added new leela", time: "5 hrs ago", target: "Siddheshwar" },
                  { user: "Admin", action: "Batch CSV Input", time: "1 day ago", target: "24 Sthanas" }
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="text-sm font-bold text-foreground/70">{activity.action}</p>
                      <p className="text-xs text-muted-foreground italic">{activity.target} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
