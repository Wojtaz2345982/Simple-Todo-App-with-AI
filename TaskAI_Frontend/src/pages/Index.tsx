import { AISuggestionsPanel } from "@/components/AISuggestionsPanel";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskFilters, SortOption, FilterPriority } from "@/components/TaskFilters";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiClient, Todo } from "@/lib/api-client";
import { LogOut, Moon, Plus, Sun } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("none");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>("all");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
    const darkModePreference = localStorage.getItem("darkMode") === "true";
    setDarkMode(darkModePreference);
    if (darkModePreference) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const loadTasks = async () => {
    try {
      const data = await apiClient.getTodos();
      setTasks(data);
    } catch (error) {
      toast({
        title: "Error loading tasks",
        description: error instanceof Error ? error.message : "Failed to load tasks",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    navigate("/auth");
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      await apiClient.toggleTodoStatus(id, !task.done);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      );

      toast({
        title: task.done ? "Task unmarked" : "Task completed",
        description: task.done
          ? "Task has been unmarked as done"
          : "Task has been marked as done",
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleArchiveTask = async (id: string) => {
    try {
      await apiClient.deleteTodo(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Task archived",
        description: "Task has been archived successfully",
      });
    } catch (error) {
      toast({
        title: "Error archiving task",
        description: error instanceof Error ? error.message : "Failed to archive task",
        variant: "destructive",
      });
    }
  };

  const handleTaskClick = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setSelectedTask(task);
      setDetailsOpen(true);
    }
  };

  const handleSaveTask = async (task: {
    title: string;
    description: string;
    priorityLevel: 1 | 2 | 3;
    deadline: string;
  }) => {
    try {
      const newTodo = await apiClient.createTodo({
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priorityLevel: task.priorityLevel
      });

      setTasks((prev) => [newTodo, ...prev]);
      toast({
        title: "Task created",
        description: "Your new task has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error creating task",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", (!darkMode).toString());
    document.documentElement.classList.toggle("dark");
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priorityLevel === priorityFilter);
    }

    // Apply sorting
    if (sortBy !== "none") {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "priority":
            comparison = b.priorityLevel - a.priorityLevel;
            break;
          case "deadline":
            comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [tasks, sortBy, sortDirection, priorityFilter]);

  const activeTasks = useMemo(
    () => filteredAndSortedTasks.filter((task) => !task.done),
    [filteredAndSortedTasks]
  );

  const completedTasks = useMemo(
    () => filteredAndSortedTasks.filter((task) => task.done),
    [filteredAndSortedTasks]
  );

  return (
    <div className="min-h-screen animate-fade-in bg-gray-50/50 p-8 transition-colors dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Tasks</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your tasks efficiently
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <TaskFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortDirection={sortDirection}
          onSortDirectionChange={() =>
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                priorityLevel={task.priorityLevel}
                deadline={task.deadline}
                done={task.done}
                onToggle={handleToggleTask}
                onClick={handleTaskClick}
              />
            ))}

            {completedTasks.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                  Completed
                </h2>
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    priorityLevel={task.priorityLevel}
                    deadline={task.deadline}
                    done={task.done}
                    onToggle={handleToggleTask}
                    onClick={handleTaskClick}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <AISuggestionsPanel />
          </div>
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveTask}
      />

      {selectedTask && (
        <TaskDetailsModal
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          task={selectedTask}
          onToggle={handleToggleTask}
          onArchive={handleArchiveTask}
        />
      )}
    </div>
  );
};

export default Index;
