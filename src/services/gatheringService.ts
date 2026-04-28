import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  addDoc, 
  getDocs,
  limit,
  deleteDoc,
  Timestamp,
  writeBatch,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppUser, Lesson, LoungeMessage } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Gathering {
  id: string;
  theme: string;
  date: string;
  active: boolean;
  description?: string;
  session?: string;
  status?: 'active' | 'archived' | 'planned';
  location?: string;
  address?: string;
}

export interface AddressEntry {
  id: string;
  name: string;
  address: string;
}

export interface AppSetting {
  id?: string;
  sessionTitle: string;
}

export const COMMON_LOCATIONS = [
  { name: 'The Gaw House', address: '123 Gaw Way, St. George, UT 84790' },
  { name: 'The Sanders Residence', address: '456 Sanders Ct, St. George, UT 84790' },
  { name: 'The Schmidt Residence', address: '789 Schmidt Ln, St. George, UT 84790' },
];

export interface GatheringItem {
  id: string;
  name: string;
  claimedByUid: string | null;
  claimedByName: string | null;
  claimedByPhotoURL: string | null;
  gatheringId: string;
  category: string;
}

const THEME_BLUEPRINTS: Record<string, string[]> = {
  'Taco Night': ['Corn Tortillas', 'Flour Tortillas', 'Seasoned Beef', 'Shredded Chicken', 'Pico de Gallo', 'Guacamole', 'Shredded Cheese', 'Sour Cream', 'Spanish Rice', 'Black Beans'],
  'Breakfast': ['Eggs', 'Bacon', 'Pancakes', 'Juice', 'Coffee', 'Fresh Fruit', 'Syrup', 'Butter'],
  'Italian Feast': ['Spaghetti', 'Marinara Sauce', 'Garlic Bread', 'Caesar Salad', 'Meatballs', 'Parmesan Cheese', 'Lasagna', 'Tiramisu'],
  'Burger Bash': ['Burger Buns', 'Beef Patties', 'Veggie Patties', 'Cheddar Slices', 'Lettuce & Tomato', 'Onions & Pickles', 'Potato Salad', 'Ketchup & Mustard'],
  'Soup & Support': ['Chicken Noodle', 'Tomato Basil', 'Bread Bowls', 'Green Salad', 'Fresh Fruit', 'Crackers'],
};

export async function getAISuggestedItems(theme: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of 8 specific food items for a church gathering with the theme: "${theme}". 
      Return only a JSON array of strings representing the item names. Keep descriptions very brief (e.g. "Spicy Corn Dip" not "A delicious spicy corn dip with cheese").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    const items = JSON.parse(text || "[]");
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('Gemini AI suggestions failed:', error);
    return [];
  }
}

export async function getAIInvitation(theme: string): Promise<string> {
  if (!theme) return "Enjoying food and fellowship together.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a warm, one-sentence invitation for a church life group gathering with the theme: "${theme}". It should be friendly and welcoming. (e.g., 'A cozy evening of sizzling brats and local fellowship awaits!')`,
      config: {
        temperature: 0.8
      }
    });
    return response.text?.trim() || `Enjoying ${theme} together.`;
  } catch (error) {
    console.error('Gemini AI invitation failed:', error);
    return `Enjoying ${theme} together.`;
  }
}

export function subscribeToActiveGathering(callback: (gathering: Gathering | null) => void) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString().split('T')[0];
  
  const q = query(
    collection(db, 'gatherings'), 
    where('date', '>=', todayIso),
    limit(20)
  );
  
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }
    
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gathering));
    
    // Sort by proximity to right now
    const now = new Date().getTime();
    all.sort((a, b) => {
      const diffA = Math.abs(new Date(a.date).getTime() - now);
      const diffB = Math.abs(new Date(b.date).getTime() - now);
      return diffA - diffB;
    });

    // We definitely want a Wednesday if possible
    const wednesday = all.find(g => new Date(g.date).getDay() === 3);
    const active = wednesday || all[0];
    callback(active);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'gatherings');
  });
}

