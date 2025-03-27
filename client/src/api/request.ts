export async function fetchWithToken(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw Error("no_access_token");
  }

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const mergedHeaders = { ...defaultHeaders, ...options.headers };

  return await fetch(url, {
    method: "GET",
    ...options,
    headers: mergedHeaders,
  });
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiError<K = any> {
  status: number;
  errors: K;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T, K = any>(
    url: string,
    method: HttpMethod,
    body?: any,
  ): Promise<T> {
    try {
      const response = await fetchWithToken(`${this.baseUrl}${url}`, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) {
        const data = await response.json();
        return data as T;
      }
      const errorData = await response.json();
      const error: ApiError<K> = {
        status: response.status,
        errors: errorData as K,
      };
      return Promise.reject(error);
    } catch (errors) {
      if ((errors as any)?.message?.includes("JSON.parse:"))
        return undefined as T;
      const apiError: ApiError<K> = {
        status: 500,
        errors: errors as any,
      };
      return Promise.reject(apiError);
    }
  }

  public get<T, K = any>(url: string): Promise<T> {
    return this.request<T, K>(url, "GET");
  }

  public post<T, K = any>(url: string, body: any): Promise<T> {
    return this.request<T, K>(url, "POST", body);
  }

  public put<T, K = any>(url: string, body: any): Promise<T> {
    return this.request<T, K>(url, "PUT", body);
  }

  public patch<T, K = any>(url: string, body: any): Promise<T> {
    return this.request<T, K>(url, "PATCH", body);
  }

  public delete<T, K = any>(url: string): Promise<T> {
    return this.request<T, K>(url, "DELETE");
  }
}

const baseUrl = import.meta.env.VITE_API_URL;
const apiClient = new HttpClient(baseUrl || "");

export default apiClient;
