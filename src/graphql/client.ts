import axios from 'axios';

const GQL_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: GQL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const graphqlRequest = async <T>(query: string, variables: Record<string, unknown> = {}) => {
  console.log('GraphQL Request:', { query, variables });
  try {
    const response = await apiClient.post('', {
      query,
      variables,
    });
    console.log('GraphQL Response:', response.data);

    if (response.data.errors) {
      const error = new Error(response.data.errors[0].message);
      (error as any).graphQLErrors = response.data.errors;
      throw error;
    }

    return response.data.data as T;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        window.location.href = '/';
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};