export function subscribeToUpcomingGatherings(callback: (gatherings: Gathering[]) => void) {
  const today = new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, 'gatherings'),
    where('date', '>=', today),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gathering));
    list.sort((a, b) => a.date.localeCompare(b.date));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'gatherings');
  });
}

export function subscribeToGatheringItems(gatheringId: string, callback: (items: GatheringItem[]) => void) {
  const q = query(collection(db, 'gathering_items'), where('gatheringId', '==', gatheringId));
  
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GatheringItem));
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'gathering_items');
  });
}

export async function claimItem(itemId: string, user: AppUser) {
  try {
    const itemRef = doc(db, 'gathering_items', itemId);
    await updateDoc(itemRef, {
      claimedByUid: user.uid,
      claimedByName: user.displayName,
      claimedByPhotoURL: user.photoURL,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `gathering_items/${itemId}`);
  }
}

export async function unclaimItem(itemId: string) {
  try {
    const itemRef = doc(db, 'gathering_items', itemId);
    await updateDoc(itemRef, {
      claimedByUid: null,
      claimedByName: null,
      claimedByPhotoURL: null,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `gathering_items/${itemId}`);
  }
}

export async function updateActiveGathering(id: string | null, data: Partial<Gathering>) {
  try {
    let targetId = id;
    if (!targetId) {
      const q = query(collection(db, 'gatherings'), where('active', '==', true), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error('No active gathering found to update.');
      targetId = snapshot.docs[0].id;
    }

    // If theme is updated, auto-generate description if not explicitly provided
    if (data.theme && !data.description) {
      data.description = await getAIInvitation(data.theme);
    }

    const gatheringRef = doc(db, 'gatherings', targetId);
    await updateDoc(gatheringRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `gatherings/${id || 'active'}`);
  }
}

export async function deactivateAllGatherings() {
  try {
    const q = query(collection(db, 'gatherings'), where('active', '==', true));
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(d => updateDoc(doc(db, 'gatherings', d.id), { active: false }));
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'gatherings/deactivate');
  }
}

export async function createNewGathering(data: Omit<Gathering, 'id' | 'active'>) {
  try {
    await deactivateAllGatherings();
    
    // Auto-generate description if missing
    if (data.theme && (!data.description || data.description === 'Theme coming soon!')) {
      data.description = await getAIInvitation(data.theme);
    }

    const docRef = await addDoc(collection(db, 'gatherings'), { 
      ...data, 
      active: true 
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'gatherings');
    throw error;
  }
}

export async function syncActiveGatheringFromSchedule() {
  try {
    const now = new Date();
    
    // Rollover logic: current week's Wednesday 9PM
    const day = now.getDay();
    const diffToWed = 3 - day;
    const thisWed = new Date(now);
    thisWed.setDate(now.getDate() + diffToWed);
    thisWed.setHours(21, 0, 0, 0);

    let pivotDate = new Date(now);
    pivotDate.setHours(0, 0, 0, 0);

    if (now > thisWed) {
      // Advance to look for meetings after this Wednesday
      pivotDate.setDate(pivotDate.getDate() + 1);
    }

    const pivotIso = pivotDate.toISOString();

    // 1. Get the closest upcoming meeting from the schedule
    const scheduleQ = query(
      collection(db, 'scheduled_meetings'),
      where('date', '>=', pivotIso),
      limit(10)
    );
    const scheduleSnapshot = await getDocs(scheduleQ);
    
    if (scheduleSnapshot.empty) {
      console.log('Smart Sync: No scheduled meetings found.');
      return;
    }

    const meetings = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    // Sort by date ascending
    meetings.sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Find the closest Wednesday (3) or just the closest overall if none
    const closestMeeting = meetings.find((m: any) => new Date(m.date).getDay() === 3) || meetings[0];

    // 2. Check if we already have an active gathering for this specific date
    const gatheringQ = query(
      collection(db, 'gatherings'),
      where('date', '==', closestMeeting.date),
      limit(1)
    );
    const gatheringSnapshot = await getDocs(gatheringQ);

    let gatheringId: string;

    if (gatheringSnapshot.empty) {
      console.log('Smart Sync: Creating new active gathering from schedule...');
      // Maître D' Logic: Generate AI Invitation
      const aiInvitation = await getAIInvitation(closestMeeting.theme);

      // Create new gathering
      gatheringId = await createNewGathering({
        theme: closestMeeting.theme,
        date: closestMeeting.date,
        description: aiInvitation,
        location: closestMeeting.location || '',
        address: closestMeeting.address || '',
        status: 'active'
      });

      // AI Chef Trigger: Populate Gathering Table
      await initializeGatheringBlueprint(gatheringId, closestMeeting.theme, true);
    } else {
      const existing = gatheringSnapshot.docs[0];
      const existingData = existing.data();
      gatheringId = existing.id;

      // Manual Override Guard: Only update if the theme hasn't been set yet or if it's identical
      // (This implies if someone manually edited it and the theme changed, we don't overwrite)
      if (!existingData.theme || existingData.theme === closestMeeting.theme) {
        console.log('Smart Sync: Active gathering already exists and matches schedule. No overwrite needed.');
      } else {
        console.log('Smart Sync: Manual override detected (theme differs). Skipping auto-sync for this cycle.');
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'gatherings/sync');
  }
}

export async function suggestItem(gatheringId: string, itemName: string, user: AppUser) {
  try {
    const itemRef = collection(db, 'gathering_items');
    await addDoc(itemRef, {
      name: itemName,
      gatheringId,
      claimedByUid: user.uid,
      claimedByName: user.displayName,
      claimedByPhotoURL: user.photoURL,
      category: 'Suggestion',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'gathering_items');
  }
}

export async function deleteUnclaimedItems(gatheringId: string) {
  try {
    const q = query(collection(db, 'gathering_items'), where('gatheringId', '==', gatheringId), where('claimedByUid', '==', null));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(document => deleteDoc(doc(db, 'gathering_items', document.id)));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'gathering_items');
  }
}

export async function initializeGatheringBlueprint(gatheringId: string, theme: string, cleanupFirst: boolean = false) {
  if (cleanupFirst) {
    await deleteUnclaimedItems(gatheringId);
  }

  let items = THEME_BLUEPRINTS[theme];
  
  if (!items) {
    console.log(`GatheringService: Theme "${theme}" not in blueprints. Consulting AI Chef...`);
    items = await getAISuggestedItems(theme);
  }

  if (!items || items.length === 0) return;

  const itemRef = collection(db, 'gathering_items');
  const existingQ = query(itemRef, where('gatheringId', '==', gatheringId));
  const existing = await getDocs(existingQ);

  // If we cleaned up, we only add if it's truly empty OR if we want to merge (let's stick to empty-only or if cleanup was true)
  if (existing.empty || cleanupFirst) {
    // Collect existing names to avoid duplicates if just appending
    const existingNames = existing.docs.map(d => d.data().name);
    
    for (const itemName of items) {
      if (!existingNames.includes(itemName)) {
        await addDoc(itemRef, {
          name: itemName,
          gatheringId,
          claimedByUid: null,
          claimedByName: null,
          claimedByPhotoURL: null,
          category: 'Main',
        });
      }
    }
  }
}

export interface ConnectionEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  userId: string;
}

export function subscribeToConnections(callback: (connections: ConnectionEntry[]) => void) {
  const q = query(collection(db, 'connections'), limit(50));
  
  return onSnapshot(q, (snapshot) => {
    const connections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConnectionEntry));
    // Sort client-side for simplicity if no index yet
    connections.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    callback(connections);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'connections');
  });
}

