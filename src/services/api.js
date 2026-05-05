import { API_URL } from "../config";

export async function api(path, options = {}, token = "") {
  const endpoint = path.startsWith("/") ? path : `/${path}`;
  const isFormData = options.body instanceof FormData;
  const headers = isFormData ? {} : { "Content-Type": "application/json" };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
      signal: controller.signal
    });
  } catch (error) {
    throw new Error(error.name === "AbortError" ? "Connection timeout. Report saved offline." : "Unable to reach the server. Report saved offline.");
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "An error occurred.");
  }
  return data;
}

export function imageUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_URL.replace(/\/api$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
}
