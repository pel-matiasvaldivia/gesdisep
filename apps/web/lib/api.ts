/** Base de la API: vacío = mismo origen (proxy /api de Next en producción). */
export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const TOKEN_KEY = "gesdisep_token";
const USER_KEY = "gesdisep_user";

export interface SessionUser {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Sube un archivo (multipart, campo "archivo") con Authorization. */
export async function apiUpload<T>(path: string, archivo: File): Promise<T> {
  const fd = new FormData();
  fd.append("archivo", archivo);
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/api${path}`, { method: "POST", body: fd, headers });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (body && (body.message as string)) || `Error ${res.status} al subir el archivo`;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return body as T;
}

/** Descarga un documento autenticado y dispara el guardado en el navegador. */
export async function apiDownload(path: string, nombre: string): Promise<void> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/api${path}`, { headers });
  if (!res.ok) throw new Error(`No se pudo descargar (HTTP ${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

/** fetch con Authorization y manejo de errores JSON de la API. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}/api${path}`, { ...init, headers });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (body && (body.message as string)) ||
      `Error ${res.status} al llamar a la API`;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return body as T;
}
