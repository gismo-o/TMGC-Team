import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface UserProfile {
  skinType: string;
  gender: 'Kadın' | 'Erkek' | 'Belirtmek İstemiyorum' | null;
  isPregnant: boolean;
  conditions: string[];
  allergens: string[];
  isOnboarded: boolean;
}

interface UserContextType {
  profile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>({
    skinType: 'Karma Cilt',
    gender: null,
    isPregnant: false,
    conditions: [],
    allergens: [],
    isOnboarded: false,
  });

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ profile, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
