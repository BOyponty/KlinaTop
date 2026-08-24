import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, WebTab } from './components/Sidebar';
import { CameraModal } from './components/CameraModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';

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
      if (isMobile) {
        setCurrentMode('mobile');
      }
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
        // keep selected agent in sync if found
        setSelectedAgent((curr) => {
          try {
            const savedId = localStorage.getItem('klinatop_logged_agent_id');
            if (savedId) {
              const savedMatch = firestoreUsers.find((u) => u.id === savedId);
              if (savedMatch) return savedMatch;
            }
          } catch {}
          const match = curr ? firestoreUsers.find((u) => u.id === curr.id) : null;
          return match || firestoreUsers[0] || curr;
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

  // Active Agent for Mobile Simulation with persistent fallback
  const [selectedAgent, setSelectedAgent] = useState<User>(() => {
    try {
      const savedId = localStorage.getItem('klinatop_logged_agent_id');
      if (savedId) {
        const found = initialUsers.find((u) => u.id === savedId);
        if (found) return found;
      }
    } catch {}
    return initialUsers[0];
  });
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [checkInTime, setCheckInTime] = useState<string>('07:45');

  // Modals state
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [inspectPointage, setInspectPointage] = useState<Pointage | null>(null);
  const [photoCaptured, setPhotoCaptured] = useState<string | null>(null);

  // Check-In Action handler from Field Agent Mobile App
  const handlePerformCheckIn = async (photoUrl: string, address: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('fr-FR');

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
      latitude: 6.3532,
      longitude: 2.4211,
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
  const handlePerformCheckOut = async (photoUrl: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('fr-FR');

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
      latitude: 6.3532,
      longitude: 2.4211,
      adresse: 'Site KlinaTop, Cotonou',
      siteName: 'Site KlinaTop Main',
      photoUrl,
    };

    // Optimistic UI update
    setPointages((prev) => [newPointage, ...prev]);

    const presenceUpdate: Partial<Presence> = {
      heureCheckout: timeStr,
      photoCheckoutUrl: photoUrl,
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

  const handleUpdateAgentPhoto = async (userId: string, photoUrl: string) => {
    // Update users list
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, photoUrl } : u))
    );
    // Update selected agent if matches
    setSelectedAgent((curr) => (curr.id === userId ? { ...curr, photoUrl } : curr));
    // Persist to Cloud Firestore
    try {
      await updateUserInFirestore(userId, { photoUrl });
    } catch (err) {
      console.error('Error updating user photo in Firestore:', err);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet employé de la base KlinaTop ?')) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
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
      {/* Top Header Navbar - Only visible on desktop/tablets for preview and role-switching */}
      {!isSmallScreen && (
        <Navbar
          currentMode={currentMode}
          onModeChange={(mode) => setCurrentMode(mode)}
          currentUser={selectedAgent}
          allAgents={users}
          onSelectAgent={(ag) => setSelectedAgent(ag)}
          onResetData={handleResetData}
          onLogoutRH={handleLogoutRH}
          isRhAuthenticated={isRhAuthenticated}
          currentAdmin={currentAdmin}
        />
      )}

      {/* Main Mode Renderer */}
      {currentMode === 'web' && !isSmallScreen ? (
        !isRhAuthenticated ? (
          <RhLoginView
            onLoginSuccess={handleRhLoginSuccess}
            availableAdmins={admins}
          />
        ) : (
          <div className="flex flex-1">
            {/* Web Dashboard Left Sidebar */}
            <Sidebar
              activeTab={activeWebTab}
              onSelectTab={(tab) => setActiveWebTab(tab)}
              onOpenAddModal={() => setIsAddEmployeeModalOpen(true)}
              totalEmployeesCount={users.length}
              onLogoutRH={handleLogoutRH}
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
              setSelectedAgent(newUser);
              try {
                await registerUserInFirestore(newUser);
              } catch (err) {
                console.error('Error saving registered agent to Firestore:', err);
              }
            }}
            onSelectAgent={(agent) => setSelectedAgent(agent)}
            onUpdateAgentPhoto={handleUpdateAgentPhoto}
            isNativeMobile={isSmallScreen}
          />
        </main>
      )}

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        equipes={equipes}
        onAddEmployee={handleAddEmployee}
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
