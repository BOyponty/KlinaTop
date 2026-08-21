import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { User, Equipe, Pointage, Presence, PayrollExportHistory, RhAdminUser } from '../types';
import {
  initialUsers,
  initialEquipes,
  initialPointages,
  initialPresences,
  initialExportHistory,
} from '../mockData';

// Firestore Collection References
export const USERS_COLLECTION = 'users';
export const EQUIPES_COLLECTION = 'equipes';
export const POINTAGES_COLLECTION = 'pointages';
export const PRESENCES_COLLECTION = 'presences';
export const EXPORTS_COLLECTION = 'exports';
export const ADMINS_COLLECTION = 'admins';

export const initialAdmins: RhAdminUser[] = [
  {
    id: 'adm-1',
    nom: 'Direction RH KlinaTop',
    email: 'rh@klinatop.bj',
    role: 'Superviseur RH & Admin',
    statut: 'Actif',
    telephone: '+229 97 00 00 00',
    initiales: 'RH',
    motDePasse: 'admin123',
    permissions: ['all'],
  },
  {
    id: 'adm-2',
    nom: 'Superviseur Terrain',
    email: 'superviseur@klinatop.bj',
    role: 'Chef de zone',
    statut: 'Actif',
    telephone: '+229 96 11 22 33',
    initiales: 'ST',
    motDePasse: 'admin123',
    permissions: ['view_pointages', 'validate_presences'],
  },
];

// Helper to strip undefined values so Firestore setDoc/updateDoc never fails
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// 1. Initial Seeding if database collections are empty
export async function initializeDatabaseIfEmpty() {
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnapshot.empty) {
      console.log('Seeding initial KlinaTop dataset into Cloud Firestore...');
      
      // Seed Equipes
      for (const eq of initialEquipes) {
        await setDoc(doc(db, EQUIPES_COLLECTION, eq.id), sanitizeForFirestore(eq));
      }

      // Seed Users
      for (const u of initialUsers) {
        await setDoc(doc(db, USERS_COLLECTION, u.id), sanitizeForFirestore(u));
      }

      // Seed Pointages
      for (const ptg of initialPointages) {
        await setDoc(doc(db, POINTAGES_COLLECTION, ptg.id), sanitizeForFirestore(ptg));
      }

      // Seed Presences
      for (const prs of initialPresences) {
        await setDoc(doc(db, PRESENCES_COLLECTION, prs.id), sanitizeForFirestore(prs));
      }

      // Seed Exports
      for (const exp of initialExportHistory) {
        await setDoc(doc(db, EXPORTS_COLLECTION, exp.id), sanitizeForFirestore(exp));
      }
    }

    // Always ensure base default admins exist in Firestore
    for (const adm of initialAdmins) {
      await setDoc(doc(db, ADMINS_COLLECTION, adm.id), sanitizeForFirestore(adm), { merge: true });
    }
    console.log('Firebase seeding & admin sync complete!');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}

// 2. Real-time Subscriptions with Firestore Listeners
export function subscribeToUsers(callback: (users: User[]) => void) {
  const q = collection(db, USERS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ ...doc.data() } as User));
    callback(data);
  }, (err) => {
    console.warn('Subscription error for users:', err);
  });
}

export function subscribeToPointages(callback: (pointages: Pointage[]) => void) {
  const q = query(collection(db, POINTAGES_COLLECTION), orderBy('heure', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ ...doc.data() } as Pointage));
    callback(data);
  }, (err) => {
    console.warn('Subscription error for pointages:', err);
  });
}

export function subscribeToPresences(callback: (presences: Presence[]) => void) {
  const q = collection(db, PRESENCES_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ ...doc.data() } as Presence));
    callback(data);
  }, (err) => {
    console.warn('Subscription error for presences:', err);
  });
}

export function subscribeToEquipes(callback: (equipes: Equipe[]) => void) {
  const q = collection(db, EQUIPES_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ ...doc.data() } as Equipe));
    callback(data);
  }, (err) => {
    console.warn('Subscription error for equipes:', err);
  });
}

export function subscribeToAdmins(callback: (admins: RhAdminUser[]) => void) {
  const q = collection(db, ADMINS_COLLECTION);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ ...doc.data() } as RhAdminUser));
    callback(data);
  }, (err) => {
    console.warn('Subscription error for admins:', err);
  });
}

