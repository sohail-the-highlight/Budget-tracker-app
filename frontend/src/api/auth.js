import axios from 'axios';
//trial update
const API_URL = '${process.env.REACT_APP_API_BASE_URL}/api/auth';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login/`, {
    username,
    password
  });
  return response.data.token;
};

export const getAuthHeaders = (token) => {
  return {
    headers: {
      'Authorization': `Token ${token}`
    }
  };
};
