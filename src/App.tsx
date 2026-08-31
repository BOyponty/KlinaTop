import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, WebTab } from './components/Sidebar';
import { CameraModal } from './components/CameraModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { RhProfileModal } from './components/web/RhProfileModal';

// Web Views
import { DashboardView } from './components/web/DashboardView';
import { EmployeesView } from './components/web/EmployeesView';
import { AttendanceView } from './components/web/AttendanceView';
import { PointagesView } from './components/web/PointagesView';
import { ReportsView } from './components/web/ReportsView';
import { PayrollExportView } from './components/web/PayrollExportView';
import { SettingsView } from './components/web/SettingsView';
import { RhLoginView } from './components/web/RhLoginView';

// Mobile Container
import { MobileAppContainer } from './components/mobile/MobileAppContainer';

// Mock Data & Firestore synchronization
import {
  initialUsers,
  initialEquipes,
  initialPresences,
  initialPointages,
  initialExportHistory,
} from './data/mockData';
import { User, Equipe, Presence, Pointage, PayrollExportHistory, RhAdminUser } from './types';
import {
  initializeDatabaseIfEmpty,
  subscribeToUsers,
  subscribeToPointages,
  subscribeToPresences,
  subscribeToEquipes,
  subscribeToAdmins,
  initialAdmins,
  addPointageToFirestore,
  registerUserInFirestore,
  updateUserInFirestore,
  deleteUserFromFirestore,
  updateAdminInFirestore,
} from './lib/firestoreService';

