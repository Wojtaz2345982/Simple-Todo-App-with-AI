import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

type PriorityLevel = 1 | 2 | 3;

const priorityToText = {
  1: "Low",
  2: "Medium",
  3: "High"
} as const;

const textToPriority = {
  Low: 1,
  Medium: 2,
  High: 3
} as const;

type PriorityText = keyof typeof textToPriority;

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: {
    title: string;
    description: string;
    priorityLevel: PriorityLevel;
    deadline: string;
  }) => void;
  initialData?: {
    title: string;
    description: string;
    priorityLevel: PriorityLevel;
    deadline: string;
  };
}

export const TaskDialog = ({
  open,
  onOpenChange,
  onSave,
  initialData,
}: TaskDialogProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [priority, setPriority] = useState<PriorityText>(
    initialData?.priorityLevel ? priorityToText[initialData.priorityLevel] : "Low"
  );
  const [deadline, setDeadline] = useState(() => {
    if (!initialData?.deadline) return "";
    try {
      // Convert the ISO string to local datetime-local format
      const date = new Date(initialData.deadline);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    } catch {
      return "";
    }
  });

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    // Convert the local datetime to ISO format
    let formattedDeadline = deadline;
    if (deadline) {
      try {
        const date = new Date(deadline);
        formattedDeadline = date.toISOString();
      } catch {
        formattedDeadline = "";
      }
    }

    onSave({ 
      title: title.trim(), 
      description: description.trim(), 
      priorityLevel: textToPriority[priority], 
      deadline: formattedDeadline 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {initialData ? "Edit Task" : "Add Task"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            {initialData
              ? "Make changes to your task here."
              : "Add a new task to your list."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-gray-900 dark:text-gray-100" htmlFor="title">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-900 dark:text-gray-100" htmlFor="description">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-900 dark:text-gray-100">Priority</Label>
            <Select value={priority} onValueChange={(value: PriorityText) => setPriority(value)}>
              <SelectTrigger className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                <SelectItem value="Low" className="dark:text-gray-100 dark:focus:bg-gray-700">Low</SelectItem>
                <SelectItem value="Medium" className="dark:text-gray-100 dark:focus:bg-gray-700">Medium</SelectItem>
                <SelectItem value="High" className="dark:text-gray-100 dark:focus:bg-gray-700">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-gray-900 dark:text-gray-100" htmlFor="deadline">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};