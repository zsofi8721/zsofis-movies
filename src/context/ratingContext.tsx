import React, { useCallback, useContext, useState, useEffect } from "react";
import { RatingValue } from "@/types";

const STORAGE_KEY = "movie-ratings";

type RatingKey = string;

const getRatingKey = (id: string, category: string): RatingKey =>
  `${category}-${id}`;

const getStoredRatings = (): Record<RatingKey, RatingValue> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const context = React.createContext({
  getRating: (_id: string, _category: string): RatingValue | undefined =>
    undefined,
  setRating: (_id: string, _category: string, _value: RatingValue) => {},
  clearRating: (_id: string, _category: string) => {},
});

interface Props {
  children: React.ReactNode;
}

const RatingProvider = ({ children }: Props) => {
  const [ratings, setRatings] = useState<Record<RatingKey, RatingValue>>(
    getStoredRatings
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  }, [ratings]);

  const getRating = useCallback(
    (id: string, category: string): RatingValue | undefined => {
      return ratings[getRatingKey(id, category)];
    },
    [ratings]
  );

  const setRating = useCallback(
    (id: string, category: string, value: RatingValue) => {
      const key = getRatingKey(id, category);
      setRatings((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    },
    []
  );

  const clearRating = useCallback((id: string, category: string) => {
    const key = getRatingKey(id, category);
    setRatings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <context.Provider value={{ getRating, setRating, clearRating }}>
      {children}
    </context.Provider>
  );
};

export default RatingProvider;

export const useRating = () => {
  return useContext(context);
};