export async function addConnection(data: Omit<ConnectionEntry, 'id'>) {
  try {
    await addDoc(collection(db, 'connections'), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'connections');
  }
}

export async function sweepGatheringTimes(targetTime: string = "18:00") {
  try {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'gatherings'), where('date', '>=', today));
    const snapshot = await getDocs(q);
    
    const promises = snapshot.docs.map(docSnap => {
      const g = docSnap.data();
      const datePart = g.date.split('T')[0];
      const localDateTime = `${datePart}T${targetTime}`;
      const newIso = new Date(localDateTime).toISOString();
      
      if (g.date !== newIso) {
        return updateDoc(doc(db, 'gatherings', docSnap.id), { date: newIso });
      }
      return null;
    }).filter(p => p !== null);

    await Promise.all(promises);
    return promises.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'gatherings/sweep');
    throw error;
  }
}

export async function deactivateSession(sessionName: string) {
  try {
    const q = query(collection(db, 'gatherings'), where('session', '==', sessionName), where('active', '==', true));
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(d => updateDoc(doc(db, 'gatherings', d.id), { active: false }));
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `gatherings/deactivate-${sessionName}`);
  }
}

export async function deleteAllGatherings() {
  try {
    const snapshot = await getDocs(collection(db, 'gatherings'));
    const promises = snapshot.docs.map(d => deleteDoc(doc(db, 'gatherings', d.id)));
    await Promise.all(promises);
    
    // Also clear gathering items to avoid orphans
    const gatheringItemsSnapshot = await getDocs(collection(db, 'gathering_items'));
    const gatheringItemsPromises = gatheringItemsSnapshot.docs.map(d => deleteDoc(doc(db, 'gathering_items', d.id)));
    await Promise.all(gatheringItemsPromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'gatherings/all');
  }
}

