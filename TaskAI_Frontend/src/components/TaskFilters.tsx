import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

export type SortOption = "title" | "priority" | "deadline" | "none";
export type FilterPriority = 1 | 2 | 3 | "all";

interface TaskFiltersProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  sortDirection: "asc" | "desc";
  onSortDirectionChange: () => void;
  priorityFilter: FilterPriority;
  onPriorityFilterChange: (value: FilterPriority) => void;
}

export const TaskFilters = ({
  sortBy,
  onSortChange,
  sortDirection,
  onSortDirectionChange,
  priorityFilter,
  onPriorityFilterChange,
}: TaskFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-end mb-6">
      <div className="space-y-2">
        <Label className="text-gray-900 dark:text-gray-100">Sort by</Label>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              <SelectItem value="none" className="dark:text-gray-100 dark:focus:bg-gray-700">None</SelectItem>
              <SelectItem value="title" className="dark:text-gray-100 dark:focus:bg-gray-700">Title</SelectItem>
              <SelectItem value="priority" className="dark:text-gray-100 dark:focus:bg-gray-700">Priority</SelectItem>
              <SelectItem value="deadline" className="dark:text-gray-100 dark:focus:bg-gray-700">Deadline</SelectItem>
            </SelectContent>
          </Select>
          {sortBy !== "none" && (
            <Button
              variant="outline"
              size="icon"
              onClick={onSortDirectionChange}
              title={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
              className="dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              {sortDirection === "asc" ? (
                <ArrowUpAZ className="h-4 w-4" />
              ) : (
                <ArrowDownAZ className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-900 dark:text-gray-100">Priority Filter</Label>
        <Select
          value={priorityFilter.toString()}
          onValueChange={(value) =>
            onPriorityFilterChange(value === "all" ? "all" : Number(value) as FilterPriority)
          }
        >
          <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
            <SelectItem value="all" className="dark:text-gray-100 dark:focus:bg-gray-700">All Priorities</SelectItem>
            <SelectItem value="1" className="dark:text-gray-100 dark:focus:bg-gray-700">Low Priority</SelectItem>
            <SelectItem value="2" className="dark:text-gray-100 dark:focus:bg-gray-700">Medium Priority</SelectItem>
            <SelectItem value="3" className="dark:text-gray-100 dark:focus:bg-gray-700">High Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
