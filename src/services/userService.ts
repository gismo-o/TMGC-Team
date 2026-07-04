export const userService = {
  getProfile: async (userId: string) => {
    // Sprint 2: Replace this prototype response with Spring Boot profile API.
    console.log('userService.getProfile called with userId:', userId);
    return Promise.resolve({ id: userId, name: 'Demo User', skinType: 'Karma' });
  },
  updateProfile: async (userId: string, data: any) => {
    // Sprint 2: Persist profile changes through Spring Boot profile API.
    console.log('userService.updateProfile called with userId:', userId, 'data:', data);
    return Promise.resolve({ id: userId, ...data });
  },
  updateSkinType: async (userId: string, skinType: string) => {
    // Sprint 2: Persist skin profile changes through Spring Boot profile API.
    console.log('userService.updateSkinType called with userId:', userId, 'skinType:', skinType);
    return Promise.resolve(true);
  }
};
