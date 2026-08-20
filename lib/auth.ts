export function clearLocalAuth() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('token');
    window.sessionStorage.removeItem('authToken');
  } catch (e) {
    // ignore
  }
}

export async function logoutClient() {
  try {
    const token =
      (typeof window !== 'undefined' && (window.localStorage.getItem('authToken') ?? window.sessionStorage.getItem('authToken') ?? window.localStorage.getItem('token'))) ?? '';

    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    });
  } catch (e) {
    // ignore errors
  } finally {
    clearLocalAuth();
    if (typeof window !== 'undefined') window.location.href = '/auth/signin';
  }
}
