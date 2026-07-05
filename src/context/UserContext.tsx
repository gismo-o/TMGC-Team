import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface UserProfile {
  displayName?: string;
  ageRange?: string;
  experienceLevel?: string;
  skinFeel?: string;
  postWashFeel?: string;
  mainGoal?: string;
  productFitIntent?: string;
  sensitivityLevel?: string;
  reactionHistory?: string;
  currentRoutine?: string[];
  recentActives?: string[];
  trackingPreferences?: string[];
  reminderPreferences?: string[];
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
    displayName: 'Gizem',
    ageRange: '18-24',
    experienceLevel: 'Birkaç ürün kullanıyorum',
    skinFeel: 'T bölgem yağlı, yanaklarım daha kuru',
    postWashFeel: 'Bazı bölgeler yağlı, bazı bölgeler kuru',
    mainGoal: 'Ürünlerim bana uygun mu?',
    productFitIntent: 'Evet, ürünlerimi analiz et',
    sensitivityLevel: 'Bazen',
    reactionHistory: 'Emin değilim',
    currentRoutine: ['Temizleyici', 'Nemlendirici', 'Güneş kremi', 'Serum'],
    recentActives: ['Niacinamide', 'C vitamini'],
    trackingPreferences: ['Stres', 'Güneşe maruz kalma'],
    reminderPreferences: ['Akşam rutinim için'],
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
