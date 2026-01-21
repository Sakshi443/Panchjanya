import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Map,
    BookOpen,
    Sparkles,
    BrainCircuit,
    Library,
    ChevronRight,
    HelpCircle,
    User
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
    const { user } = useAuth();
    const userName = user?.displayName; // Fallback name from design

    return (
        <div className="max-w-md mx-auto lg:max-w-4xl px-4 lg:px-6 pb-8 lg:pb-0 space-y-8 animate-in fade-in duration-500">

            {/* Top Bar */}
            <div className="flex items-center justify-between py-4">
                <div className="w-10 h-10 bg-green-900/10 rounded-full flex items-center justify-center border border-green-900/20">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain opacity-100" />
                </div>
                <h1 className="text-2xl font-heading font-bold text-[#0f3c6e]">Panchajanya</h1>
                <Link to="/profile" className="cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-10 h-10 rounded-full border-2 border-amber-500 p-0.5">
                        <div className="w-full h-full bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-bold">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Greeting Section */}
            <div className="space-y-2 mt-4 lg:mt-0 text-center lg:text-left">
                <p className="text-amber-600 italic font-medium font-serif text-lg">Pranaam,</p>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold text-[#0f3c6e]">
                    {userName}
                </h1>
                <p className="text-slate-600 text-sm">
                    The sacred archive awaits your presence today.
                </p>
            </div>

            {/* Main Grid Navigation */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Sthaan Vandan */}
                <Link to="/dashboard/sthana-vandan" className="group">
                    <Card className="h-full p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-amber-100 bg-orange-50/30 group-hover:bg-orange-50/50">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-100/50 rounded-xl text-blue-700 group-hover:scale-110 transition-transform duration-300">
                                <Map className="w-6 h-6" />
                            </div>
                            <div className="opacity-20 text-orange-300">
                                {/* Decorative Temple Icon (using SVG or icon) */}
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 opacity-20 text-orange-300">
                                    <path d="M4 22h16a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1z" />
                                    <path d="M18 18v-8a4 4 0 0 0-1-3l-4-7a2 2 0 0 0-2 0l-4 7a4 4 0 0 0-1 3v8" />
                                    <path d="M12 2v2" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="font-heading font-bold text-lg text-blue-900 group-hover:text-blue-700">
                                Sthaan Vandan
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Sacred Salutation to holy sites.
                            </p>
                        </div>
                    </Card>
                </Link>

                {/* Literature (Audio/Video) */}
                <Link to="/literature" className="group">
                    <Card className="h-full p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-sky-100 bg-sky-50/30 group-hover:bg-sky-50/50">
                        <div className="flex justify-start">
                            <div className="p-3 bg-blue-100/50 rounded-xl text-blue-700 group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="font-heading font-bold text-lg text-blue-900 group-hover:text-blue-700">
                                Literature
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Ancient texts & sacred scrolls.
                            </p>
                        </div>
                    </Card>
                </Link>

                {/* What's New */}
                <Link to="/whats-new" className="group">
                    <Card className="h-full p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-yellow-100 bg-yellow-50/30 group-hover:bg-yellow-50/50">
                        <div className="flex justify-start">
                            <div className="p-3 bg-amber-100/50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="font-heading font-bold text-lg text-blue-900 group-hover:text-blue-700">
                                What's New
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Latest updates from the heritage.
                            </p>
                        </div>
                    </Card>
                </Link>

                {/* Jigyasa */}
                <Link to="/jigyasa" className="group">
                    <Card className="h-full p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 border-indigo-100 bg-indigo-50/30 group-hover:bg-indigo-50/50">
                        <div className="flex justify-start">
                            <div className="p-3 bg-blue-100/50 rounded-xl text-blue-700 group-hover:scale-110 transition-transform duration-300">
                                <BrainCircuit className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-4 space-y-1">
                            <h3 className="font-heading font-bold text-lg text-blue-900 group-hover:text-blue-700">
                                Jigyasa
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Quest for deep knowledge.
                            </p>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* E-Library Banner */}
            <Link to="/e-library" className="block group">
                <div className="relative overflow-hidden rounded-2xl bg-[#0f3c6e] p-6 text-white shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                                <Library className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-xl">The E-Library</h3>
                                <p className="text-blue-100 text-sm mt-1 max-w-[200px] lg:max-w-none">
                                    Your personal digital collection of wisdom.
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/70 group-hover:translate-x-1 transition-transform" />
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-transparent opacity-50" />
                </div>
            </Link>

            {/* Quick Support */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-l-4 border-amber-600 pl-3">
                    <h2 className="font-heading font-bold text-xl text-blue-900">Quick Support</h2>
                </div>

                <div className="space-y-3">
                    <Link to="/help-center">
                        <Button variant="outline" className="w-full justify-between h-auto py-4 px-5 rounded-xl border-border/50 hover:border-primary/50 hover:bg-orange-50/30 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-800 rounded-full">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-foreground">Help Center</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    <Link to="/settings">
                        <Button variant="outline" className="w-full justify-between h-auto py-4 px-5 mt-3 rounded-xl border-border/50 hover:border-primary/50 hover:bg-orange-50/30 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-800 rounded-full">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-foreground">Account Preferences</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
