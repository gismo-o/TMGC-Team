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

export interface UserAccount {
  email: string;
  firstName?: string;
  lastName?: string;
}

interface UserContextType {
  profile: UserProfile;
  userId: string | null;
  account: UserAccount | null;
  setAccount: (account: UserAccount | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>, options?: { persist?: boolean }) => Promise<void>;
  loadProfile: (userId: string) => Promise<UserProfile | null>;
  clearProfile: () => void;
  activeIssue: string | null;
  setActiveIssue: (issue: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [userId, setUserId] = useState<string | null>(null);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [activeIssue, setActiveIssue] = useState<string | null>(null);

  const updateUserProfile = async (updates: Partial<UserProfile>, options: { persist?: boolean } = {}) => {
    setProfile(prev => ({ ...prev, ...updates }));
    if (userId && options.persist !== false) {
      try {
        await userService.updateProfile(userId, updates);
      } catch (error) {
        console.error('Profil güncellenemedi:', error);
      }
    }
  };

  const loadProfile = async (id: string) => {
    setUserId(id);
    try {
      const data = await userService.getProfile(id);
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Profil yüklenemedi:', error);
      setProfile(emptyProfile);
      return null;
    }
  };

  const clearProfile = () => {
    setUserId(null);
    setProfile(emptyProfile);
    setAccount(null);
  };

  return (
    <UserContext.Provider
      value={{ profile, userId, account, setAccount, updateUserProfile, loadProfile, clearProfile, activeIssue, setActiveIssue }}
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
