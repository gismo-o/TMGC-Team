import React, { createContext, useState, useContext, ReactNode } from 'react';
import { userService } from '../services/userService';

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

const emptyProfile: UserProfile = {
  displayName: undefined,
  skinType: '',
  gender: null,
  isPregnant: false,
  conditions: [],
  allergens: [],
  isOnboarded: false,
};

interface UserContextType {
  profile: UserProfile;
  userId: string | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  loadProfile: (userId: string) => Promise<void>;
  clearProfile: () => void;
  activeIssue: string | null;
  setActiveIssue: (issue: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeIssue, setActiveIssue] = useState<string | null>(null);

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    if (userId) {
      userService.updateProfile(userId, updates).catch(error => {
        console.error('Profil güncellenemedi:', error);
      });
    }
  };

  const loadProfile = async (id: string) => {
    setUserId(id);
    try {
      const data = await userService.getProfile(id);
      setProfile(data);
    } catch (error) {
      console.error('Profil yüklenemedi:', error);
      setProfile(emptyProfile);
    }
  };

  const clearProfile = () => {
    setUserId(null);
    setProfile(emptyProfile);
  };

  return (
    <UserContext.Provider
      value={{ profile, userId, updateUserProfile, loadProfile, clearProfile, activeIssue, setActiveIssue }}
    >
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