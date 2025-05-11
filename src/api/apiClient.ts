/**
 * Base API client for NutriPeek
 * Handles common functionality like error handling and request formatting
 */

import { HTTPValidationError } from "./types";

class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.nutripeek.pro";

    // For development with mobile devices, ensure we're not using 'localhost'
    if (
      typeof window !== "undefined" &&
      this.baseUrl.includes("localhost") &&
      window.location.hostname !== "localhost"
    ) {
      // We're accessing the app from a device other than localhost
      // Try to use current origin as base for API calls
      const currentOrigin = window.location.origin;
      this.baseUrl = currentOrigin;
    }
  }

  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint to call
   * @param queryParams - Optional query parameters
   * @returns Promise with the response data
   */
  async get<T>(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, queryParams);
    return this.request<T>(url, {
      method: "GET",
    });
  }

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint to call
   * @param body - Request body
   * @returns Promise with the response data
   */
  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    return this.request<T>(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  /**
   * Upload a file to the API
   * @param endpoint - API endpoint to call
   * @param formData - FormData object containing file and other data
   * @returns Promise with the response data
   */
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "POST",
      body: formData,
    });
  }

  /**
   * Download a file from the API
   * @param endpoint - API endpoint to call
   * @returns Promise with the blob data
   */
  async downloadFile(endpoint: string): Promise<Blob> {
    const url = this.buildUrl(endpoint);
    try {
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `File download failed: ${response.status} ${response.statusText} - ${errorText}`
        );
        throw new ApiError(
          `Failed to download file: ${response.statusText}`,
          response.status
        );
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        0
      );
    }
  }

  /**
   * Create a WebSocket connection for real-time communication
   * @param endpoint - WebSocket endpoint path (without base URL)
   * @param options - WebSocket connection options
   * @returns WebSocket connection or null if it couldn't be established
   */
  createWebSocketConnection(
    endpoint: string,
    options: {
      onOpen?: () => void;
      onMessage?: (data: any) => void;
      onClose?: () => void;
      onError?: (error: Event) => void;
      developmentUrlResolver?: (endpoint: string) => Promise<string>;
    }
  ): WebSocket | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      // Get the appropriate WebSocket URL
      let wsUrl = "";

      // In development, use the provided URL resolver or default behavior
      if (
        process.env.NODE_ENV === "development" &&
        options.developmentUrlResolver
      ) {
        // Get the actual WebSocket URL through the provided resolver
        options
          .developmentUrlResolver(endpoint)
          .then((resolvedUrl) => {
            if (resolvedUrl) {
              try {
                this.setupWebSocketConnection(
                  resolvedUrl,
                  options.onOpen,
                  options.onMessage,
                  options.onClose,
                  options.onError
                );
              } catch (wsError) {
                console.warn("WebSocket connection failed", wsError);
                if (options.onError) options.onError(wsError as Event);
              }
            } else {
              console.error("No WebSocket URL resolved");
              if (options.onError)
                options.onError(
                  new Error("No WebSocket URL resolved") as unknown as Event
                );
            }
          })
          .catch((error) => {
            console.error("Error resolving WebSocket URL:", error);
            if (options.onError) options.onError(error as Event);
          });

        // Return null for now, the actual connection will be created in the Promise
        return null;
      } else {
        // For production, construct the WebSocket URL directly
        const wsProtocol =
          typeof window !== "undefined" && window.location.protocol === "https:"
            ? "wss:"
            : "ws:";
        const baseUrl = this.baseUrl.replace(/^http(s?):\/\//, "");
        wsUrl = `${wsProtocol}//${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

        // Create direct WebSocket connection
        try {
          return this.setupWebSocketConnection(
            wsUrl,
            options.onOpen,
            options.onMessage,
            options.onClose,
            options.onError
          );
        } catch (wsError) {
          console.warn("WebSocket connection failed", wsError);
          if (options.onError) options.onError(wsError as Event);
          return null;
        }
      }
    } catch (error) {
      console.error("Error establishing WebSocket connection:", error);
      if (options.onError) options.onError(error as Event);
      return null;
    }
  }

  /**
   * Set up a WebSocket connection with event handlers
   * @private
   */
  private setupWebSocketConnection(
    wsUrl: string,
    onOpen?: () => void,
    onMessage?: (data: any) => void,
    onClose?: () => void,
    onError?: (error: Event) => void
  ): WebSocket {
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);

    // Setup event handlers
    ws.onopen = () => {
      if (onOpen) onOpen();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
        if (onMessage) onMessage(event.data);
      }
    };

    ws.onclose = () => {
      if (onClose) onClose();
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error:`, error);
      if (onError) onError(error);
    };

    return ws;
  }

  /**
   * Execute a request with error handling
   * @param url - Full URL to call
   * @param options - Fetch options
   * @returns Promise with the response data
   */
  private async request<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }

        // Handle HTTP validation errors with better error messages
        if (
          response.status === 422 &&
          (errorData as HTTPValidationError)?.detail
        ) {
          const validationErrors = (errorData as HTTPValidationError).detail
            .map((err) => `${err.loc.join(".")}: ${err.msg}`)
            .join(", ");
          throw new ApiError(
            `Validation error: ${validationErrors}`,
            response.status,
            errorData
          );
        }

        // Handle other API errors
        const errorMessage =
          typeof errorData === "object" && errorData.detail
            ? errorData.detail
            : `API error: ${response.statusText}`;

        throw new ApiError(errorMessage, response.status, errorData);
      }

      // Check if response is empty
      if (response.status === 204 || (await response.clone().text()) === "") {
        return {} as T;
      }

      // Parse response as JSON
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Handle network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        0
      );
    }
  }

  /**
   * Build a URL with query parameters
   * @param endpoint - API endpoint
   * @param queryParams - Optional query parameters
   * @returns Full URL string
   */
  private buildUrl(
    endpoint: string,
    queryParams?: Record<string, string | number | boolean>
  ): string {
    // Handle case where the endpoint already has the base URL
    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    try {
      const url = new URL(fullUrl);

      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      return url.toString();
    } catch (error) {
      console.error(`Error building URL for ${fullUrl}:`, error);
      throw new Error(`Invalid URL: ${fullUrl}`);
    }
  }

  /**
   * Upload file and download response as blob
   * @param endpoint - API endpoint to call
   * @param formData - FormData to send
   * @returns Promise with blob data
   */
  async uploadAndDownloadBlob(
    endpoint: string,
    formData: FormData
  ): Promise<Blob> {
    const url = this.buildUrl(endpoint);
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Upload and download failed: ${response.status} ${response.statusText} - ${errorText}`
        );
        throw new ApiError(
          `Failed to process file: ${response.statusText}`,
          response.status
        );
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        0
      );
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();
export { ApiError };
