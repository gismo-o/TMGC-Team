export const userService = {
  getProfile: async (userId: string) => {
    // TODO: Implement actual API call to Spring Boot backend
    console.log('userService.getProfile called with userId:', userId);
    return Promise.resolve({ id: userId, name: 'Mock User', skinType: 'Karma' });
  },
  updateProfile: async (userId: string, data: any) => {
    // TODO: Implement actual API call to Spring Boot backend
    console.log('userService.updateProfile called with userId:', userId, 'data:', data);
    return Promise.resolve({ id: userId, ...data });
  },
  updateSkinType: async (userId: string, skinType: string) => {
    // TODO: Implement actual API call to Spring Boot backend
    console.log('userService.updateSkinType called with userId:', userId, 'skinType:', skinType);
    return Promise.resolve(true);
  }
};
