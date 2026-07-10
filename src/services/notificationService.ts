import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';
import { UserProfile } from '../context/UserContext';

export type NotificationKind = 'expiry' | 'routine' | 'tip' | 'safety' | 'product';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  timeLabel: string;
  productId?: string;
  priority: 'high' | 'normal' | 'low';
};

const READ_KEY = 'skinshelf.readNotificationIds';

const getRemainingDays = (dateString?: string) => {
  if (!dateString) return null;
  const expiry = new Date(dateString);
  const now = new Date();
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

const routineLabel = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Sabah rutinim için';
  if (hour >= 17 && hour < 23) return 'Akşam rutinim için';
  return 'Rutin hatırlatması';
};

const shellyTips = [
  'Retinol ve peeling gibi güçlü aktifleri aynı gece kullanmamak cildi daha az yorabilir.',
  'Yeni bir ürün eklerken haftada bir kez denemek, olası tepkileri daha kolay ayırt etmeni sağlar.',
  'Gündüz SPF kullanımı, akşam aktiflerinin etkisini destekler ve leke riskini azaltır.',
  'Serumdan sonra nemlendirici uygulamak aktif içeriklerin daha dengeli emilmesine yardımcı olur.',
];

export const buildNotifications = (
  products: Product[],
  profile: UserProfile,
  activeIssue: string | null
): AppNotification[] => {
  const items: AppNotification[] = [];
  const now = new Date();
  const tipIndex = now.getDate() % shellyTips.length;

  products.forEach(product => {
    const days = getRemainingDays(product.expiryDate);
    if (days !== null && days < 0) {
      items.push({
        id: `expired-${product.id}`,
        kind: 'expiry',
        title: 'Son kullanma tarihi geçti',
        body: `${product.brand} ${product.name} rafından kaldırılmalı veya güncellenmeli.`,
        timeLabel: 'Bugün',
        productId: product.id,
        priority: 'high',
      });
    } else if (days !== null && days <= 60) {
      items.push({
        id: `expiring-${product.id}`,
        kind: 'expiry',
        title: 'SKT yaklaşıyor',
        body: `${product.brand} ${product.name} için ${days} gün kaldı. Kullanım sırasını Shelly ile gözden geçir.`,
        timeLabel: days <= 14 ? 'Acil' : 'Bu hafta',
        productId: product.id,
        priority: days <= 14 ? 'high' : 'normal',
      });
    }
  });

  const reminders = profile.reminderPreferences ?? [];
  const wantsRoutineReminder =
    reminders.includes('Sabah rutinim için') ||
    reminders.includes('Akşam rutinim için') ||
    reminders.includes('Ürün kullanım takibi için');

  if (wantsRoutineReminder && products.length > 0) {
    const hour = now.getHours();
    const morningWindow = hour >= 5 && hour < 12 && reminders.includes('Sabah rutinim için');
    const eveningWindow = hour >= 17 && hour < 23 && reminders.includes('Akşam rutinim için');
    const genericWindow = !morningWindow && !eveningWindow && reminders.includes('Ürün kullanım takibi için');

    if (morningWindow || eveningWindow || genericWindow) {
      items.push({
        id: `routine-${now.toDateString()}`,
        kind: 'routine',
        title: routineLabel(),
        body: `Rafında ${products.length} ürün var. Bugünkü adımları Rutinim sekmesinden kontrol edebilirsin.`,
        timeLabel: 'Şimdi',
        priority: 'normal',
      });
    }
  }

  if (activeIssue) {
    items.push({
      id: `safe-${activeIssue}`,
      kind: 'safety',
      title: 'Güvenli mod aktif',
      body: `${activeIssue} nedeniyle rutinin sadeleştirildi. İyileşme hissedince Profil veya Shelly üzerinden normale dönebilirsin.`,
      timeLabel: 'Aktif',
      priority: 'high',
    });
  }

  if (products.length === 0 && profile.isOnboarded) {
    items.push({
      id: 'empty-shelf',
      kind: 'product',
      title: 'Rafın boş',
      body: 'İlk ürününü barkodla veya manuel ekleyerek Shelly\'nin uyum analizini başlat.',
      timeLabel: 'Öneri',
      priority: 'low',
    });
  }

  items.push({
    id: `tip-${tipIndex}`,
    kind: 'tip',
    title: 'Shelly\'den ipucu',
    body: shellyTips[tipIndex],
    timeLabel: 'Günlük',
    priority: 'low',
  });

  const priorityOrder = { high: 0, normal: 1, low: 2 };
  return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};

export const getReadNotificationIds = async (): Promise<Set<string>> => {
  const raw = await AsyncStorage.getItem(READ_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
};

export const markNotificationRead = async (id: string) => {
  const ids = await getReadNotificationIds();
  ids.add(id);
  await AsyncStorage.setItem(READ_KEY, JSON.stringify([...ids]));
};

export const markAllNotificationsRead = async (ids: string[]) => {
  const existing = await getReadNotificationIds();
  ids.forEach(id => existing.add(id));
  await AsyncStorage.setItem(READ_KEY, JSON.stringify([...existing]));
};

export const countUnread = (notifications: AppNotification[], readIds: Set<string>) =>
  notifications.filter(n => !readIds.has(n.id)).length;
