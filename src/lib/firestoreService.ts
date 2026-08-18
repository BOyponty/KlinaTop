import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Equipe, Pointage, Presence, PayrollExportHistory, RhAdminUser } from '../types';
import { initialUsers, initialEquipes, initialPointages, initialPresences, initialExportHistory } from '../data/mockData';

const USERS_COLLECTION = 'users';
const EQUIPES_COLLECTION = 'equipes';
const POINTAGES_COLLECTION = 'pointages';
const PRESENCES_COLLECTION = 'presences';
const EXPORTS_COLLECTION = 'exports';
const ADMINS_COLLECTION = 'admins';

// Initial default admins if none exist
export const initialAdmins: RhAdminUser[] = [
  {
    id: 'adm-1',
    nom: 'ZINSOU Chantal',
    email: 'chantal.zinsou@klinatop.bj',
    telephone: '+229 97 45 12 00',
    role: 'rh',
    poste: 'Responsable RH Principale',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    initiales: 'CZ',
  },
  {
    id: 'adm-2',
    nom: 'KOFFI Fadou Léon',
    email: 'leonkoffifadou2000@gmail.com',
    telephone: '+229 95 00 11 22',
    role: 'superadmin',
    poste: 'Directeur Général & Administrateur',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    initiales: 'KF',
  }
];

// Helper to seed initial data if collections are empty
export async function initializeDatabaseIfEmpty() {
  try {
    const usersSnap = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnap.empty) {
      console.log('Seeding initial Firebase data...');
      
      // Seed Equipes
      for (const eq of initialEquipes) {
        await setDoc(doc(db, EQUIPES_COLLECTION, eq.id), eq);
      }

      // Seed Users
      for (const u of initialUsers) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), u);
      }

      // Seed Pointages
      for (const ptg of initialPointages) {
        await setDoc(doc(db, POINTAGES_COLLECTION, ptg.id), ptg);
      }

      // Seed Presences
      for (const prs of initialPresences) {
        await setDoc(doc(db, PRESENCES_COLLECTION, prs.id), prs);
      }

      // Seed Exports
      for (const exp of initialExportHistory) {
        await setDoc(doc(db, EXPORTS_COLLECTION, exp.id), exp);
      }
      console.log('Firebase seeding complete!');
    }
  } catch (error) {
    console.error('Error seeding Firebase database:', error);
  }
}

// 1. Users real-time listener
export function subscribeToUsers(callback: (users: User[]) => void) {
  const q = query(collection(db, USERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() } as User);
      });
      callback(usersList);
    }
  }, (err) => {
    console.error('Firestore Users listener error:', err);
  });
}

// 2. Pointages real-time listener
export function subscribeToPointages(callback: (pointages: Pointage[]) => void) {
  const q = query(collection(db, POINTAGES_COLLECTION), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const ptgList: Pointage[] = [];
    snapshot.forEach((doc) => {
      ptgList.push({ id: doc.id, ...doc.data() } as Pointage);
    });
    callback(ptgList);
  }, (err) => {
    console.error('Firestore Pointages listener error:', err);
  });
}

// 3. Presences real-time listener
export function subscribeToPresences(callback: (presences: Presence[]) => void) {
  const q = query(collection(db, PRESENCES_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const prsList: Presence[] = [];
    snapshot.forEach((doc) => {
      prsList.push({ id: doc.id, ...doc.data() } as Presence);
    });
    callback(prsList);
  }, (err) => {
    console.error('Firestore Presences listener error:', err);
  });
}

// 4. Equipes real-time listener
export function subscribeToEquipes(callback: (equipes: Equipe[]) => void) {
  const q = query(collection(db, EQUIPES_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const eqList: Equipe[] = [];
    snapshot.forEach((doc) => {
      eqList.push({ id: doc.id, ...doc.data() } as Equipe);
    });
    callback(eqList);
  }, (err) => {
    console.error('Firestore Equipes listener error:', err);
  });
}

// 5. Add new Pointage to Firestore & update Presences
export async function addPointageToFirestore(pointage: Pointage, presenceUpdate?: Partial<Presence>) {
  try {
    // Save Pointage record
    await setDoc(doc(db, POINTAGES_COLLECTION, pointage.id), pointage);

    // Update or create Presence record
    const today = new Date().toISOString().split('T')[0];
    const presenceDocId = `prs-${pointage.userId}-${today}`;

    if (presenceUpdate) {
      await setDoc(doc(db, PRESENCES_COLLECTION, presenceDocId), {
        id: presenceDocId,
        userId: pointage.userId,
        userName: pointage.userName,
        userPoste: pointage.userPoste,
        userPhoto: pointage.userPhoto,
        equipeNom: pointage.equipeNom,
        date: today,
        ...presenceUpdate,
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error saving pointage to Firestore:', error);
    throw error;
  }
}

// 6. Register a new user in Firestore
export async function registerUserInFirestore(user: User) {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user);
  } catch (error) {
    console.error('Error registering user in Firestore:', error);
    throw error;
  }
}

// 7. Admins real-time listener
export function subscribeToAdmins(callback: (admins: RhAdminUser[]) => void) {
  const q = query(collection(db, ADMINS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const adminList: RhAdminUser[] = [];
      snapshot.forEach((doc) => {
        adminList.push({ id: doc.id, ...doc.data() } as RhAdminUser);
      });
      callback(adminList);
    } else {
      callback(initialAdmins);
    }
  }, (err) => {
    console.error('Firestore Admins listener error:', err);
    callback(initialAdmins);
  });
}

// 8. Register or update an Admin in Firestore
export async function registerAdminInFirestore(admin: RhAdminUser) {
  try {
    await setDoc(doc(db, ADMINS_COLLECTION, admin.id), admin);
  } catch (error) {
    console.error('Error registering admin in Firestore:', error);
    throw error;
  }
}