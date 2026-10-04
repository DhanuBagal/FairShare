/**
 * API Client with automatic 401 Unauthorized interceptor and cookie support.
 */

const API_BASE = '/api';

const getStoredToken = () => {
  return localStorage.getItem('fairshare_token');
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('fairshare_token', token);
  } else {
    localStorage.removeItem('fairshare_token');
  }
};

export const fetchAPI = async (endpoint, options = {}) => {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    let data = null;
    try {
      data = await response.json();
    } catch (parseErr) {
      // Ignore non-JSON responses
    }

    if (response.status === 401) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent('unauthorized'));
      throw new Error(data?.error || 'Unauthorized access. Please log in again.');
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Server error (${response.status}).`;
      throw new Error(errorMsg);
    }

    return data || {};
  } catch (error) {
    throw error;
  }
};

export const api = {
  // Auth
  register: (userData) => fetchAPI('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => fetchAPI('/auth/login', { method: 'POST', body: credentials }),
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
  getMe: () => fetchAPI('/auth/me'),
  searchUsers: (query) => fetchAPI(`/auth/users?query=${encodeURIComponent(query)}`),

  // Personal Expenses
  getPersonalExpenses: () => fetchAPI('/expenses/personal'),
  createPersonalExpense: (expenseData) => fetchAPI('/expenses/personal', { method: 'POST', body: expenseData }),
  updatePersonalExpense: (id, expenseData) => fetchAPI(`/expenses/personal/${id}`, { method: 'PUT', body: expenseData }),
  deletePersonalExpense: (id) => fetchAPI(`/expenses/personal/${id}`, { method: 'DELETE' }),

  // Groups & Group Expenses
  getMyGroups: () => fetchAPI('/groups'),
  createGroup: (groupData) => fetchAPI('/groups', { method: 'POST', body: groupData }),
  getGroupById: (id) => fetchAPI(`/groups/${id}`),
  addGroupMember: (groupId, email) => fetchAPI(`/groups/${groupId}/members`, { method: 'POST', body: { email } }),
  addGroupExpense: (groupId, expenseData) => fetchAPI(`/groups/${groupId}/expenses`, { method: 'POST', body: expenseData }),

  // Settlement
  createSettlement: (groupId, settlementData) => fetchAPI(`/groups/${groupId}/settle`, { method: 'POST', body: settlementData }),
  getGroupSettlements: (groupId) => fetchAPI(`/groups/${groupId}/settle`),

  // Named Purchase Lists (Checklist API)
  getUserLists: () => fetchAPI('/purchases'),
  createList: (listData) => fetchAPI('/purchases', { method: 'POST', body: listData }),
  deleteList: (listId) => fetchAPI(`/purchases/${listId}`, { method: 'DELETE' }),
  addItemToList: (listId, title) => fetchAPI(`/purchases/${listId}/items`, { method: 'POST', body: { title } }),
  toggleItemInList: (listId, itemId) => fetchAPI(`/purchases/${listId}/items/${itemId}/toggle`, { method: 'PATCH' }),
  deleteItemFromList: (listId, itemId) => fetchAPI(`/purchases/${listId}/items/${itemId}`, { method: 'DELETE' }),

  // Demo seed helper
  seedDemoData: () => fetchAPI('/seed', { method: 'POST' })
};
