import { useState, useCallback } from 'react';
import type { QueryConstraint, DocumentData, WithFieldValue, UpdateData } from 'firebase/firestore';
import * as firestoreService from '../services/firestoreService';

interface UseFirestoreResult<T> {
  isLoading: boolean;
  error: string | null;
  add: (data: WithFieldValue<DocumentData>) => Promise<string | null>;
  set: (id: string, data: WithFieldValue<DocumentData>) => Promise<void>;
  update: (id: string, data: UpdateData<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => Promise<(T & { id: string }) | null>;
  getAll: (queryConstraints?: QueryConstraint[]) => Promise<(T & { id: string })[]>;
}

export const useFirestore = <T>(collectionName: string): UseFirestoreResult<T> => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unknown error occurred.');
    }
    console.error(`Firestore Error [${collectionName}]:`, err);
  };

  const add = useCallback(
    async (data: WithFieldValue<DocumentData>): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const id = await firestoreService.addDocument(collectionName, data);
        return id;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  const set = useCallback(
    async (id: string, data: WithFieldValue<DocumentData>): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await firestoreService.setDocument(collectionName, id, data);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  const update = useCallback(
    async (id: string, data: UpdateData<T>): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await firestoreService.updateDocument<T>(collectionName, id, data);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await firestoreService.deleteDocument(collectionName, id);
      } catch (err) {
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  const getById = useCallback(
    async (id: string): Promise<(T & { id: string }) | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const doc = await firestoreService.getDocument<T>(collectionName, id);
        return doc;
      } catch (err) {
        handleError(err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  const getAll = useCallback(
    async (queryConstraints?: QueryConstraint[]): Promise<(T & { id: string })[]> => {
      setIsLoading(true);
      setError(null);
      try {
        const docs = await firestoreService.getCollection<T>(collectionName, queryConstraints);
        return docs;
      } catch (err) {
        handleError(err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [collectionName]
  );

  return { isLoading, error, add, set, update, remove, getById, getAll };
};
