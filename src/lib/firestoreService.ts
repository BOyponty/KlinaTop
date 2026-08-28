import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
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
const SYSTEM_COLLECTION = 'system';

// Initial default admins if none exist
export const initialAdmins: RhAdminUser[] = [
  {
    id: 'adm-1',
    nom: 'ZINSOU Chantal',
    email: 'chantal.zinsou@klinatop.bj',
    telephone: '+229 97 45 12 00',
    role: 'rh',
    poste: 'Responsable RH Principale',
    initiales: 'CZ',
    motDePasse: 'admin123',
  },
  {
    id: 'adm-2',
    nom: 'KOFFI Fadou Léon',
    email: 'leonkoffifadou2000@gmail.com',
    telephone: '+229 95 00 11 22',
    role: 'superadmin',
    poste: 'Directeur Général & Administrateur',
    initiales: 'KF',
    motDePasse: 'admin123',
  }
];

// Helper to seed initial data once only if database was never initialized
export async function initializeDatabaseIfEmpty() {
  try {
    const initFlagDoc = await getDoc(doc(db, SYSTEM_COLLECTION, 'initialization_state'));
    
    if (!initFlagDoc.exists()) {
      console.log('Seeding initial Firebase data for the first time...');
      
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

      // Mark database as initialized so deleted users are never re-created
      await setDoc(doc(db, SYSTEM_COLLECTION, 'initialization_state'), {
        initialized: true,
        seededAt: new Date().toISOString()
      });
    }

    // Always ensure default admins exist with their passwords in Firestore
    for (const adm of initialAdmins) {
      await setDoc(doc(db, ADMINS_COLLECTION, adm.id), sanitizeForFirestore(adm), { merge: true });
    }
    console.log('Firebase seeding & admin sync complete!');
  } catch (error) {
    console.error('Error seeding Firebase database:', error);
  }
}

// 1. Users real-time listener (reflects additions and deletions immediately for all clients)
export function subscribeToUsers(callback: (users: User[]) => void) {
  const q = query(collection(db, USERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const usersList: User[] = [];
    snapshot.forEach((doc) => {
      usersList.push({ id: doc.id, ...doc.data() } as User);
    });
    callback(usersList);
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

// 5. Add new Pointage to Firestore & update Presences
export async function addPointageToFirestore(pointage: Pointage, presenceUpdate?: Partial<Presence>) {
  try {
    // Save Pointage record
    await setDoc(doc(db, POINTAGES_COLLECTION, pointage.id), sanitizeForFirestore(pointage));

    // Update or create Presence record
    const today = new Date().toISOString().split('T')[0];
    const presenceDocId = `prs-${pointage.userId}-${today}`;

    if (presenceUpdate) {
      const presenceData: Record<string, any> = {
        id: presenceDocId,
        userId: pointage.userId,
        userName: pointage.userName,
        userPoste: pointage.userPoste,
        equipeNom: pointage.equipeNom,
        date: today,
        ...presenceUpdate,
      };

      if (pointage.userPhoto) {
        presenceData.userPhoto = pointage.userPhoto;
      }

      await setDoc(doc(db, PRESENCES_COLLECTION, presenceDocId), sanitizeForFirestore(presenceData), { merge: true });
    }
  } catch (error) {
    console.error('Error saving pointage to Firestore:', error);
    throw error;
  }
}

// 6. Register a new user in Firestore
export async function registerUserInFirestore(user: User) {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), sanitizeForFirestore(user));
  } catch (error) {
    console.error('Error registering user in Firestore:', error);
    throw error;
  }
}

// 6b. Update user details or photo in Firestore
export async function updateUserInFirestore(userId: string, updates: Partial<User>) {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, sanitizeForFirestore(updates));
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
}

// 6c. Delete user permanently from Firestore
export async function deleteUserFromFirestore(userId: string) {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
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
    await setDoc(doc(db, ADMINS_COLLECTION, admin.id), sanitizeForFirestore(admin));
  } catch (error) {
    console.error('Error registering admin in Firestore:', error);
    throw error;
  }
}

// 8b. Update an existing Admin in Firestore (e.g. photoUrl, nom, telephone, email)
export async function updateAdminInFirestore(adminId: string, updates: Partial<RhAdminUser>) {
  try {
    const adminRef = doc(db, ADMINS_COLLECTION, adminId);
    await setDoc(adminRef, sanitizeForFirestore(updates), { merge: true });
  } catch (error) {
    console.error('Error updating admin in Firestore:', error);
    throw error;
  }
}

// 9. Authenticate Admin with email and password strictly
export async function authenticateAdminInFirestore(
  email: string,
  enteredPassword: string
): Promise<{ success: boolean; admin?: RhAdminUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = enteredPassword.trim();

  try {
    const adminsSnap = await getDocs(collection(db, ADMINS_COLLECTION));
    let matchedAdmin: RhAdminUser | null = null;

    if (!adminsSnap.empty) {
      adminsSnap.forEach((d) => {
        const data = d.data() as RhAdminUser;
        if (data.email && data.email.toLowerCase() === cleanEmail) {
          matchedAdmin = { id: d.id, ...data };
        }
      });
    }

    if (!matchedAdmin) {
      const defaultMatch = initialAdmins.find((a) => (a.email || '').toLowerCase() === cleanEmail);
      if (defaultMatch) {
        matchedAdmin = defaultMatch;
        try {
          await setDoc(doc(db, ADMINS_COLLECTION, defaultMatch.id), defaultMatch, { merge: true });
        } catch {}
      }
    }

    if (!matchedAdmin) {
      return {
        success: false,
        error: "Aucun compte Administrateur n'est enregistré avec cette adresse email. Veuillez d'abord créer votre compte via l'onglet « Créer un compte RH » avec le Code d'Autorisation fourni par le Directeur Général."
      };
    }

    const expectedPassword = (matchedAdmin as RhAdminUser).motDePasse || 'admin123';
    if (cleanPass !== expectedPassword) {
      return {
        success: false,
        error: "Mot de passe incorrect. Veuillez vérifier votre mot de passe administrateur."
      };
    }

    return {
      success: true,
      admin: matchedAdmin
    };
  } catch (error) {
    console.error('Authentication check error:', error);
    const defaultMatch = initialAdmins.find((a) => (a.email || '').toLowerCase() === cleanEmail);
    if (!defaultMatch) {
      return {
        success: false,
        error: "Aucun compte Administrateur n'est enregistré avec cette adresse email."
      };
    }
    if (cleanPass !== (defaultMatch.motDePasse || 'admin123')) {
      return {
        success: false,
        error: "Mot de passe incorrect. Veuillez vérifier votre mot de passe administrateur."
      };
    }
    return {
      success: true,
      admin: defaultMatch
    };
  }
}