export async function generateSchedule(params: { 
  startDate: string, 
  endDate: string, 
  dayOfWeek: number, 
  time: string, 
  session: string,
  location?: string,
  address?: string
}) {
  try {
    // startDate is YYYY-MM-DD
    const start = new Date(params.startDate + 'T00:00:00'); // Local midnight
    const end = new Date(params.endDate + 'T23:59:59');     // Local end of day
    const [hours, minutes] = params.time.split(':').map(Number);
    
    const promises = [];
    let current = new Date(start);
    
    // Adjust to first instance of dayOfWeek
    while (current.getDay() !== params.dayOfWeek) {
      current.setDate(current.getDate() + 1);
    }
    
    while (current <= end) {
      const gDate = new Date(current);
      gDate.setHours(hours, minutes, 0, 0);
      
      promises.push(addDoc(collection(db, 'gatherings'), {
        date: gDate.toISOString(),
        theme: '',
        description: 'Theme coming soon!',
        active: false,
        status: 'planned',
        session: params.session,
        location: params.location || '',
        address: params.address || ''
      }));
      
      current.setDate(current.getDate() + 7);
    }
    
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'gatherings/schedule');
  }
}

export async function cleanupNonWednesdays() {
  try {
    const snapshot = await getDocs(collection(db, 'gatherings'));
    const toBeDeleted = snapshot.docs.filter(docSnap => {
      const g = docSnap.data();
      const date = new Date(g.date);
      return date.getDay() !== 3; // 3 = Wednesday
    });
    
    const promises = toBeDeleted.map(d => deleteDoc(doc(db, 'gatherings', d.id)));
    await Promise.all(promises);
    return toBeDeleted.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'gatherings/cleanup');
    throw error;
  }
}

export async function deleteSpecificGathering(gatheringId: string) {
  try {
    await deleteDoc(doc(db, 'gatherings', gatheringId));
    const q = query(collection(db, 'gathering_items'), where('gatheringId', '==', gatheringId));
    const itemSnapshot = await getDocs(q);
    const itemPromises = itemSnapshot.docs.map(d => deleteDoc(doc(db, 'gathering_items', d.id)));
    await Promise.all(itemPromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `gatherings/${gatheringId}`);
    throw error;
  }
}

export async function archiveCurrentSeason() {
  try {
    const q = query(collection(db, 'gatherings'), where('active', '==', true));
    const snapshot = await getDocs(q);
    const promises = snapshot.docs.map(docSnap => 
      updateDoc(doc(db, 'gatherings', docSnap.id), { 
        active: false,
        status: 'archived'
      })
    );
    await Promise.all(promises);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'gatherings/archive');
  }
}

export function subscribeToAddresses(callback: (addresses: AddressEntry[]) => void) {
  return onSnapshot(collection(db, 'addresses'), (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AddressEntry));
    list.sort((a, b) => a.name.localeCompare(b.name));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'addresses');
  });
}

