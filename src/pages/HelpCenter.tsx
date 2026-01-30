import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search, ChevronDown, ChevronUp, Mail, Phone, MessageCircle, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function HelpCenter() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const faqSectionRef = useRef<HTMLDivElement>(null);
    const supportSectionRef = useRef<HTMLDivElement>(null);

    const toggleFaq = (id: string) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleChatClick = () => {
        // Find the chat button or open email
        window.location.href = "mailto:support@dharmadisha.com?subject=Chat Support Request";
    };

    const faqs = [
        {
            id: "1",
            question: "How do I start a Swami Yatra?",
            answer: "To start a Yatra, go to the 'Explorer' tab, select a temple from the map or list, and click on 'Start Navigation'. Follow the guided path to complete your journey."
        },
        {
            id: "2",
            question: "Can I use the app offline?",
            answer: "Yes, once you download the temple data and maps for a specific region, you can access them offline. However, real-time updates and live tracking require an internet connection."
        },
        {
            id: "3",
            question: "How do I save a temple to my list?",
            answer: "Tap the bookmark icon on any temple details page or map popup to save it to your 'Saved Temples' list, which you can access from your profile."
        },
        {
            id: "4",
            question: "Is the content available in other languages?",
            answer: "Currently, the app supports English and Marathi. You can change your language preference in the Profile > Settings menu."
        },
        {
            id: "5",
            question: "How can I contribute or donate?",
            answer: "Visit the 'Seva & Support' section in your profile to make a donation. All contributions go towards temple maintenance and digital preservation of heritage."
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F9F6F0] lg:bg-white pb-20">
            {/* Header */}
            {/* Header */}
            {/* Header */}
            <div className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between bg-background/95 lg:bg-white/95 backdrop-blur-sm">
                <Button variant="ghost" size="icon" className="-ml-2 hover:bg-black/5" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-7 h-7 text-[#0f3c6e]" />
                </Button>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#0f3c6e] font-serif">Help Center</h1>
                <div className="w-10" />
            </div>

            {/* Search Box Section - Moved below header */}
            <div className="px-6 py-4 bg-background/50">
                <h2 className="text-blue-900 text-xl font-bold mb-4 text-center">How can we help you?</h2>
                <div className="relative rounded-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search for answers..."
                        className="pl-12 pr-4 h-12 rounded-full border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus-visible:ring-offset-0 focus-visible:ring-amber-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Container */}
            <div className="px-6 py-6 relative z-10">
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <Card
                        className="p-4 flex flex-col items-center justify-center gap-2 bg-white border-none rounded-xl hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => scrollToSection(faqSectionRef)}
                    >
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-700">Guides</span>
                    </Card>
                    <Card
                        className="p-4 flex flex-col items-center justify-center gap-2 bg-white border-none rounded-xl hover:shadow-xl transition-all cursor-pointer"
                        onClick={handleChatClick}
                    >
                        <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-700">Chat</span>
                    </Card>
                    <Card
                        className="p-4 flex flex-col items-center justify-center gap-2 bg-white border-none rounded-xl hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => scrollToSection(supportSectionRef)}
                    >
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <Phone className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-700">Support</span>
                    </Card>
                </div>

                {/* FAQs */}
                <div className="mb-8" ref={faqSectionRef}>
                    <h3 className="font-heading font-bold text-lg text-blue-900 mb-4">
                        Frequently Asked Questions
                    </h3>
                    <div className="space-y-3">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300"
                                >
                                    <button
                                        onClick={() => toggleFaq(faq.id)}
                                        className="w-full flex items-center justify-between p-4 text-left"
                                    >
                                        <span className="font-bold text-gray-800 text-sm pr-4">{faq.question}</span>
                                        {openFaq === faq.id ? (
                                            <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>

                                    <div className={`px-4 pb-4 text-sm text-gray-600 leading-relaxed ${openFaq === faq.id ? 'block' : 'hidden'}`}>
                                        <div className="pt-2 border-t border-gray-100">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-white rounded-xl">
                                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>No results found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Support */}
                <div ref={supportSectionRef}>
                    <h3 className="font-heading font-bold text-lg text-blue-900 mb-4">
                        Still need help?
                    </h3>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 -mx-5 px-5 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 text-sm">Email Support</h4>
                                <p className="text-xs text-gray-500">support@dharmadisha.com</p>
                            </div>
                            <ChevronRightIcon />
                        </div>
                        <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 -mx-5 px-5 py-2 transition-colors rounded-b-xl">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 text-sm">Call Us</h4>
                                <p className="text-xs text-gray-500">+91 1800-123-4567</p>
                            </div>
                            <ChevronRightIcon />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChevronRightIcon() {
    return (
        <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    );
}
