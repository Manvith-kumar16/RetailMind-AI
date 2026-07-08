import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import type { QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase/config';

interface UseRealtimeCollectionResult<T> {
  data: (T & { id: string })[];
  isLoading: boolean;
  error: string | null;
}

export const useRealtimeCollection = <T>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
): UseRealtimeCollectionResult<T> => {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, ...queryConstraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as T),
          }));
          setData(docs);
          setIsLoading(false);
        },
        (err) => {
          console.error(`Realtime Collection Error [${collectionName}]:`, err);
          setError(err.message);
          setIsLoading(false);
        }
      );

      // Clean up the listener on unmount or when constraints change
      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setIsLoading(false);
    }
    // Note: Reacting to deeply nested queryConstraints arrays correctly is hard with just dependency arrays.
    // For simplicity, we assume the component using this memoizes the constraints or we accept re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, isLoading, error };
};

interface UseRealtimeDocumentResult<T> {
  data: (T & { id: string }) | null;
  isLoading: boolean;
  error: string | null;
}

export const useRealtimeDocument = <T>(
  collectionName: string,
  id: string | undefined
): UseRealtimeDocumentResult<T> => {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const docRef = doc(db, collectionName, id);

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setData({ id: docSnap.id, ...(docSnap.data() as T) });
          } else {
            setData(null);
          }
          setIsLoading(false);
        },
        (err) => {
          console.error(`Realtime Document Error [${collectionName}/${id}]:`, err);
          setError(err.message);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
      setIsLoading(false);
    }
  }, [collectionName, id]);

  return { data, isLoading, error };
};
