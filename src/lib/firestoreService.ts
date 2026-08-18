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

// Administrateurs par défaut
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
    motDePasse: 'admin123',
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
    motDePasse: 'admin123',
  }
];

// Initialisation et persistance des données
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
    }

    // Toujours s'assurer que les admins ont leur mot de passe dans Firestore
    for (const adm of initialAdmins) {
      await setDoc(doc(db, ADMINS_COLLECTION, adm.id), adm, { merge: true });
    }
    console.log('Firebase seeding & admin sync complete!');
  } catch (error) {
    console.error('Error seeding Firebase database:', error);
  }
}

// 1. Écouteur temps réel des agents
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

// 2. Écouteur temps réel des pointages
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

// 3. Écouteur temps réel des présences
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

// 4. Écouteur temps réel des équipes
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

// 5. Enregistrer un pointage dans Firestore
export async function addPointageToFirestore(pointage: Pointage, presenceUpdate?: Partial<Presence>) {
  try {
    await setDoc(doc(db, POINTAGES_COLLECTION, pointage.id), pointage);

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

// 6. Enregistrer un agent dans Firestore
export async function registerUserInFirestore(user: User) {
  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user);
  } catch (error) {
    console.error('Error registering user in Firestore:', error);
    throw error;
  }
}

// 7. Écouteur temps réel des administrateurs
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

// 8. Enregistrer un administrateur dans Firestore
export async function registerAdminInFirestore(admin: RhAdminUser) {
  try {
    await setDoc(doc(db, ADMINS_COLLECTION, admin.id), admin);
  } catch (error) {
    console.error('Error registering admin in Firestore:', error);
    throw error;
  }
}

// 9. Authentification STRICTE avec vérification du mot de passe
export async function authenticateAdminInFirestore(
  email: string,
  enteredPassword: string
): Promise<{ success: boolean; admin?: RhAdminUser; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = enteredPassword.trim();

    // Recherche dans la collection admins de Firestore
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
      const defaultMatch = initialAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
      if (defaultMatch) {
        matchedAdmin = defaultMatch;
        await setDoc(doc(db, ADMINS_COLLECTION, defaultMatch.id), defaultMatch, { merge: true });
      }
    }

    if (!matchedAdmin) {
      return {
        success: false,
        error: "Aucun compte Administrateur n'est enregistré avec cette adresse email. Veuillez d'abord créer votre compte avec le Code d'Autorisation Directeur."
      };
    }

    // Vérification stricte du mot de passe
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
    return {
      success: false,
      error: "Erreur lors de la vérification des identifiants sur le serveur."
    };
  }
}