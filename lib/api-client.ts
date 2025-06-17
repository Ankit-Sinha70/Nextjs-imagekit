import { Ivideo } from "@/models/Video";


export type VideoFormData = Omit<Ivideo, "_id">;

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

// Define proper types for your API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };

    const response = await fetch(`/api${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  }

  async getVideos() {
    return this.fetch("/videos");
  }

  async createVideo(videoData: VideoFormData) {
    return this.fetch("/videos", {
      method: "POST",
      body: videoData,
    });
  }
}

export const apiClient = new ApiClient();

// Then use it in your functions
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`, options);
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      error: !response.ok ? data.error : undefined
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
