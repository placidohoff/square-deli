// Shared localStorage key for the admin's JWT, set on login (Edit.jsx) and
// read wherever a request needs to prove it's coming from a logged-in admin
// (EditItemCard.jsx, EditItemCardCharlie.jsx). A plain module-level constant
// keeps that key spelled the same way everywhere instead of repeating the
// string in each file.
const TOKEN_KEY = 'adminToken';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Handles a 401 the same way everywhere it can happen (expired/missing
// token): drop the stale token and send the admin back to the login screen,
// rather than showing a generic "failed" alert that doesn't explain why.
export function handleUnauthorized() {
  clearAuthToken();
  alert('Your session has expired. Please log in again.');
  window.location.reload();
}