export async function addAddress(name: string, address: string) {
  try {
    await addDoc(collection(db, 'addresses'), { name, address });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'addresses');
  }
}

export async function deleteAddress(id: string) {
  try {
    await deleteDoc(doc(db, 'addresses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `addresses/${id}`);
  }
}

export async function seedInitialAddresses() {
  try {
    const snapshot = await getDocs(collection(db, 'addresses'));
    if (snapshot.empty) {
      for (const loc of COMMON_LOCATIONS) {
        await addAddress(loc.name, loc.address);
      }
    }
  } catch (error) {
    console.error('Failed to seed addresses:', error);
  }
}

export function subscribeToSettings(callback: (settings: AppSetting) => void) {
  const settingsDoc = doc(db, 'settings', 'global');
  return onSnapshot(settingsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as AppSetting);
    } else {
      callback({ sessionTitle: 'Spring Session' });
    }
  }, (error) => {
    // If it doesn't exist yet, we might get a permission error if rules are strict, 
    // but usually it just returns empty if it's the first time and we don't have a doc named 'global'.
    console.warn('Settings subscription error or doc missing:', error);
  });
}

export async function getStudyLessonByDate(dateIso: string) {
  try {
    if (!dateIso) return null;
    const datePart = dateIso.split('T')[0];
    const q = query(collection(db, 'study_lessons'), where('date', '==', datePart), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
  } catch (error) {
    console.error('Failed to get study lesson:', error);
    return null;
  }
}

export function subscribeToLessons(callback: (lessons: Lesson[]) => void) {
  const q = query(collection(db, 'study_lessons'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => {
      const data = doc.data();
      let dateIso = data.date;
      
      // If Firestore stored it as a Timestamp, convert to ISO YYYY-MM-DD
      if (data.date && typeof data.date.toDate === 'function') {
        const d = data.date.toDate();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateIso = `${year}-${month}-${day}`;
      }
      
      return { 
        id: doc.id, 
        ...data, 
        date: dateIso 
      } as Lesson;
    });
    
    // Sort by date desc
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'study_lessons');
  });
}

export async function updateAppSettings(data: Partial<AppSetting>) {
  try {
    const settingsDoc = doc(db, 'settings', 'global');
    // We use setDoc with merge: true to ensure 'global' exists
    const { setDoc } = await import('firebase/firestore');
    await setDoc(settingsDoc, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
  }
}

export async function createLesson(lesson: Omit<Lesson, 'id'>) {
  try {
    const { addDoc } = await import('firebase/firestore');
    const docRef = await addDoc(collection(db, 'study_lessons'), lesson);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'study_lessons');
    throw error;
  }
}

export async function deleteLesson(id: string) {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'study_lessons', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `study_lessons/${id}`);
    throw error;
  }
}

export async function bulkSeedLessons(lessons: Omit<Lesson, 'id'>[]) {
  try {
    const batch = writeBatch(db);
    const lessonsCol = collection(db, 'study_lessons');

    for (const data of lessons) {
      // Convert YYYY-MM-DD to Timestamp (defaulting to 6PM)
      const [year, month, day] = data.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day, 18, 0, 0);
      
      const docRef = doc(lessonsCol);
      batch.set(docRef, {
        ...data,
        date: Timestamp.fromDate(dateObj),
        createdAt: Timestamp.now()
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'study_lessons/bulk');
    throw error;
  }
}

export async function addLoungeMessage(text: string, user: AppUser) {
  try {
    const messagesCol = collection(db, 'lounge_messages');
    await addDoc(messagesCol, {
      text,
      authorName: user.displayName || 'Anonymous',
      authorPhotoURL: user.photoURL || '',
      authorUid: user.uid,
      createdAt: Timestamp.now()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'lounge_messages');
  }
}

export function subscribeToLoungeMessages(callback: (messages: LoungeMessage[]) => void) {
  const q = query(
    collection(db, 'lounge_messages'),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as LoungeMessage));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'lounge_messages');
  });
}
