// authService.ts

export const authService = {
  login: async (credentials: any) => {
    // Sprint 2: Replace this prototype response with Spring Boot auth API.
    console.log('authService.login called with:', credentials);
    return Promise.resolve({ token: 'mock-jwt-token', user: { id: '1', name: 'Test User' } });
  },
  register: async (data: any) => {
    // Sprint 2: Replace this prototype response with Spring Boot auth API.
    console.log('authService.register called with:', data);
    return Promise.resolve({ token: 'mock-jwt-token', user: { id: '1', name: 'Test User' } });
  },
  logout: async () => {
    // Sprint 2: Invalidate the persisted auth token through the backend API.
    console.log('authService.logout called');
    return Promise.resolve(true);
  }
};
