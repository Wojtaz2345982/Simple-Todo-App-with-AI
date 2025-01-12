import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('Missing API base URL environment variable');
}

export interface Todo {
    id: string;
    title: string;
    description: string;
    deadline: string;
    priorityLevel: 1 | 2 | 3;
    done: boolean;
    notes?: Note[];
}

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt: string;
}

export interface CreateTodoInput {
    title: string;
    description: string;
    deadline: string;
    priorityLevel: 1 | 2 | 3;
}

export interface CreateNoteInput {
    title: string;
    content: string;
    createdAt: string;
}

export interface AssistantQuestion {
    title: string;
    description: string;
    userQuestion: string;
}

export interface AssistantResponse {
    assistantResponse: string;
}

const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
        Authorization: `Bearer ${session?.access_token}`
    };
};

export const apiClient = {
    async getTodos(): Promise<Todo[]> {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/todos`, {
            headers
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch todos');
        }
        
        return response.json();
    },

    async createTodo(todo: CreateTodoInput): Promise<Todo> {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(todo)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create todo');
        }
        
        return response.json();
    },

    async getTodoDetails(id: string): Promise<Todo> {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            headers
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch todo details');
        }
        
        return response.json();
    },

    async deleteTodo(id: string): Promise<void> {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
            headers
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
    },

    async toggleTodoStatus(id: string, done: boolean): Promise<void> {
        const headers = await getAuthHeader();
        const endpoint = done ? 'done' : 'notdone';
        const response = await fetch(`${API_BASE_URL}/todos/${id}/${endpoint}`, {
            method: 'PUT',
            headers
        });
        
        if (!response.ok) {
            throw new Error('Failed to toggle todo status');
        }
    },

    async createNote(todoId: string, note: CreateNoteInput): Promise<Note> {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/todos/${todoId}/notes`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(note)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create note');
        }
        
        return response.json();
    },

    async deleteNote(todoId: string, noteId: string): Promise<void> {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/todos/${todoId}/notes/${noteId}`, {
            method: 'DELETE',
            headers
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete note');
        }
    },

    async askAssistant(question: AssistantQuestion): Promise<AssistantResponse> {
        const headers = await getAuthHeader();
        const response = await fetch(`${API_BASE_URL}/assistant/question`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        });
        
        if (!response.ok) {
            throw new Error('Failed to get assistant response');
        }
        
        return response.json();
    }
};
