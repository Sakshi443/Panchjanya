# 🔌 API Documentation - Temple Wander Guide

This document provides detailed information about the data structures, Firebase Firestore collections, and integration points used in the Temple Wander Guide application.

---

## 📋 Table of Contents

- [Firebase Firestore](#firebase-firestore)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Google Maps Integration](#google-maps-integration)
- [Supabase Integration](#supabase-integration)
- [Error Handling](#error-handling)

---

## Firebase Firestore

### Base URL
```
Firebase Project: dharma-disha
Firestore Database: (default)
```

### Collections

#### 1. **Temples Collection** (`/temples`)

The main collection storing all temple information.

##### Schema

```typescript
interface Temple {
  id: string;                    // Auto-generated document ID
  name: string;                  // Temple name (required)
  location: string;              // Full address (required)
  latitude: number;              // GPS latitude (required)
  longitude: number;             // GPS longitude (required)
  district: string;              // District name (required)
  taluka?: string;               // Taluka/Tehsil (optional)
  images?: string[];             // Array of image URLs (optional)
  sections?: Section[];          // Additional information sections (optional)
  createdAt?: Timestamp;         // Creation timestamp
  updatedAt?: Timestamp;         // Last update timestamp
}

interface Section {
  title: string;                 // Section heading
  content: string;               // Section content (supports markdown)
}
```

##### Operations

**1. Get All Temples (Real-time)**

```typescript
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

const unsubscribe = onSnapshot(
  collection(db, "temples"),
  (snapshot) => {
    const temples = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Temple[];
    console.log("Temples:", temples);
  },
  (error) => {
    console.error("Error fetching temples:", error);
  }
);

// Cleanup
return () => unsubscribe();
```

**2. Get Single Temple by ID**

```typescript
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const templeRef = doc(db, "temples", templeId);
const templeSnap = await getDoc(templeRef);

if (templeSnap.exists()) {
  const temple = { id: templeSnap.id, ...templeSnap.data() } as Temple;
  console.log("Temple:", temple);
} else {
  console.log("Temple not found");
}
```

**3. Add New Temple**

```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

const newTemple = {
  name: "Shri Ganesh Temple",
  location: "123 Temple Street, Mumbai",
  latitude: 19.0760,
  longitude: 72.8777,
  district: "Mumbai",
  taluka: "Mumbai City",
  images: ["https://example.com/image1.jpg"],
  sections: [
    {
      title: "History",
      content: "This temple was built in...",
    },
  ],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

const docRef = await addDoc(collection(db, "temples"), newTemple);
console.log("Temple added with ID:", docRef.id);
```

**4. Update Temple**

```typescript
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

const templeRef = doc(db, "temples", templeId);

await updateDoc(templeRef, {
  name: "Updated Temple Name",
  updatedAt: serverTimestamp(),
});

console.log("Temple updated successfully");
```

**5. Delete Temple**

```typescript
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

const templeRef = doc(db, "temples", templeId);
await deleteDoc(templeRef);

console.log("Temple deleted successfully");
```

**6. Query Temples by District**

```typescript
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

const q = query(
  collection(db, "temples"),
  where("district", "==", "Mumbai")
);

const querySnapshot = await getDocs(q);
const temples = querySnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
})) as Temple[];

console.log("Temples in Mumbai:", temples);
```

**7. Search Temples by Name**

```typescript
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

// Note: Firestore doesn't support full-text search natively
// This is a simple prefix search
const searchTerm = "Ganesh";

const q = query(
  collection(db, "temples"),
  where("name", ">=", searchTerm),
  where("name", "<=", searchTerm + "\uf8ff")
);

const querySnapshot = await getDocs(q);
const temples = querySnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
})) as Temple[];

console.log("Search results:", temples);
```

---

## Data Models

### Temple Model

```typescript
export interface Temple {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  district: string;
  taluka?: string;
  images?: string[];
  sections?: Section[];
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Section Model

```typescript
export interface Section {
  title: string;
  content: string;
}
```

### User Model

```typescript
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin: boolean;
  createdAt: Date;
}
```

### Admin Model

```typescript
export interface Admin {
  uid: string;
  email: string;
  role: "admin" | "super_admin";
  permissions: string[];
  createdAt: Date;
}
```

---

## Authentication

### Firebase Authentication

The application uses Firebase Authentication for user and admin login.

#### Admin Login

```typescript
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

const loginAsAdmin = async (email: string, password: string) => {
  try {
    // Verify admin email
    if (email !== adminEmail) {
      throw new Error("Unauthorized: Not an admin account");
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("Admin logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};
```

#### User Signup

```typescript
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";

const signupUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("User created:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};
```

#### Logout

```typescript
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};
```

#### Check Authentication State

```typescript
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

const unsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user);
  } else {
    console.log("User is signed out");
  }
});

// Cleanup
return () => unsubscribe();
```

---

## Google Maps Integration

### Setup

The application uses `@react-google-maps/api` for Google Maps integration.

```typescript
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 19.0760,
  lng: 72.8777,
};
```

### Display Map with Markers

```typescript
<GoogleMap
  mapContainerStyle={mapContainerStyle}
  center={center}
  zoom={10}
>
  {temples.map((temple) => (
    <Marker
      key={temple.id}
      position={{
        lat: temple.latitude,
        lng: temple.longitude,
      }}
      onClick={() => handleMarkerClick(temple.id)}
    />
  ))}
</GoogleMap>
```

### Show Info Window

```typescript
const [selectedTemple, setSelectedTemple] = useState<Temple | null>(null);

<GoogleMap
  mapContainerStyle={mapContainerStyle}
  center={center}
  zoom={10}
>
  {temples.map((temple) => (
    <Marker
      key={temple.id}
      position={{
        lat: temple.latitude,
        lng: temple.longitude,
      }}
      onClick={() => setSelectedTemple(temple)}
    />
  ))}

  {selectedTemple && (
    <InfoWindow
      position={{
        lat: selectedTemple.latitude,
        lng: selectedTemple.longitude,
      }}
      onCloseClick={() => setSelectedTemple(null)}
    >
      <div>
        <h3>{selectedTemple.name}</h3>
        <p>{selectedTemple.location}</p>
      </div>
    </InfoWindow>
  )}
</GoogleMap>
```

### Get Directions

```typescript
const getDirections = (temple: Temple) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${temple.latitude},${temple.longitude}`;
  window.open(url, "_blank");
};
```

---

## Supabase Integration

### Setup

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Using React Query with Supabase

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const useTemples = () => {
  return useQuery({
    queryKey: ["temples"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("temples")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
```

---

## Error Handling

### Firebase Errors

```typescript
import { FirebaseError } from "firebase/app";

try {
  // Firebase operation
} catch (error) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/user-not-found":
        console.error("User not found");
        break;
      case "auth/wrong-password":
        console.error("Incorrect password");
        break;
      case "permission-denied":
        console.error("Permission denied");
        break;
      default:
        console.error("Firebase error:", error.message);
    }
  } else {
    console.error("Unknown error:", error);
  }
}
```

### API Error Responses

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

const handleApiError = (error: ApiError) => {
  console.error(`Error ${error.code}: ${error.message}`);
  
  // Show user-friendly message
  toast.error(error.message);
};
```

---

## Rate Limits

### Firebase Firestore

- **Reads**: 50,000 per day (free tier)
- **Writes**: 20,000 per day (free tier)
- **Deletes**: 20,000 per day (free tier)

### Google Maps API

- **Map Loads**: 28,000 per month (free tier)
- **Geocoding**: 40,000 per month (free tier)

---

## Best Practices

1. **Use Real-time Listeners Sparingly**: Detach listeners when components unmount
2. **Implement Pagination**: For large datasets, use pagination to reduce reads
3. **Cache Data**: Use React Query for client-side caching
4. **Validate Input**: Always validate user input before writing to Firestore
5. **Handle Errors Gracefully**: Provide user-friendly error messages
6. **Use Security Rules**: Implement proper Firestore security rules
7. **Optimize Queries**: Use indexes for frequently queried fields

---

## Support

For API-related questions or issues, please:
- Open an issue on GitHub
- Email: [mmanoorkar9@gmail.com](mailto:mmanoorkar9@gmail.com)

---

**Last Updated**: November 2025
