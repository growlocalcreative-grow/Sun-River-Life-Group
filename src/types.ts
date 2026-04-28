import { User as FirebaseUser } from 'firebase/auth';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin: boolean;
}

export type TabType = 'home' | 'gathering' | 'study' | 'connect' | 'admin';

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  content: string;
  questions: string[];
}

export interface LoungeMessage {
  id: string;
  text: string;
  authorName: string;
  authorPhotoURL: string;
  authorUid: string;
  createdAt: any; // Firestore Timestamp
}
