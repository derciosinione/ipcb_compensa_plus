export interface ChatMessageRequest {
  thread_id?: string;
  message: string;
  file_ids?: string[];
  user_context?: {
    id: string;
    name: string;
    role: string;
    token?: string;
  };
}

export interface ChatMessageResponse {
  thread_id: string;
  response_type: string;
  content?: string;
  action?: string;
  data?: any;
}

export interface UploadFileResponse {
  file_id: string;
  filename: string;
}

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000/api/chat';

export const IAService = {
  async uploadDocument(file: File): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${AI_API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload document to AI service');
    }
    
    return response.json();
  },

  async sendMessage(data: ChatMessageRequest): Promise<ChatMessageResponse> {
    const response = await fetch(`${AI_API_URL}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message to AI service');
    }
    
    return response.json();
  }
};
