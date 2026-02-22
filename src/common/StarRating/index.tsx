import { RatingValue } from "@/types";
import { cn } from "@/utils/helper";

const STAR_VALUES: RatingValue[] = [1, 2, 3, 4, 5];

const StarFilled = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-6 h-6 sm:w-7 sm:h-7", className)}
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarEmpty = ({ className }: { className?: string }) => (
  <svg
    className={cn("w-6 h-6 sm:w-7 sm:h-7", className)}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);

interface StarRatingProps {
  value: RatingValue | undefined;
  onChange: (value: RatingValue) => void;
  className?: string;
}

const StarRating = ({ value, onChange, className }: StarRatingProps) => {
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="group"
      aria-label="Rate 1 to 5 stars"
    >
      {STAR_VALUES.map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => onChange(starValue)}
          className={cn(
            "p-0.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-900 dark:focus:ring-offset-gray-950",
            value && starValue <= value
              ? "text-amber-400 dark:text-amber-500"
              : "text-gray-400 dark:text-gray-500 hover:text-amber-300 dark:hover:text-amber-600"
          )}
          aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
          aria-pressed={value === starValue}
        >
          {value !== undefined && starValue <= value ? (
            <StarFilled />
          ) : (
            <StarEmpty />
          )}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
