import axios from 'axios';


const GQL_URL = import.meta.env.VITE_API_URL; 


export const graphqlRequest = async <T>(query: string, variables: Record<string, unknown> = {}) => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await axios.post(GQL_URL, {
      query,
      variables,
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

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
        window.location.href = '/';
      }
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
};
