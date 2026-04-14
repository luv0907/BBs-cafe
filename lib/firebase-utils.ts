import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  setDoc,
  getDocs
} from "firebase/firestore";
import { db } from "./firebase";
import { toast } from "sonner";

// --- Firestore CRUD Utilities ---

/**
 * Adds a document to a collection
 */
export const addDocument = async (collectionName: string, data: any) => {
  try {
    const colRef = collection(db, collectionName);
    return await addDoc(colRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`Firestore Add Error [${collectionName}]:`, error);
    if (error.code === 'permission-denied') {
      toast.error("Permission Denied: Please check your security rules.");
    } else {
      toast.error(`Failed to add item: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Updates a document in a collection
 */
export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`Firestore Update Error [${collectionName}]:`, error);
    toast.error(`Failed to update item: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes a document from a collection
 */
export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    return await deleteDoc(docRef);
  } catch (error: any) {
    console.error(`Firestore Delete Error [${collectionName}]:`, error);
    toast.error(`Failed to delete item: ${error.message}`);
    throw error;
  }
};

/**
 * Real-time listener for a collection
 */
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void,
  sortField: string = "createdAt"
) => {
  try {
    const colRef = collection(db, collectionName);
    // Use a simple query first to ensure we see all items, 
    // especially if some are missing the sortField
    const q = query(colRef, orderBy(sortField, "desc"));
    
    console.log(`Subscribing to ${collectionName} ordered by ${sortField}`);

    return onSnapshot(q, (snapshot) => {
      console.log(`Received ${snapshot.docs.length} docs from ${collectionName}`);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(items);
    }, (error) => {
      console.error(`Firestore Subscribe Error [${collectionName}]:`, error);
      
      const isMissingDB = error.message?.toLowerCase().includes("database") && error.message?.toLowerCase().includes("not found");

      if (isMissingDB) {
        toast.error("Firestore Database Not Found", {
          description: "Please ensure you have clicked 'Create Database' in your Firebase Console for project 'bbs-cafe'.",
          duration: 10000,
        });
      } else if (error.code === 'permission-denied') {
        toast.error(`Access Denied to ${collectionName}. Check admin status.`);
      } else {
        // Fallback to non-ordered query if it's an indexing issue
        console.warn(`Attempting fallback subscription for ${collectionName} without ordering...`);
        return onSnapshot(colRef, (fallbackSnapshot) => {
           const items = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(items);
        });
      }
    });
  } catch (error) {
    console.error(`Firestore Setup Error [${collectionName}]:`, error);
    return () => {}; 
  }
};

/**
 * Fetch all documents from a collection once
 */
export const getCollection = async (collectionName: string) => {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error(`Firestore Fetch Error [${collectionName}]:`, error);
    return [];
  }
};
