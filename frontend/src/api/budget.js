import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api`;

export const updateTransaction = async (token, transactionId, updatedData) => {
  const response = await axios.put(`${API_URL}/transactions/${transactionId}/`, updatedData, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};

export const updateBudget = async (token, budgetId, updatedData) => {
  const response = await axios.put(`${API_URL}/budgets/${budgetId}/`, updatedData, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};

export const getCategories = async (token) => {
  const response = await axios.get(`${API_URL}/categories/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  } else if (data?.results && Array.isArray(data.results)) {
    return data.results;
  } else if (data?.categories && Array.isArray(data.categories)) {
    return data.categories;
  } else {
    console.warn("⚠️ Unexpected category response shape:", data);
    return [];
  }
};

export const createCategory = async (token, categoryData) => {
  const response = await axios.post(`${API_URL}/categories/`, categoryData, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};

export const getTransactions = async (token, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.category) params.append('category', filters.category);

  const response = await axios.get(`${API_URL}/transactions/?${params.toString()}`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};

export const createTransaction = async (token, transactionData) => {
  const response = await axios.post(`${API_URL}/transactions/`, transactionData, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};

export const deleteTransaction = async (token, transactionId) => {
  await axios.delete(`${API_URL}/transactions/${transactionId}/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
};

export const getBudgets = async (token) => {
  const response = await axios.get(`${API_URL}/budgets/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};

export const createBudget = async (token, budgetData) => {
  const response = await axios.post(`${API_URL}/budgets/`, budgetData, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};

export const deleteBudget = async (token, budgetId) => {
  await axios.delete(`${API_URL}/budgets/${budgetId}/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
};

export const getFinancialSummary = async (token) => {
  const response = await axios.get(`${API_URL}/summary/`, {
    headers: {
      'Authorization': `Token ${token}`
    }
  });
  return response.data;
};
