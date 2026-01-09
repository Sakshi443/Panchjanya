# 🏛️ Panchjanya

> **A modern web platform for discovering, exploring, and preserving India's sacred temple heritage**

Panchjanya is an interactive temple discovery application that brings India's rich spiritual architecture to your fingertips. Built for tourists, pilgrims, researchers, and heritage enthusiasts, it combines real-time geolocation, detailed architectural insights, and immersive visual experiences.

[![CI Build](https://github.com/Sakshi443/Panchjanya/actions/workflows/ci.yml/badge.svg)](https://github.com/Sakshi443/Panchjanya/actions/workflows/ci.yml)
[![Deploy to Vercel](https://github.com/Sakshi443/Panchjanya/actions/workflows/deploy-vercel.yml/badge.svg)](https://github.com/Sakshi443/Panchjanya/actions/workflows/deploy-vercel.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/Sakshi443/Panchjanya)](https://github.com/Sakshi443/Panchjanya/issues)
[![GitHub forks](https://img.shields.io/github/forks/Sakshi443/Panchjanya)](https://github.com/Sakshi443/Panchjanya/network)
[![GitHub stars](https://img.shields.io/github/stars/Sakshi443/Panchjanya)](https://github.com/Sakshi443/Panchjanya/stargazers)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage Guide](#-usage-guide)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Visitors
- 🗺️ **Interactive Map View** - Explore temples on a dynamic Leaflet-powered map with custom markers
- 🔍 **Advanced Search & Filters** - Find temples by name, district, taluka, or location
- 📸 **Rich Media Galleries** - Browse high-quality images and architectural details
- 🏛️ **Architecture Explorer** - Navigate interactive floor plans with clickable hotspots
- 📱 **Responsive Design** - Seamless experience across desktop, tablet, and mobile devices

### For Administrators
- 👤 **Secure Admin Panel** - Role-based access control with Firebase Authentication
- ➕ **Temple Management** - Add, edit, and delete temple records
- 🖼️ **Media Upload** - Upload architecture images via Cloudinary integration
- 📍 **Hotspot Editor** - Add interactive points of interest on floor plans
- 📊 **Real-time Sync** - Instant updates across all connected clients

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI Framework** | Tailwind CSS, shadcn/ui |
| **Backend** | Firebase (Firestore, Auth, Storage) |
| **Maps** | Leaflet, OpenStreetMap |
| **Media Storage** | Cloudinary |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Firebase Account** - [Sign up](https://console.firebase.google.com/)
- **Google Maps API Key** - [Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sakshi443/Panchjanya.git
   cd Panchjanya
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   npm list react react-dom firebase
   ```

### Configuration

1. **Set up environment variables**

   Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. **Configure Firebase**

   Update `.env` with your Firebase project credentials:

   ```env
   # Firebase Client Configuration
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   VITE_MEASUREMENT_ID=G-XXXXXXXXXX

   # Firebase Admin SDK (for server-side operations)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

   # Google Maps API
   VITE_GOOGLE_MAPS_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

   # Admin Access
   VITE_ADMIN_EMAIL=admin@example.com

   # Cloudinary (Optional - for image uploads)
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=123456789012345
   VITE_CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Configure Firestore Security Rules**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to **Firestore Database** → **Rules**
   - Copy the rules from `firestore.rules` and paste into the editor
   - Click **Publish**

4. **Set Admin Role**

   Admin roles can be managed through the Firebase Console:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to **Authentication** → **Users**
   - Select a user and set custom claims via the Firebase Admin SDK or use the admin interface in the app

---

## 📘 Usage Guide

### Development Server

Start the local development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:8080
- **Network**: http://[your-ip]:8080

### Production Build

Build the application for production deployment:

```bash
npm run build
```

The optimized build will be created in the `dist/` folder.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Additional Scripts

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint for code quality checks |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |

---

## 🔌 API Reference

### Firebase Firestore Collections

#### Temples Collection

**Collection Path**: `/temples`

| Endpoint | Method | Description | Payload/Response |
|----------|---------|-------------|------------------|
| **List All Temples** | `getDocs()` | Fetch all temple records | Returns array of temple documents |
| **Get Temple by ID** | `getDoc(docRef)` | Fetch specific temple details | Returns single temple document |
| **Create Temple** | `addDoc()` | Add new temple (admin only) | `{ name, city, latitude, longitude, images, ... }` |
| **Update Temple** | `updateDoc()` | Update existing temple (admin only) | `{ hotspots, architectureImage, ... }` |
| **Delete Temple** | `deleteDoc()` | Remove temple record (admin only) | Document ID string |

#### Temple Data Structure

```typescript
interface Temple {
  id: string;
  name: string;
  city: string;
  district: string;
  taluka?: string;
  latitude: number;
  longitude: number;
  images: string[];
  description?: string;
  architectureImage?: string;
  hotspots?: Hotspot[];
  createdAt: Timestamp;
  createdBy: string;
}

interface Hotspot {
  id: string;
  x: number;  // Percentage position (0-100)
  y: number;  // Percentage position (0-100)
  title: string;
  description: string;
  images: string[];
}
```

### Authentication

**Admin Access**: Uses Firebase Custom Claims

```javascript
// Check if user has admin role
const tokenResult = await user.getIdTokenResult();
const isAdmin = tokenResult.claims.admin === true;
```

---

## 📁 Project Structure

```
panchjanya/
├── 📂 src/
│   ├── 📂 components/          # Reusable React components
│   │   ├── 📂 ui/              # shadcn/ui components
│   │   ├── 📂 admin/           # Admin-specific components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminTopbar.tsx
│   │   │   ├── TempleForm.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── MapWithMarkers.tsx  # Leaflet map component
│   │   ├── SearchBar.tsx       # Search & filter UI
│   │   └── TempleDetails.tsx   # Temple info sidebar
│   │
│   ├── 📂 pages/               # Page components
│   │   ├── 📂 admin/           # Admin panel pages
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminAddTemple.tsx
│   │   │   └── TempleArchitectureAdmin.tsx
│   │   ├── Home.tsx            # Main map view
│   │   ├── Signup.tsx          # User registration
│   │   └── TempleArchitecture.tsx  # Public architecture view
│   │
│   ├── 📂 contexts/            # React Context providers
│   │   └── AuthContext.tsx     # Authentication state
│   │
│   ├── 📂 hooks/               # Custom React hooks
│   │   └── use-toast.ts        # Toast notifications
│   │
│   ├── 📂 lib/                 # Utilities
│   │   └── utils.ts            # Helper functions
│   │
│   ├── firebase.ts             # Firebase initialization
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
│
├── 📂 public/                  # Static assets
├── 📄 firestore.rules          # Firestore security rules
├── 📄 vite.config.ts           # Vite configuration
├── 📄 tailwind.config.ts       # Tailwind CSS config
├── 📄 tsconfig.json            # TypeScript config
├── 📄 package.json             # Dependencies & scripts
├── 📄 .env.example             # Environment template
├── 📄 .gitignore               # Git ignore rules
└── 📄 README.md                # This file
```

### Key Directories Explained

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Reusable UI components (maps, search, forms) |
| `src/pages/` | Full-page components for routing |
| `src/contexts/` | Global state management (auth, user data) |
| `public/` | Static assets served directly |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Contribution Workflow

1. **Fork the repository**
   ```bash
   # Click 'Fork' on GitHub
   git clone https://github.com/YOUR_USERNAME/Panchjanya.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, commented code
   - Follow existing code style
   - Test thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Formatting
   - `refactor:` - Code restructuring
   - `test:` - Adding tests

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes clearly

### Development Guidelines

- ✅ Write TypeScript with proper type annotations
- ✅ Use Tailwind CSS for styling (avoid inline styles)
- ✅ Follow React best practices (hooks, functional components)
- ✅ Test on multiple screen sizes
- ✅ Ensure Firebase rules are secure
- ✅ Document complex logic with comments

### Reporting Issues

Found a bug? Have a feature request?

- Open an [issue](https://github.com/Sakshi443/Panchjanya/issues)
- Use clear, descriptive titles
- Include steps to reproduce (for bugs)
- Add screenshots if applicable

---

## 🔒 Security

- **Never commit** `.env` files or Firebase service account keys
- **Always use** environment variables for sensitive data
- **Review** Firestore security rules before deploying
- **Enable** Firebase App Check for production

### Security Rules

Current rules allow:
- ✅ Public read access to temple data
- ✅ Admin-only write access (via custom claims)
- ❌ Unauthenticated writes blocked

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Maps**: Powered by [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
- **UI Components**: Built with [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: From [Lucide](https://lucide.dev/)
- **Backend**: [Firebase](https://firebase.google.com/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 📞 Support & Contact

- **Email**: mmanoorkar9@gmail.com
- **Repository**: https://github.com/Sakshi443/Panchjanya
- **Issues**: https://github.com/Sakshi443/Panchjanya/issues

---

<div align="center">

**Made with ❤️ for preserving and sharing India's sacred heritage**

[⬆ Back to Top](#-panchjanya---temple-wander-guide)

</div>
