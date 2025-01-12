import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiClient, Todo } from "@/lib/api-client";
import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';

export const AISuggestionsPanel = () => {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await apiClient.getTodos();
      setTasks(loadedTasks);
    } catch (error) {
      toast({
        title: "Error loading tasks",
        description: error instanceof Error ? error.message : "Failed to load tasks",
        variant: "destructive",
      });
    }
  };

  const handleSendQuestion = async () => {
    if (!selectedTaskId || !question.trim()) {
      toast({
        title: "Invalid input",
        description: "Please select a task and enter your question",
        variant: "destructive",
      });
      return;
    }

    const selectedTask = tasks.find(task => task.id === selectedTaskId);
    if (!selectedTask) {
      toast({
        title: "Task not found",
        description: "The selected task could not be found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.askAssistant({
        title: selectedTask.title,
        description: selectedTask.description,
        userQuestion: question.trim()
      });

      setAnswer(response.assistantResponse);
      setQuestion("");
    } catch (error) {
      toast({
        title: "Error getting response",
        description: error instanceof Error ? error.message : "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Brain className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={selectedTaskId}
            onValueChange={setSelectedTaskId}
          >
            <SelectTrigger className="w-full bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
              {tasks.map((task) => (
                <SelectItem 
                  key={task.id} 
                  value={task.id}
                  className="dark:text-gray-100 dark:focus:bg-gray-700"
                >
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-1">
            <Textarea
              placeholder="Ask me anything about your tasks..."
              value={question}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  setQuestion(e.target.value);
                }
              }}
              maxLength={100}
              className="min-h-[80px] bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {question.length}/100 characters
            </p>
          </div>

          <Button
            className="w-full dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            onClick={handleSendQuestion}
            disabled={loading || !selectedTaskId}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
                Thinking...
              </div>
            ) : (
              "Ask AI Assistant"
            )}
          </Button>
        </div>

        {answer && (
          <div className="mt-4 rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <ReactMarkdown 
              className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300"
            >
              {answer}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
};