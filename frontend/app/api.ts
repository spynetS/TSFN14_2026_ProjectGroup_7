// api.ts

const BASE_URL = import.meta.env.BACKEND_URL || "http://192.168.49.2:31755";

const defaultHeaders = {
  "Content-Type": "application/json",
};

export async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = { ...defaultHeaders, ...(options.headers || {}) };
  headers["Content-Type"] = `application/json`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "API request failed");
  }

  return res.json();
}

// helpers
export const get = (path: string) => apiFetch(path);
export const post = (path: string, body: object) =>
  apiFetch(path, { method: "POST", body: JSON.stringify(body) });
