import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { Temple } from "@/types";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Explore = () => {
    const [temples, setTemples] = useState<Temple[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "temples"), (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Temple[];
            setTemples(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredTemples = temples.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.district?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="space-y-4 text-center md:text-left">
                <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary tracking-tight">
                    Explore Sthanas
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Discover the sacred geography of Maharashtra through our curated digital archive.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search by name or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 rounded-full border-border/50 bg-card shadow-sm focus-visible:ring-primary/20"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 bg-muted/40 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemples.map((temple) => (
                        <div
                            key={temple.id}
                            className="group relative bg-card rounded-3xl overflow-hidden border border-border/50 shadow-soft hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                            onClick={() => {
                                // Open architecture view or maybe a detail page? 
                                // For now, let's navigate to architecture view as it's the most detailed page we have
                                navigate(`/temple/${temple.id}/architecture`);
                            }}
                        >
                            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                {temple.images?.[0] ? (
                                    <img
                                        src={temple.images[0]}
                                        alt={temple.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary/5 text-secondary/20">
                                        <MapPin className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-90">{temple.district || "Maharashtra"}</p>
                                    <h3 className="font-heading text-xl font-bold leading-tight group-hover:text-primary-foreground transition-colors">
                                        {temple.name}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-5 flex items-center justify-between">
                                <div className="text-sm text-muted-foreground line-clamp-2 pr-4">
                                    {temple.description || "A sacred destination waiting to be explored."}
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary shrink-0">
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredTemples.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No sacred sthanas found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default Explore;
