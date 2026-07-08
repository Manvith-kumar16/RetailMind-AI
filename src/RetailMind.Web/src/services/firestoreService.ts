import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query
} from 'firebase/firestore';
import type {
  QueryConstraint,
  DocumentData,
  WithFieldValue,
  UpdateData
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Add a new document to a collection (Firestore auto-generates the ID).
 * @param collectionName The name of the collection
 * @param data The data to insert
 * @returns The generated document ID
 */
export const addDocument = async <T extends WithFieldValue<DocumentData>>(
  collectionName: string,
  data: T
): Promise<string> => {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
};

/**
 * Set a document with a specific ID. Useful for Users where UID is the document ID.
 * @param collectionName The name of the collection
 * @param id The specified document ID
 * @param data The data to insert
 */
export const setDocument = async <T extends WithFieldValue<DocumentData>>(
  collectionName: string,
  id: string,
  data: T
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data);
};

/**
 * Update an existing document.
 * @param collectionName The name of the collection
 * @param id The document ID
 * @param data The data fields to update
 */
export const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: UpdateData<T>
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data as any); // Type cast due to Firebase UpdateData complexity
};

/**
 * Delete a document.
 * @param collectionName The name of the collection
 * @param id The document ID
 */
export const deleteDocument = async (
  collectionName: string,
  id: string
): Promise<void> => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

/**
 * Get a single document by its ID.
 * @param collectionName The name of the collection
 * @param id The document ID
 * @returns The document data with its ID appended, or null if not found
 */
export const getDocument = async <T>(
  collectionName: string,
  id: string
): Promise<(T & { id: string }) | null> => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...(docSnap.data() as T) };
  }
  return null;
};

/**
 * Get multiple documents from a collection, optionally filtered by queries.
 * @param collectionName The name of the collection
 * @param queryConstraints Firestore query constraints (where, orderBy, limit, etc.)
 * @returns Array of documents
 */
export const getCollection = async <T>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
): Promise<(T & { id: string })[]> => {
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...queryConstraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as T)
  }));
};