// 3. Add new Pointage to Firestore & update Presences
export async function addPointageToFirestore(pointage: Pointage, presenceUpdate?: Partial<Presence>) {
  try {
    await setDoc(doc(db, POINTAGES_COLLECTION, pointage.id), sanitizeForFirestore(pointage));

    // Update or create Presence record
    const today = new Date().toISOString().split('T')[0];
    const presenceDocId = `prs-${pointage.userId || pointage.employeId || 'emp'}-${today}`;

    if (presenceUpdate) {
      const presenceData: Record<string, any> = {
        id: presenceDocId,
        userId: pointage.userId || pointage.employeId,
        userName: pointage.userName || pointage.employeNom,
        equipeNom: pointage.equipeNom,
        date: today,
        ...presenceUpdate,
      };

      if (pointage.userPhoto || (presenceUpdate as any).userPhoto) {
        presenceData.userPhoto = pointage.userPhoto || (presenceUpdate as any).userPhoto;
      }

      await setDoc(doc(db, PRESENCES_COLLECTION, presenceDocId), sanitizeForFirestore(presenceData), { merge: true });
    }
  } catch (error) {
    console.error('Error saving pointage to Firestore:', error);
    throw error;
  }
}

// 4. Register a new user in Firestore
export async function registerUserInFirestore(user: User) {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), sanitizeForFirestore(user));
  } catch (error) {
    console.error('Error registering user in Firestore:', error);
    throw error;
  }
}

// 5. Update user (e.g. Profile photo) in Firestore
export async function updateUserInFirestore(userId: string, updates: Partial<User>) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, sanitizeForFirestore(updates));
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
}

// 6. Delete a user in Firestore
export async function deleteUserInFirestore(userId: string) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { statut: 'Inactif' });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
}

// 7. Register or update an Admin in Firestore
export async function registerAdminInFirestore(admin: RhAdminUser) {
  try {
    await setDoc(doc(db, ADMINS_COLLECTION, admin.id), sanitizeForFirestore(admin));
  } catch (error) {
    console.error('Error registering admin in Firestore:', error);
    throw error;
  }
}

// 8. Authenticate RH Admin against Firestore & Initial List
export async function checkAdminCredentials(email: string, pass: string): Promise<{ success: boolean; admin?: RhAdminUser; message?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  try {
    // 1. Fetch admins from Firestore
    const adminsSnapshot = await getDocs(collection(db, ADMINS_COLLECTION));
    let matchedAdmin: RhAdminUser | undefined = undefined;

    if (!adminsSnapshot.empty) {
      adminsSnapshot.forEach((d) => {
        const data = d.data() as RhAdminUser;
        if (data.email && data.email.toLowerCase() === cleanEmail) {
          matchedAdmin = data;
        }
      });
    }

    // If not yet in Firestore, check initial default admins list
    if (!matchedAdmin) {
      const defaultMatch = initialAdmins.find((a) => (a.email || '').toLowerCase() === cleanEmail);
      if (defaultMatch) {
        matchedAdmin = defaultMatch;
        try {
          await setDoc(doc(db, ADMINS_COLLECTION, defaultMatch.id), sanitizeForFirestore(defaultMatch), { merge: true });
        } catch (e) {
          // ignore setDoc error
        }
      }
    }

    if (!matchedAdmin) {
      return {
        success: false,
        message: 'Aucun compte administrateur trouvé avec cette adresse email.',
      };
    }

    const expectedPass = (matchedAdmin as RhAdminUser).motDePasse || 'admin123';
    if (cleanPass !== expectedPass) {
      return {
        success: false,
        message: 'Mot de passe administrateur incorrect.',
      };
    }

    return {
      success: true,
      admin: matchedAdmin,
    };
  } catch (error) {
    console.error('Authentication check error:', error);
    // Fallback: check against initial admins
    const defaultMatch = initialAdmins.find((a) => (a.email || '').toLowerCase() === cleanEmail);
    if (!defaultMatch) {
      return {
        success: false,
        message: 'Identifiant introuvable.',
      };
    }
    if (defaultMatch.motDePasse !== cleanPass) {
      return {
        success: false,
        message: 'Mot de passe incorrect.',
      };
    }
    return {
      success: true,
      admin: defaultMatch,
    };
  }
}