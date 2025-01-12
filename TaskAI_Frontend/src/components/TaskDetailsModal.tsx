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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiClient, Todo, Note } from "@/lib/api-client";
import { Archive, Check, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

interface TaskDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Todo;
  onToggle: (id: string) => void;
  onArchive?: (id: string) => void;
}

export const TaskDetailsModal = ({
  open,
  onOpenChange,
  task,
  onToggle,
  onArchive,
}: TaskDetailsModalProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const { toast } = useToast();

  const priorityText = {
    1: "Low",
    2: "Medium",
    3: "High",
  }[task.priorityLevel];

  useEffect(() => {
    if (open && task.id) {
      loadTodoDetails();
    }
  }, [open, task.id]);

  const loadTodoDetails = async () => {
    try {
      const todoDetails = await apiClient.getTodoDetails(task.id);
      setNotes(todoDetails.notes || []);
    } catch (error) {
      toast({
        title: "Error loading notes",
        description: error instanceof Error ? error.message : "Failed to load notes",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Note title required",
        description: "Please enter a title for your note",
        variant: "destructive",
      });
      return;
    }

    try {
      const createdNote = await apiClient.createNote(task.id, {
        title: newNote.title.trim(),
        content: newNote.content.trim(),
        createdAt: new Date().toISOString()
      });

      setNotes((prev) => [createdNote, ...prev]);
      setNewNote({ title: "", content: "" });
      toast({
        title: "Note added",
        description: "Your note has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Error adding note",
        description: error instanceof Error ? error.message : "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await apiClient.deleteNote(task.id, noteId);
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error deleting note",
        description: error instanceof Error ? error.message : "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px] dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">Task Details</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            View and manage your task details
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-gray-900 dark:text-gray-100">Title</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">{task.title}</div>
          </div>
          {task.description && (
            <div className="grid gap-2">
              <Label className="text-gray-900 dark:text-gray-100">Description</Label>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description}
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label className="text-gray-900 dark:text-gray-100">Priority</Label>
            <div className="text-sm text-gray-700 dark:text-gray-300">{priorityText}</div>
          </div>
          {task.deadline && (
            <div className="grid gap-2">
              <Label className="text-gray-900 dark:text-gray-100">Deadline</Label>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {new Date(task.deadline).toLocaleString()}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Notes</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                />
                <Button 
                  onClick={handleAddNote}
                  className="dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
              <Textarea
                placeholder="Note content"
                value={newNote.content}
                onChange={(e) =>
                  setNewNote((prev) => ({ ...prev, content: e.target.value }))
                }
                className="bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              />
            </div>

            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{note.title}</h4>
                      {note.content && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {note.content}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant={task.done ? "outline" : "default"}
            onClick={() => onToggle(task.id)}
            className="dark:border-gray-700 dark:text-gray-100"
          >
            <Check className="mr-2 h-4 w-4" />
            {task.done ? "Mark as Not Done" : "Mark as Done"}
          </Button>
          {onArchive && (
            <Button
              variant="outline"
              onClick={() => {
                onArchive(task.id);
                onOpenChange(false);
              }}
              className="dark:border-gray-700 dark:text-gray-100"
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};