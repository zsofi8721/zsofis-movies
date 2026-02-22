export interface ITheme {
  title: string;
  icon: IconType;
}

export interface INavLink extends ITheme {
  path: string;
}

export interface IMovie {
  id: string;
  poster_path: string;
  original_title: string;
  name: string;
  overview: string;
  backdrop_path: string
}

export interface IWatchlistItem {
  id: string;
  category: "movie" | "tv";
  poster_path: string;
  original_title: string;
  name: string;
}

/** User rating 1-5 for a show, keyed by category and id */
export type RatingValue = 1 | 2 | 3 | 4 | 5;

