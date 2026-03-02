import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "marathi" | "hindi" | "english";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    marathi: {
        // Navigation
        "nav.home": "मुख्यपृष्ठ",
        "nav.explore": "शोधा",
        "nav.yatra": "यात्रा",
        "nav.about": "आमच्याबद्दल",
        "nav.settings": "सेटिंग्ज",

        // Common
        "common.search": "शोधा",
        "common.loading": "लोड होत आहे...",
        "common.error": "त्रुटी",
        "common.save": "जतन करा",
        "common.cancel": "रद्द करा",
        "common.close": "बंद करा",
        "common.viewDetails": "तपशील पहा",

        // Explore page
        "explore.title": "Panchajanya",
        "explore.searchPlaceholder": "पवित्र वारसा शोधा...",

        // Temple details
        "temple.verified": "पंचजन्य सत्यापित",
        "temple.architecture": "स्थान वास्तुकला",
        "temple.navigation": "दिशानिर्देश",
        "temple.share": "सामायिक करा",
        "temple.information": "स्थानांची माहिती",
        "temple.directions": "जाण्याचा मार्ग",
        "temple.history": "इतिहास",
        "temple.openInMaps": "Google Maps मध्ये उघडा",

        // Settings
        "settings.title": "सेटिंग्ज",
        "settings.language": "भाषा",
        "settings.languageDesc": "तुमची पसंतीची भाषा निवडा",
        "settings.notifications": "सूचना",
        "settings.notificationsDesc": "सूचना प्राधान्ये व्यवस्थापित करा",
        "settings.darkMode": "डार्क मोड",
        "settings.darkModeDesc": "गडद थीम टॉगल करा",
        "settings.mapPreferences": "नकाशा प्राधान्ये",
        "settings.mapPreferencesDesc": "नकाशा प्रदर्शन सानुकूलित करा",
        "settings.saveChanges": "बदल जतन करा",
    },
    hindi: {
        // Navigation
        "nav.home": "मुख्य पृष्ठ",
        "nav.explore": "खोजें",
        "nav.yatra": "यात्रा",
        "nav.about": "हमारे बारे में",
        "nav.settings": "सेटिंग्स",

        // Common
        "common.search": "खोजें",
        "common.loading": "लोड हो रहा है...",
        "common.error": "त्रुटि",
        "common.save": "सहेजें",
        "common.cancel": "रद्द करें",
        "common.close": "बंद करें",
        "common.viewDetails": "विवरण देखें",

        // Explore page
        "explore.title": "Panchajanya",
        "explore.searchPlaceholder": "पवित्र विरासत खोजें...",

        // Temple details
        "temple.verified": "पंचजन्य सत्यापित",
        "temple.architecture": "स्थान वास्तुकला",
        "temple.navigation": "दिशा-निर्देश",
        "temple.share": "साझा करें",
        "temple.information": "स्थान की जानकारी",
        "temple.directions": "जाने का रास्ता",
        "temple.history": "इतिहास",
        "temple.openInMaps": "Google Maps में खोलें",

        // Settings
        "settings.title": "सेटिंग्स",
        "settings.language": "भाषा",
        "settings.languageDesc": "अपनी पसंदीदा भाषा चुनें",
        "settings.notifications": "सूचनाएं",
        "settings.notificationsDesc": "सूचना प्राथमिकताएं प्रबंधित करें",
        "settings.darkMode": "डार्क मोड",
        "settings.darkModeDesc": "गहरा थीम टॉगल करें",
        "settings.mapPreferences": "मानचित्र प्राथमिकताएं",
        "settings.mapPreferencesDesc": "मानचित्र प्रदर्शन अनुकूलित करें",
        "settings.saveChanges": "परिवर्तन सहेजें",
    },
    english: {
        // Navigation
        "nav.home": "Home",
        "nav.explore": "Explore",
        "nav.yatra": "Yatra",
        "nav.about": "About",
        "nav.settings": "Settings",

        // Common
        "common.search": "Search",
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.close": "Close",
        "common.viewDetails": "View Details",

        // Explore page
        "explore.title": "Panchajanya",
        "explore.searchPlaceholder": "Search sacred heritage...",

        // Temple details
        "temple.verified": "Panchajanya Verified",
        "temple.architecture": "Sthana Architecture",
        "temple.navigation": "Navigation",
        "temple.share": "Share",
        "temple.information": "Temple Information",
        "temple.directions": "Directions",
        "temple.history": "History",
        "temple.openInMaps": "Open in Google Maps",

        // Settings
        "settings.title": "Settings",
        "settings.language": "Language",
        "settings.languageDesc": "Choose your preferred language",
        "settings.notifications": "Notifications",
        "settings.notificationsDesc": "Manage notification preferences",
        "settings.darkMode": "Dark Mode",
        "settings.darkModeDesc": "Toggle dark theme",
        "settings.mapPreferences": "Map Preferences",
        "settings.mapPreferencesDesc": "Customize map display",
        "settings.saveChanges": "Save Changes",
    },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem("language");
        return (saved as Language) || "marathi";
    });

    useEffect(() => {
        localStorage.setItem("language", language);
        // Apply Kokila font if language is Marathi
        if (language === "marathi") {
            document.body.classList.add("font-kokila");
        } else {
            document.body.classList.remove("font-kokila");
        }
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations.marathi] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within LanguageProvider");
    }
    return context;
}
