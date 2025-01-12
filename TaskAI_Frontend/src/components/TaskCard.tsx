import { cn } from "@/lib/utils";
import { Check, Clock, Star } from "lucide-react";
import { useState } from "react";

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priorityLevel: 1 | 2 | 3;
  deadline?: string;
  done: boolean;
  onToggle: (id: string) => void;
  onClick: (id: string) => void;
}

const priorityColors = {
  1: "border-l-4 border-l-green-500",
  2: "border-l-4 border-l-yellow-500",
  3: "border-l-4 border-l-red-500",
} as const;

const priorityTextColors = {
  1: "text-gray-500 dark:text-gray-400",
  2: "text-yellow-500 dark:text-yellow-400",
  3: "text-red-500 dark:text-red-400",
};

export const TaskCard = ({
  id,
  title,
  description,
  priorityLevel,
  deadline,
  done,
  onToggle,
  onClick,
}: TaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        "group relative w-full rounded-lg border p-4 transition-all duration-300 dark:border-gray-800 text-left",
        priorityColors[priorityLevel],
        done
          ? "bg-gray-50 opacity-75 dark:bg-gray-800/50"
          : "bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700",
        isHovered && "scale-[1.02] shadow-lg"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          className={cn(
            "mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition-all",
            done
              ? "border-gray-400 bg-gray-400 text-white dark:border-gray-500 dark:bg-gray-500"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500",
            "transform transition-transform active:scale-75"
          )}
        >
          {done && <Check className="h-3 w-3 animate-scale-in" />}
        </button>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-medium dark:text-white",
                done && "text-gray-400 line-through dark:text-gray-500"
              )}
            >
              {title}
            </h3>
            {priorityLevel !== 1 && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  priorityTextColors[priorityLevel]
                )}
              >
                <Star className="h-3 w-3" />
                {priorityLevel === 2 ? "Medium" : "High"}
              </span>
            )}
          </div>
          {description && (
            <p
              className={cn(
                "text-sm text-gray-500 dark:text-gray-400",
                done && "text-gray-400 line-through dark:text-gray-600"
              )}
            >
              {description}
            </p>
          )}
          {deadline && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{new Date(deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
      <div
        className={cn(
          "absolute inset-0 rounded-lg border-2 transition-opacity",
          isHovered ? "opacity-100" : "opacity-0",
          done
            ? "border-gray-200 dark:border-gray-700"
            : priorityLevel === 3
            ? "border-red-500/30"
            : priorityLevel === 2
            ? "border-yellow-500/30"
            : "border-gray-200 dark:border-gray-700"
        )}
      />
    </button>
  );
};