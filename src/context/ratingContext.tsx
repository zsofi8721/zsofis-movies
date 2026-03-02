import React, { useCallback, useContext, useState, useEffect } from "react";
import { RatingValue, ReviewValue } from "@/types";

const RATINGS_STORAGE_KEY = "movie-ratings";
const REVIEWS_STORAGE_KEY = "movie-reviews";

export const MAX_REVIEW_LENGTH = 500;

type RatingKey = string;

const getRatingKey = (id: string, category: string): RatingKey =>
  `${category}-${id}`;

const getStoredRatings = (): Record<RatingKey, RatingValue> => {
  try {
    const stored = localStorage.getItem(RATINGS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getStoredReviews = (): Record<RatingKey, ReviewValue> => {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
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
  getReview: (_id: string, _category: string): ReviewValue | undefined =>
    undefined,
  setReview: (_id: string, _category: string, _value: ReviewValue) => {},
  clearReview: (_id: string, _category: string) => {},
});

interface Props {
  children: React.ReactNode;
}

const RatingProvider = ({ children }: Props) => {
  const [ratings, setRatings] = useState<Record<RatingKey, RatingValue>>(
    getStoredRatings
  );
  const [reviews, setReviews] = useState<Record<RatingKey, ReviewValue>>(
    getStoredReviews
  );

  useEffect(() => {
    localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

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
    setReviews((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const getReview = useCallback(
    (id: string, category: string): ReviewValue | undefined => {
      return reviews[getRatingKey(id, category)];
    },
    [reviews]
  );

  const setReview = useCallback(
    (id: string, category: string, value: ReviewValue) => {
      const key = getRatingKey(id, category);
      const trimmed = value.slice(0, MAX_REVIEW_LENGTH);
      setReviews((prev) =>
        prev[key] === trimmed ? prev : { ...prev, [key]: trimmed }
      );
    },
    []
  );

  const clearReview = useCallback((id: string, category: string) => {
    const key = getRatingKey(id, category);
    setReviews((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return (
    <context.Provider
      value={{ getRating, setRating, clearRating, getReview, setReview, clearReview }}
    >
      {children}
    </context.Provider>
  );
};

export default RatingProvider;

export const useRating = () => {
  return useContext(context);
};
