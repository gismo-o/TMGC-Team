// authService.ts

export const authService = {
  login: async (credentials: any) => {
    // TODO: Implement actual API call to Spring Boot backend
    console.log('authService.login called with:', credentials);
    return Promise.resolve({ token: 'mock-jwt-token', user: { id: '1', name: 'Test User' } });
  },
  register: async (data: any) => {
    // TODO: Implement actual API call to Spring Boot backend
    console.log('authService.register called with:', data);
    return Promise.resolve({ token: 'mock-jwt-token', user: { id: '1', name: 'Test User' } });
  },
  logout: async () => {
    // TODO: Implement actual API call to Spring Boot backend (e.g. invalidate token)
    console.log('authService.logout called');
    return Promise.resolve(true);
  }
};
