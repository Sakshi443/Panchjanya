# 🚀 Quick Start Guide - Temple Wander Guide

A rapid-fire guide to get you up and running with the Temple Wander Guide project in minutes!

---

## ⚡ 5-Minute Setup

### 1. Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/temple-wander-guide.git
cd temple-wander-guide-main

# Install dependencies
npm install
```

### 2. Configure Environment (2 minutes)

```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your API keys
# Minimum required: Firebase and Google Maps API keys
```

### 3. Start Development Server (1 minute)

```bash
# Start the dev server
npm run dev

# Open http://localhost:5173 in your browser
```

**🎉 You're ready to go!**

---

## 🔑 Essential Commands

```bash
# Development
npm run dev              # Start dev server with hot-reload
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Check code quality

# Git Workflow
git checkout -b feature/my-feature    # Create new branch
git add .                             # Stage changes
git commit -m "feat: add feature"    # Commit with convention
git push origin feature/my-feature   # Push to remote
```

---

## 📁 Project Structure (Quick Reference)

```
src/
├── components/          # React components
│   ├── ui/             # shadcn-ui components (49 total)
│   └── admin/          # Admin-specific components
├── pages/              # Route pages
│   ├── Home.tsx        # Main landing page
│   └── admin/          # Admin dashboard pages
├── contexts/           # React Context (Auth)
├── hooks/              # Custom hooks
├── lib/                # Utilities
└── App.tsx             # Main app with routing
```

---

## 🎯 Common Tasks

### Add a New Page

1. Create file in `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/my-page" element={<MyPage />} />
   ```

### Add a New Component

1. Create file in `src/components/MyComponent.tsx`
2. Export and use:
   ```tsx
   export const MyComponent = () => {
     return <div>My Component</div>;
   };
   ```

### Fetch Temple Data

```tsx
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "temples"),
    (snapshot) => {
      const temples = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemples(temples);
    }
  );
  return () => unsubscribe();
}, []);
```

### Add a shadcn-ui Component

```bash
# Example: Add a Button component
npx shadcn-ui@latest add button

# Use it
import { Button } from "@/components/ui/button";
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

### Environment Variables Not Loading

```bash
# Ensure variables start with VITE_
VITE_MY_VAR=value  # ✅ Correct
MY_VAR=value       # ❌ Won't work in client

# Restart dev server after changes
```

### Firebase Connection Issues

```bash
# Check .env file has correct Firebase config
# Verify Firebase project is active
# Check browser console for specific errors
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run lint
```

---

## 🎨 Styling Quick Reference

### Tailwind CSS Classes

```tsx
// Layout
<div className="flex flex-col gap-4 p-6">

// Responsive
<div className="text-sm md:text-base lg:text-lg">

// Dark mode
<div className="bg-white dark:bg-gray-900">

// Hover effects
<button className="hover:bg-blue-600 transition-colors">
```

### Using shadcn-ui Components

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";

<Button variant="default" size="lg">Click Me</Button>
<Card className="p-6">Content</Card>
```

---

## 🔐 Authentication Quick Reference

### Check if User is Logged In

```tsx
import { useAuth } from "@/contexts/AuthContext";

const { user, isAdmin } = useAuth();

if (!user) {
  // User not logged in
}

if (isAdmin) {
  // User is admin
}
```

### Protect a Route

```tsx
<Route
  path="/admin"
  element={
    <PrivateRoute adminRequired={true}>
      <AdminDashboard />
    </PrivateRoute>
  }
/>
```

---

## 📊 Firebase Quick Reference

### Read Data

```tsx
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

const querySnapshot = await getDocs(collection(db, "temples"));
const temples = querySnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### Write Data

```tsx
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

await addDoc(collection(db, "temples"), {
  name: "Temple Name",
  location: "Location",
  latitude: 19.0760,
  longitude: 72.8777,
  district: "Mumbai"
});
```

### Update Data

```tsx
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

await updateDoc(doc(db, "temples", templeId), {
  name: "Updated Name"
});
```

### Delete Data

```tsx
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

await deleteDoc(doc(db, "temples", templeId));
```

---

## 🗺️ Google Maps Quick Reference

### Basic Map

```tsx
import { GoogleMap, Marker } from "@react-google-maps/api";

<GoogleMap
  mapContainerStyle={{ width: "100%", height: "400px" }}
  center={{ lat: 19.0760, lng: 72.8777 }}
  zoom={10}
>
  <Marker position={{ lat: 19.0760, lng: 72.8777 }} />
</GoogleMap>
```

### Get Directions

```tsx
const openDirections = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");
};
```

---

## 📚 Resources

- **Full Documentation**: [README.md](README.md)
- **API Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

### External Resources

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn-ui](https://ui.shadcn.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vitejs.dev/)

---

## 💡 Pro Tips

1. **Use TypeScript**: Always define interfaces for your data
2. **Component Size**: Keep components under 200 lines
3. **Reusability**: Extract common logic into custom hooks
4. **Performance**: Use React.memo for expensive components
5. **Accessibility**: Always add aria-labels to interactive elements
6. **Mobile First**: Design for mobile, then scale up
7. **Error Handling**: Always wrap async operations in try-catch
8. **Console Logs**: Remove before committing to production

---

## 🆘 Need Help?

- **Documentation**: Check the full [README.md](README.md)
- **Issues**: [Open an issue](https://github.com/yourusername/temple-wander-guide/issues)
- **Email**: [mmanoorkar9@gmail.com](mailto:mmanoorkar9@gmail.com)

---

**Happy Coding! 🚀**
