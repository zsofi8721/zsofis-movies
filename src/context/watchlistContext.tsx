import React, { useCallback, useContext, useState, useEffect } from "react";
import { IWatchlistItem } from "@/types";

const STORAGE_KEY = "watchlist";

const getStoredWatchlist = (): IWatchlistItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const context = React.createContext({
  watchlist: [] as IWatchlistItem[],
  addToWatchlist: (_item: IWatchlistItem) => {},
  removeFromWatchlist: (_id: string) => {},
  isInWatchlist: (_id: string): boolean => false,
});

interface Props {
  children: React.ReactNode;
}

const WatchlistProvider = ({ children }: Props) => {
  const [watchlist, setWatchlist] = useState<IWatchlistItem[]>(getStoredWatchlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = useCallback((item: IWatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((i) => i.id === item.id && i.category === item.category)) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const isInWatchlist = useCallback(
    (id: string): boolean => {
      return watchlist.some((item) => item.id === id);
    },
    [watchlist]
  );

  return (
    <context.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
      }}
    >
      {children}
    </context.Provider>
  );
};

export default WatchlistProvider;

export const useWatchlist = () => {
  return useContext(context);
};
