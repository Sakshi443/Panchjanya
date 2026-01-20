import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Bookmark, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

interface Book {
    id: string;
    title: string;
    titleHindi: string;
    author: string;
    authorHindi: string;
    description: string;
    descriptionHindi: string;
    category: string;
    coverImage: string;
    pdfUrl?: string;
}

export default function Literature() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [books, setBooks] = useState<Book[]>([]);

    const categories = [
        { id: "all", label: "सर्व", labelEn: "All" },
        { id: "spiritual", label: "अध्यात्मिक", labelEn: "Spiritual" },
        { id: "history", label: "इतिहास", labelEn: "History" },
        { id: "literature", label: "तत्त्वज्ञान", labelEn: "Literature" },
    ];

    // Fetch books
    useEffect(() => {
        let q;
        if (activeCategory === "all") {
            q = query(collection(db, "books"));
        } else {
            q = query(collection(db, "books"), where("category", "==", activeCategory));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const booksData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Book[];
            setBooks(booksData);
        });

        return () => unsubscribe();
    }, [activeCategory]);

    // Filter books by search
    const filteredBooks = books.filter(
        (book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.titleHindi.includes(searchQuery) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.authorHindi.includes(searchQuery)
    );

    // Group books by category
    const groupedBooks = filteredBooks.reduce((acc, book) => {
        const category = book.category || "other";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(book);
        return acc;
    }, {} as Record<string, Book[]>);

    const getCategoryTitle = (category: string) => {
        switch (category) {
            case "spiritual":
                return "अध्यात्मिक ग्रंथ (Spiritual)";
            case "history":
                return "ऐतिहासिक वारसा (History)";
            case "literature":
                return "साहित्य (Literature)";
            default:
                return category;
        }
    };

    // Default books if Firestore is empty
    const defaultBooks: Book[] = [
        {
            id: "1",
            title: "Shrimad Bhagavad Gita",
            titleHindi: "श्रीमद्भगवद्गीता",
            author: "Vyasa Muni",
            authorHindi: "व्यास मुनी",
            description: "Divine dialogue between Lord Krishna and Arjuna",
            descriptionHindi: "मानवी जीवनाचे सार आणि कर्तव्याचे मार्गदर्शन करणारा पवित्र ग्रंथ.",
            category: "spiritual",
            coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
        },
        {
            id: "2",
            title: "Bhavārth Dīpikā (Jñāneśvarī)",
            titleHindi: "भावार्थ दीपिका (ज्ञानेश्वरी)",
            author: "Sant Jñāneśvar",
            authorHindi: "संत ज्ञानेश्वर",
            description: "Marathi commentary on the Bhagavad Gita",
            descriptionHindi: "भगवद्गीतावर मराठी भाषेत केलेले ओजस्वी आणि अमृततुल्य भाष्य.",
            category: "spiritual",
            coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
        },
        {
            id: "3",
            title: "Shivaji Maharaj: Management Guru",
            titleHindi: "शिवाजी महाराज: मॅनेजमेंट गुरू",
            author: "Namdev Rao Jadhav",
            authorHindi: "नामदेवराव जाधव",
            description: "Leadership lessons from Chhatrapati Shivaji Maharaj",
            descriptionHindi: "छत्रपती शिवाजी महाराजांच्या व्यवस्थापन कौशल्याची सखोल माहिती.",
            category: "history",
            coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
        },
    ];

    const displayBooks = filteredBooks.length > 0 ? groupedBooks : { spiritual: defaultBooks.filter(b => b.category === "spiritual"), history: defaultBooks.filter(b => b.category === "history") };

    return (
        <div className="min-h-screen bg-[#F9F6F0] pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-6 h-6 text-blue-900" />
                    </Button>
                    <h1 className="font-heading font-bold text-2xl text-blue-600">
                        E-Library
                    </h1>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bookmark className="w-6 h-6 text-blue-900" />
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="पुस्तके, लेखक किंवा विषय शोधा..."
                        className="pl-12 pr-4 h-12 rounded-full border-gray-200 bg-gray-50 focus-visible:ring-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeCategory === category.id
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
                {Object.entries(displayBooks).map(([category, categoryBooks]) => (
                    <div key={category} className="mb-8">
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-heading font-bold text-xl text-blue-600">
                                {getCategoryTitle(category)}
                            </h2>
                            <button className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                                सर्व पहा
                            </button>
                        </div>

                        {/* Books List */}
                        <div className="space-y-4">
                            {categoryBooks.map((book) => (
                                <div
                                    key={book.id}
                                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex gap-4">
                                        {/* Book Cover */}
                                        <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-gradient-to-br from-blue-900 to-blue-700">
                                            <img
                                                src={book.coverImage}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%230f3c6e' width='100' height='100'/%3E%3C/svg%3E";
                                                }}
                                            />
                                        </div>

                                        {/* Book Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-blue-600 text-base mb-1">
                                                {book.titleHindi}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {book.authorHindi}
                                            </p>
                                            <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-2">
                                                {book.descriptionHindi}
                                            </p>

                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 h-9 text-sm font-bold"
                                                onClick={() => navigate(`/book/${book.id}`)}
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                                </svg>
                                                आता वाचा
                                            </Button>
                                        </div>

                                        {/* More Options */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="flex-shrink-0 self-start"
                                        >
                                            <MoreVertical className="w-5 h-5 text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredBooks.length === 0 && books.length > 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-2">कोणतीही पुस्तके सापडली नाहीत</p>
                        <p className="text-sm text-gray-400">
                            कृपया दुसरा शोध प्रयत्न करा
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