export default function App() {
  const [currentMode, setCurrentMode] = useState<'web' | 'mobile'>('web');
  
  // RH Administrator multi-user state with localStorage persistence
  const [admins, setAdmins] = useState<RhAdminUser[]>(initialAdmins);
  const [currentAdmin, setCurrentAdmin] = useState<RhAdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('klinatop_logged_rh_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading RH user from localStorage', e);
    }
    return null;
  });

  const [isRhAuthenticated, setIsRhAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('klinatop_logged_rh_user');
      return !!saved;
    } catch {
      return false;
    }
  });

  // Responsive mobile device detection
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsSmallScreen(isMobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize Firestore listeners & initial seeding
  useEffect(() => {
    initializeDatabaseIfEmpty();

    const unsubUsers = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers.length > 0) {
        setUsers(firestoreUsers);
        // keep selected agent in sync if an agent is already legitimately logged in
        setSelectedAgent((curr) => {
          try {
            const savedUser = localStorage.getItem('klinatop_logged_agent_user');
            const savedId = localStorage.getItem('klinatop_logged_agent_id');
            const targetId = (savedUser ? JSON.parse(savedUser)?.id : null) || savedId || (curr ? curr.id : null);
            if (targetId) {
              const savedMatch = firestoreUsers.find((u) => u.id === targetId);
              if (savedMatch) {
                try {
                  localStorage.setItem('klinatop_logged_agent_user', JSON.stringify(savedMatch));
                  localStorage.setItem('klinatop_logged_agent_id', savedMatch.id);
                } catch (e) {}
                return savedMatch;
              }
            }
          } catch (e) {}
          return curr;
        });
      }
    });

    const unsubPointages = subscribeToPointages((firestorePointages) => {
      if (firestorePointages.length > 0) {
        setPointages(firestorePointages);
      }
    });

    const unsubPresences = subscribeToPresences((firestorePresences) => {
      if (firestorePresences.length > 0) {
        setPresences(firestorePresences);
      }
    });

    const unsubEquipes = subscribeToEquipes((firestoreEquipes) => {
      if (firestoreEquipes.length > 0) {
        setEquipes(firestoreEquipes);
      }
    });

    const unsubAdmins = subscribeToAdmins((firestoreAdmins) => {
      if (firestoreAdmins.length > 0) {
        setAdmins(firestoreAdmins);
        // Update currentAdmin if matching
        setCurrentAdmin((curr) => {
          if (!curr) return null;
          const currEmail = (curr.email || '').toLowerCase();
          const match = firestoreAdmins.find(
            (a) => a.id === curr.id || (currEmail && a.email && a.email.toLowerCase() === currEmail)
          );
          return match || curr;
        });
      }
    });

    return () => {
      unsubUsers();
      unsubPointages();
      unsubPresences();
      unsubEquipes();
      unsubAdmins();
    };
  }, []);

  // Web Navigation Tab
  const [activeWebTab, setActiveWebTab] = useState<WebTab>('dashboard');

  // Global Centralized State
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [equipes, setEquipes] = useState<Equipe[]>(initialEquipes);
  const [presences, setPresences] = useState<Presence[]>(initialPresences);
  const [pointages, setPointages] = useState<Pointage[]>(initialPointages);
  const [exportHistory, setExportHistory] = useState<PayrollExportHistory[]>(initialExportHistory);

  // Active Agent for Mobile Session (only set if actually logged in)
  const [selectedAgent, setSelectedAgent] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('klinatop_logged_agent_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.nom) {
          return parsed;
        }
      }
      const savedId = localStorage.getItem('klinatop_logged_agent_id');
      if (savedId) {
        const found = initialUsers.find((u) => u.id === savedId);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Error reading saved agent user from localStorage', e);
    }
    return null;
  });
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string>('07:45');

  // Modals state
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isRhProfileModalOpen, setIsRhProfileModalOpen] = useState(false);
  const [inspectPointage, setInspectPointage] = useState<Pointage | null>(null);
  const [photoCaptured, setPhotoCaptured] = useState<string | null>(null);

  // Update RH Administrator Profile & Photo
  const handleUpdateRhProfile = async (updatedAdmin: RhAdminUser) => {
    setCurrentAdmin(updatedAdmin);
    setAdmins((prev) => prev.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a)));
    try {
      localStorage.setItem('klinatop_logged_rh_user', JSON.stringify(updatedAdmin));
      await updateAdminInFirestore(updatedAdmin.id, updatedAdmin);
    } catch (err) {
      console.error('Error saving updated admin profile to Firestore:', err);
    }
  };

  // Check-In Action handler from Field Agent Mobile App
  const handlePerformCheckIn = async (photoUrl: string, address: string, coords?: { lat: number; lng: number }) => {
    if (!selectedAgent) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('fr-FR');
    const lat = coords?.lat ?? 6.3774;
    const lng = coords?.lng ?? 2.3903;

    const newPointage: Pointage = {
      id: `ptg-${Date.now()}`,
      userId: selectedAgent.id,
      userName: selectedAgent.nom,
      userPoste: selectedAgent.poste,
      equipeNom: selectedAgent.equipeNom,
      type: 'check-in',
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      formattedDate: dateStr,
      latitude: lat,
      longitude: lng,
      adresse: address || 'Avenue Jean Paul II, Cotonou, Bénin',
      siteName: 'Site KlinaTop Main',
      photoUrl,
    };

    // Optimistic UI update
    setPointages((prev) => [newPointage, ...prev]);

    const presenceUpdate: Partial<Presence> = {
      heureCheckin: timeStr,
      adresseCheckin: address,
      photoCheckinUrl: photoUrl,
      latCheckin: lat,
      lngCheckin: lng,
      statut: 'en_poste',
      duree: 'En cours',
    };

    // Update presence sheet locally
    setPresences((prev) => {
      const existingIndex = prev.findIndex((p) => p.userId === selectedAgent.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...presenceUpdate,
        };
        return updated;
      } else {
        const newPresence: Presence = {
          id: `prs-${Date.now()}`,
          userId: selectedAgent.id,
          userName: selectedAgent.nom,
          userPhoto: selectedAgent.photoUrl || '',
          userPoste: selectedAgent.poste,
          equipeNom: selectedAgent.equipeNom,
          date: dateStr,
          heureCheckin: timeStr,
          adresseCheckin: address,
          photoCheckinUrl: photoUrl,
          latCheckin: lat,
          lngCheckin: lng,
          duree: 'En cours',
          dureeMinutes: 0,
          heureCheckout: null,
          statut: 'en_poste',
        };
        return [newPresence, ...prev];
      }
    });

    setIsCheckedIn(true);
    setCheckInTime(timeStr);
    setPhotoCaptured(null);

    // Save to Cloud Firestore
    try {
      await addPointageToFirestore(newPointage, presenceUpdate);
    } catch (err) {
      console.error('Error syncing check-in with Cloud Firestore:', err);
    }
  };

  // Check-Out Action handler from Field Agent Mobile App
  const handlePerformCheckOut = async (photoUrl: string, address?: string, coords?: { lat: number; lng: number }) => {
    if (!selectedAgent) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('fr-FR');
    const lat = coords?.lat ?? 6.3774;
    const lng = coords?.lng ?? 2.3903;

    const newPointage: Pointage = {
      id: `ptg-${Date.now()}`,
      userId: selectedAgent.id,
      userName: selectedAgent.nom,
      userPoste: selectedAgent.poste,
      equipeNom: selectedAgent.equipeNom,
      type: 'check-out',
      timestamp: now.toISOString(),
      formattedTime: timeStr,
      formattedDate: dateStr,
      latitude: lat,
      longitude: lng,
      adresse: address || 'Site KlinaTop, Cotonou, Bénin',
      siteName: 'Site KlinaTop Main',
      photoUrl,
    };

    // Optimistic UI update
    setPointages((prev) => [newPointage, ...prev]);

    const presenceUpdate: Partial<Presence> = {
      heureCheckout: timeStr,
      photoCheckoutUrl: photoUrl,
      adresseCheckout: address,
      duree: '8h 15m',
      statut: 'présent',
    };

    setPresences((prev) => {
      const existingIndex = prev.findIndex((p) => p.userId === selectedAgent.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...presenceUpdate,
        };
        return updated;
      }
      return prev;
    });

    setIsCheckedIn(false);
    setPhotoCaptured(null);

    // Save to Cloud Firestore
    try {
      await addPointageToFirestore(newPointage, presenceUpdate);
    } catch (err) {
      console.error('Error syncing check-out with Cloud Firestore:', err);
    }
  };

  // Employee CRUD handlers
  const handleAddEmployee = async (newEmp: User) => {
    setUsers((prev) => [newEmp, ...prev]);
    try {
      await registerUserInFirestore(newEmp);
    } catch (err) {
      console.error('Error adding user to Firestore:', err);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, statut: (u.statut === 'Actif' ? 'Inactif' : 'Actif') as any };
          registerUserInFirestore(updated).catch(console.error);
          return updated;
        }
        return u;
      })
    );
  };

  const handleSelectAgent = (agent: User | null) => {
    if (!agent) {
      try {
        localStorage.removeItem('klinatop_logged_agent_id');
        localStorage.removeItem('klinatop_logged_agent_user');
      } catch (e) {}
      setSelectedAgent(null);
      return;
    }
    try {
      localStorage.setItem('klinatop_logged_agent_id', agent.id);
      localStorage.setItem('klinatop_logged_agent_user', JSON.stringify(agent));
    } catch (e) {}
    setSelectedAgent(agent);
  };

  const handleUpdateAgentPhoto = async (userId: string, photoUrl: string) => {
    // Update users list
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, photoUrl } : u))
    );
    // Update selected agent if matches
    setSelectedAgent((curr) => {
      if (curr && curr.id === userId) {
        const updated = { ...curr, photoUrl };
        try {
          localStorage.setItem('klinatop_logged_agent_user', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      }
      return curr;
    });
    // Persist to Cloud Firestore
    try {
      await updateUserInFirestore(userId, { photoUrl });
    } catch (err) {
      console.error('Error updating user photo in Firestore:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet employé de la base KlinaTop ? Cette action supprimera définitivement le compte dans Firebase.')) {
      // Immediate local state update
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      
      // If deleted agent is currently logged into the mobile simulation, log them out
      if (selectedAgent && selectedAgent.id === userId) {
        handleSelectAgent(null);
      }

      // Permanent deletion in Firestore (syncs in real-time across all devices)
      try {
        await deleteUserFromFirestore(userId);
      } catch (err) {
        console.error('Erreur lors de la suppression de l\'employé dans Firestore:', err);
        alert('Erreur lors de la suppression dans la base de données. Veuillez réessayer.');
      }
    }
  };

  const handleResetData = () => {
    setUsers(initialUsers);
    setEquipes(initialEquipes);
    setPresences(initialPresences);
    setPointages(initialPointages);
    setExportHistory(initialExportHistory);
    setIsCheckedIn(false);
    alert('Données de démonstration KlinaTop réinitialisées avec succès !');
  };

  const handleLogoutRH = () => {
    try {
      localStorage.removeItem('klinatop_logged_rh_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentAdmin(null);
    setIsRhAuthenticated(false);
  };

  const handleRhLoginSuccess = (admin: RhAdminUser) => {
    try {
      localStorage.setItem('klinatop_logged_rh_user', JSON.stringify(admin));
    } catch (e) {
      console.error(e);
    }
    setCurrentAdmin(admin);
    setIsRhAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 font-poppins flex flex-col">
      {/* Top Header Navbar - Sleek and responsive on all devices */}
      <Navbar
        currentMode={currentMode}
        onModeChange={(mode) => setCurrentMode(mode)}
        onResetData={handleResetData}
        onLogoutRH={handleLogoutRH}
        onOpenRhProfileModal={() => setIsRhProfileModalOpen(true)}
        isRhAuthenticated={isRhAuthenticated}
        currentAdmin={currentAdmin}
      />

      {/* Main Mode Renderer */}
      {currentMode === 'web' ? (
        !isRhAuthenticated ? (
          <RhLoginView
            onLoginSuccess={handleRhLoginSuccess}
            availableAdmins={admins}
            allUsers={users}
            onSwitchToAgentApp={() => setCurrentMode('mobile')}
          />
        ) : (
          <div className="flex flex-1 flex-col md:flex-row">
            {/* Web Dashboard Left Sidebar */}
            <Sidebar
              activeTab={activeWebTab}
              onSelectTab={(tab) => setActiveWebTab(tab)}
              onOpenAddModal={() => setIsAddEmployeeModalOpen(true)}
              totalEmployeesCount={users.length}
              onLogoutRH={handleLogoutRH}
              currentAdmin={currentAdmin}
              onOpenRhProfileModal={() => setIsRhProfileModalOpen(true)}
            />

            {/* Web Main Content Area */}
            <main className="flex-1 overflow-x-hidden pb-12">
              {activeWebTab === 'dashboard' && (
                <DashboardView
                  users={users}
                  presences={presences}
                  pointages={pointages}
                  onNavigate={(tab) => setActiveWebTab(tab)}
                  onInspectPhoto={(ptg) => setInspectPointage(ptg)}
                />
              )}

              {activeWebTab === 'employees' && (
                <EmployeesView
                  users={users}
                  equipes={equipes}
                  onOpenAddModal={() => setIsAddEmployeeModalOpen(true)}
                  onToggleStatus={handleToggleUserStatus}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {activeWebTab === 'attendance' && (
                <AttendanceView
                  presences={presences}
                  users={users}
                  equipes={equipes}
                  onInspectPhoto={(ptg) => setInspectPointage(ptg)}
                />
              )}

              {activeWebTab === 'pointages' && (
                <PointagesView pointages={pointages} onInspectPhoto={(ptg) => setInspectPointage(ptg)} />
              )}

              {activeWebTab === 'reports' && <ReportsView users={users} presences={presences} />}

              {activeWebTab === 'payroll' && (
                <PayrollExportView
                  presences={presences}
                  users={users}
                  exportHistory={exportHistory}
                  onAddExportHistory={(exp) => setExportHistory((prev) => [exp, ...prev])}
                />
              )}

              {activeWebTab === 'settings' && (
                <SettingsView equipes={equipes} onUpdateEquipes={(eqs) => setEquipes(eqs)} />
              )}
            </main>
          </div>
        )
      ) : (
        /* Mobile Mode (Edge-to-Edge on real mobile devices, Mockup on desktop) */
        <main
          className={
            isSmallScreen
              ? 'flex-1 w-full bg-[#F5F7FA]'
              : 'flex-1 p-4 lg:p-8 flex items-center justify-center bg-gray-200/60'
          }
        >
          <MobileAppContainer
            currentAgent={selectedAgent}
            allAgents={users}
            allAdmins={admins}
            presences={presences}
            pointages={pointages}
            onPerformCheckIn={handlePerformCheckIn}
            onPerformCheckOut={handlePerformCheckOut}
            onOpenCameraModal={() => setIsCameraModalOpen(true)}
            photoCaptured={photoCaptured}
            onInspectPhoto={(ptg) => setInspectPointage(ptg)}
            isCheckedIn={isCheckedIn}
            checkInTime={checkInTime}
            onRegisterNewAgent={async (newUser) => {
              setUsers((prev) => [newUser, ...prev]);
              handleSelectAgent(newUser);
              try {
                await registerUserInFirestore(newUser);
              } catch (err) {
                console.error('Error saving registered agent to Firestore:', err);
              }
            }}
            onSelectAgent={handleSelectAgent}
            onUpdateAgentPhoto={handleUpdateAgentPhoto}
            onSwitchToRhPortal={() => setCurrentMode('web')}
            isNativeMobile={isSmallScreen}
          />
        </main>
      )}

      {/* Modals */}
      <RhProfileModal
        isOpen={isRhProfileModalOpen}
        onClose={() => setIsRhProfileModalOpen(false)}
        admin={currentAdmin}
        onSaveProfile={handleUpdateRhProfile}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        equipes={equipes}
        onAddEmployee={handleAddEmployee}
        existingUsers={users}
        existingAdmins={admins}
      />

      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(dataUrl) => {
          setPhotoCaptured(dataUrl);
          setIsCameraModalOpen(false);
        }}
      />

      <PhotoDetailModal
        isOpen={!!inspectPointage}
        onClose={() => setInspectPointage(null)}
        pointage={inspectPointage}
      />
    </div>
  );
}
