import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  collection, deleteDoc, doc, getDocs, getFirestore, serverTimestamp, writeBatch
} from "firebase/firestore";

// Shared Firebase project already used by World-Simulator-OSM.
const firebaseConfig = {
  apiKey: "AIzaSyCq4CVyeUN_VyOjOL24GLdmEJWJS6toYKI",
  authDomain: "db-fg-9608f.firebaseapp.com",
  projectId: "db-fg-9608f",
  storageBucket: "db-fg-9608f.firebasestorage.app",
  messagingSenderId: "635517470184",
  appId: "1:635517470184:web:ddbe490fafca9ac5c7505d",
  measurementId: "G-XZ96NX6KB8"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let authPromise;
export async function ensureNewsAuth() {
  if (auth.currentUser) return auth.currentUser;
  if (!authPromise) {
    authPromise = signInAnonymously(auth)
      .then(result => result.user)
      .catch(error => {
        authPromise = null;
        throw error;
      });
  }
  return authPromise;
}

export async function loadNewsData() {
  await ensureNewsAuth();
  const [branchSnap, articleSnap] = await Promise.all([
    getDocs(collection(db, "news_branches")),
    getDocs(collection(db, "news_articles"))
  ]);
  return {
    branches: branchSnap.docs.map(item => ({ ...item.data(), id: item.id })),
    articles: articleSnap.docs.map(item => ({ ...item.data(), id: item.id }))
  };
}

export async function saveNewsData(data) {
  const user = await ensureNewsAuth();
  const [branchSnap, articleSnap] = await Promise.all([
    getDocs(collection(db, "news_branches")),
    getDocs(collection(db, "news_articles"))
  ]);

  const operations = [];
  const localBranchIds = new Set();
  const localArticleIds = new Set();

  for (const item of (data.branches || [])) {
    const id = String(item.id);
    localBranchIds.add(id);
    const ownerId = item.ownerId || user.uid;
    if (ownerId === user.uid) {
      operations.push({
        type: "set",
        ref: doc(db, "news_branches", id),
        data: { ...item, id, ownerId, updatedAt: serverTimestamp() }
      });
    }
  }

  for (const item of (data.articles || [])) {
    const id = String(item.id);
    localArticleIds.add(id);
    const authorId = item.authorId || item.ownerId || user.uid;
    if (authorId === user.uid) {
      operations.push({
        type: "set",
        ref: doc(db, "news_articles", id),
        data: { ...item, id, authorId, updatedAt: serverTimestamp() }
      });
    }
  }

  // Remove only this user's documents that were removed in the local UI.
  for (const item of branchSnap.docs) {
    if (item.data().ownerId === user.uid && !localBranchIds.has(item.id)) {
      operations.push({ type: "delete", ref: item.ref });
    }
  }
  for (const item of articleSnap.docs) {
    if (item.data().authorId === user.uid && !localArticleIds.has(item.id)) {
      operations.push({ type: "delete", ref: item.ref });
    }
  }

  // Firestore limits each write batch to 500 operations.
  for (let i = 0; i < operations.length; i += 400) {
    const batch = writeBatch(db);
    for (const op of operations.slice(i, i + 400)) {
      if (op.type === "delete") batch.delete(op.ref);
      else batch.set(op.ref, op.data, { merge: true });
    }
    await batch.commit();
  }
  return true;
}
