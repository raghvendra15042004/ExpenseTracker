export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

export function removeStoredToken() {
  localStorage.removeItem('token');
}

export function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
