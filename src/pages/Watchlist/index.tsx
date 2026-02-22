import { Link } from "react-router-dom";
import { IoCloseCircle } from "react-icons/io5";

import { MovieCard } from "@/common";
import { useWatchlist } from "@/context/watchlistContext";
import { smallMaxWidth, mainHeading } from "@/styles";
import { IWatchlistItem } from "@/types";
import { cn } from "@/utils/helper";

const Watchlist = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <section className={cn(smallMaxWidth, "lg:pt-36 sm:pt-[136px] xs:pt-28 pt-24 min-h-[60vh]")}>
      <h2
        className={cn(
          mainHeading,
          "dark:text-secColor text-black mb-6 sm:mb-8"
        )}
      >
        My Watchlist{watchlist.length > 0 ? ` (${watchlist.length})` : ""}
      </h2>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <p className="dark:text-gray-400 text-gray-500 sm:text-lg text-base font-nunito">
            Your watchlist is empty.
          </p>
          <Link
            to="/"
            className="text-[#ff0000] hover:underline font-nunito font-medium sm:text-base text-sm"
          >
            Browse movies and shows
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap xs:gap-4 gap-[14px] justify-center">
          {watchlist.map((item: IWatchlistItem) => (
            <div
              key={`${item.category}-${item.id}`}
              className="relative flex flex-col xs:gap-4 gap-2 xs:max-w-[170px] max-w-[124px] rounded-lg lg:mb-6 md:mb-5 sm:mb-4 mb-[10px]"
            >
              <button
                type="button"
                onClick={() => removeFromWatchlist(item.id)}
                className="absolute -top-2 -right-2 z-10 text-[#ff0000] bg-white dark:bg-[#1f1f1f] rounded-full hover:scale-110 transition-transform duration-200"
                aria-label={`Remove ${item.original_title || item.name} from watchlist`}
              >
                <IoCloseCircle size={24} />
              </button>
              <MovieCard movie={item as any} category={item.category} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Watchlist;
