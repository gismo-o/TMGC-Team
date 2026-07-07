import { supabase } from './supabaseClient';
import { UserProfile } from '../context/UserContext';

const fromRow = (row: any): UserProfile => ({
  displayName: row.display_name ?? undefined,
  ageRange: row.age_range ?? undefined,
  experienceLevel: row.experience_level ?? undefined,
  skinFeel: row.skin_feel ?? undefined,
  postWashFeel: row.post_wash_feel ?? undefined,
  mainGoal: row.main_goal ?? undefined,
  productFitIntent: row.product_fit_intent ?? undefined,
  sensitivityLevel: row.sensitivity_level ?? undefined,
  reactionHistory: row.reaction_history ?? undefined,
  currentRoutine: row.current_routine ?? [],
  recentActives: row.recent_actives ?? [],
  trackingPreferences: row.tracking_preferences ?? [],
  reminderPreferences: row.reminder_preferences ?? [],
  skinType: row.skin_type,
  gender: row.gender,
  isPregnant: row.is_pregnant,
  conditions: row.conditions ?? [],
  allergens: row.allergens ?? [],
  isOnboarded: row.is_onboarded,
});

const toRow = (data: Partial<UserProfile>) => {
  const row: Record<string, unknown> = {};
  if (data.displayName !== undefined) row.display_name = data.displayName;
  if (data.ageRange !== undefined) row.age_range = data.ageRange;
  if (data.experienceLevel !== undefined) row.experience_level = data.experienceLevel;
  if (data.skinFeel !== undefined) row.skin_feel = data.skinFeel;
  if (data.postWashFeel !== undefined) row.post_wash_feel = data.postWashFeel;
  if (data.mainGoal !== undefined) row.main_goal = data.mainGoal;
  if (data.productFitIntent !== undefined) row.product_fit_intent = data.productFitIntent;
  if (data.sensitivityLevel !== undefined) row.sensitivity_level = data.sensitivityLevel;
  if (data.reactionHistory !== undefined) row.reaction_history = data.reactionHistory;
  if (data.currentRoutine !== undefined) row.current_routine = data.currentRoutine;
  if (data.recentActives !== undefined) row.recent_actives = data.recentActives;
  if (data.trackingPreferences !== undefined) row.tracking_preferences = data.trackingPreferences;
  if (data.reminderPreferences !== undefined) row.reminder_preferences = data.reminderPreferences;
  if (data.skinType !== undefined) row.skin_type = data.skinType;
  if (data.gender !== undefined) row.gender = data.gender;
  if (data.isPregnant !== undefined) row.is_pregnant = data.isPregnant;
  if (data.conditions !== undefined) row.conditions = data.conditions;
  if (data.allergens !== undefined) row.allergens = data.allergens;
  if (data.isOnboarded !== undefined) row.is_onboarded = data.isOnboarded;
  return row;
};

export const userService = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return fromRow(data);
  },

  updateProfile: async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(toRow(data))
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return fromRow(updated);
  },
};