import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Clock,
  Building,
  Smartphone,
  Calendar,
  AlertCircle,
  Menu,
  ShieldCheck,
  Award,
  Layers,
  MapPin,
  RefreshCw,
  LogOut,
  FolderLock
} from 'lucide-react';
import {
  User,
  Equipe,
  Pointage,
  Presence,
  RhAdminUser,
  PayrollExportHistory,
} from './types';
import {
  initialUsers,
  initialEquipes,
  initialPresences,
  initialPointages,
  initialExportHistory,
} from './mockData';
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

// Dashboard views & modals
import { DashboardHeader } from './components/web/DashboardHeader';
import { DashboardStats } from './components/web/DashboardStats';
import { LiveTrackingCard } from './components/web/LiveTrackingCard';
import { QuickActions } from './components/web/QuickActions';
import { PointagesTable } from './components/web/PointagesTable';
import { PresencesTable } from './components/web/PresencesTable';
import { EmployeesView } from './components/web/EmployeesView';
import { SitesView } from './components/web/SitesView';
import { RapportsView } from './components/web/RapportsView';
import { CameraModal } from './components/CameraModal';
import { PhotoInspectionModal } from './components/PhotoInspectionModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { AddSiteModal } from './components/AddSiteModal';
import { RhLoginModal } from './components/RhLoginModal';
import { MobileAppContainer } from './components/mobile/MobileAppContainer';
import { KlinaTopLogo } from './components/common/KlinaTopLogo';

export default function App() {
  // Navigation tabs (RH Web App)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pointages' | 'presences' | 'employes' | 'sites' | 'rapports' | 'mobile'>('dashboard');

  // RH Authentication State
  const [currentAdmin, setCurrentAdmin] = useState<RhAdminUser | null>(() => {
    try {
      const savedAdmin = localStorage.getItem('klinatop_logged_admin');
      if (savedAdmin) {
        return JSON.parse(savedAdmin);
      }
    } catch (e) {
      console.warn('Could not parse saved admin session', e);
    }
    return null;
  });

  const [isRhLoginModalOpen, setIsRhLoginModalOpen] = useState(false);
  const [adminsList, setAdminsList] = useState<RhAdminUser[]>(initialAdmins);

  // Real-time synchronization state from Firestore
  const [isSyncing, setIsSyncing] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
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

  // Modals & Camera
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState<string | null>(null);
  const [inspectPointage, setInspectPointage] = useState<Pointage | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);

  // Responsive device check
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize Firestore listeners
  useEffect(() => {
    let unsubUsers: () => void;
    let unsubPointages: () => void;
    let unsubPresences: () => void;
    let unsubEquipes: () => void;
    let unsubAdmins: () => void;

    async function bootstrap() {
      setIsSyncing(true);
      try {
        await initializeDatabaseIfEmpty();
        setIsCloudConnected(true);

        unsubUsers = subscribeToUsers((data) => {
          if (data && data.length > 0) {
            setUsers(data);
            const currentSavedId = localStorage.getItem('klinatop_logged_agent_id');
            if (currentSavedId) {
              const matched = data.find((u) => u.id === currentSavedId);
              if (matched) setSelectedAgent(matched);
            }
          }
        });

        unsubPointages = subscribeToPointages((data) => {
          if (data && data.length > 0) setPointages(data);
        });

        unsubPresences = subscribeToPresences((data) => {
          if (data && data.length > 0) setPresences(data);
        });

        unsubEquipes = subscribeToEquipes((data) => {
          if (data && data.length > 0) setEquipes(data);
        });

        unsubAdmins = subscribeToAdmins((data) => {
          if (data && data.length > 0) {
            setAdminsList(data);
            // Synchronisation sécurisée de l'administrateur connecté
            setCurrentAdmin((curr) => {
              if (!curr) return null;
              const currEmail = (curr.email || '').toLowerCase();
              const match = data.find(
                (a) => a.id === curr.id || (currEmail && a.email && a.email.toLowerCase() === currEmail)
              );
              return match || curr;
            });
          }
        });
      } catch (err) {
        console.warn('Operating in local offline mode:', err);
      } finally {
        setIsSyncing(false);
      }
    }

    bootstrap();

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubPointages) unsubPointages();
      if (unsubPresences) unsubPresences();
      if (unsubEquipes) unsubEquipes();
      if (unsubAdmins) unsubAdmins();
    };
  }, []);

  // Handlers for Check-in & Check-out
  const handlePerformCheckIn = async (photoUrl: string, address: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setIsCheckedIn(true);
    setCheckInTime(timeStr);

    const newPtg: Pointage = {
      id: `ptg-${Date.now()}`,
      employeId: selectedAgent.id,
      employeNom: selectedAgent.nom,
      equipeNom: selectedAgent.equipeNom,
      heure: timeStr,
      statut: 'Conforme',
      geolocalisation: {
        adresse: address || 'Cotonou, Bénin',
        latitude: 6.3654 + (Math.random() - 0.5) * 0.01,
        longitude: 2.4183 + (Math.random() - 0.5) * 0.01,
        statut: 'Conforme',
      },
      photoPreuveUrl: photoUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
      type: 'Arrivée',
    };

    setPointages((prev) => [newPtg, ...prev]);

    // Update Presences Table
    setPresences((prev) =>
      prev.map((p) =>
        p.employeId === selectedAgent.id
          ? {
              ...p,
              statut: 'Présent',
              heureArrivee: timeStr,
              photoArriveeUrl: newPtg.photoPreuveUrl,
              localisationArrivee: newPtg.geolocalisation.adresse,
            }
          : p
      )
    );

    // Save to Firestore
    try {
      await addPointageToFirestore(newPtg);
    } catch (e) {
      console.warn('Could not save to Cloud Firestore:', e);
    }
  };

  const handlePerformCheckOut = async (photoUrl: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setIsCheckedIn(false);

    const newPtg: Pointage = {
      id: `ptg-${Date.now()}`,
      employeId: selectedAgent.id,
      employeNom: selectedAgent.nom,
      equipeNom: selectedAgent.equipeNom,
      heure: timeStr,
      statut: 'Conforme',
      geolocalisation: {
        adresse: 'Site Client - Terminé',
        latitude: 6.3654,
        longitude: 2.4183,
        statut: 'Conforme',
      },
      photoPreuveUrl: photoUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=300',
      type: 'Départ',
    };

    setPointages((prev) => [newPtg, ...prev]);

    // Update Presences Table
    setPresences((prev) =>
      prev.map((p) =>
        p.employeId === selectedAgent.id
          ? {
              ...p,
              heureDepart: timeStr,
              photoDepartUrl: newPtg.photoPreuveUrl,
              totalHeures: '8h 00m',
            }
          : p
      )
    );

    // Save to Firestore
    try {
      await addPointageToFirestore(newPtg);
    } catch (e) {
      console.warn('Could not save to Cloud Firestore:', e);
    }
  };

  const handleAddEmployee = async (newEmp: User) => {
    setUsers((prev) => [newEmp, ...prev]);
    try {
      await registerUserInFirestore(newEmp);
    } catch (e) {
      console.error('Error creating employee:', e);
    }
  };

  const handleRegisterNewAgent = async (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setSelectedAgent(newUser);
    try {
      await registerUserInFirestore(newUser);
    } catch (e) {
      console.error('Error registering agent:', e);
    }
  };

  const handleUpdateAgentPhoto = async (userId: string, photoUrl: string) => {
    // 1. Update local users state
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, photoUrl } : u))
    );
    // 2. Update selected agent if matching
    setSelectedAgent((curr) => (curr.id === userId ? { ...curr, photoUrl } : curr));
    // 3. Persist to Cloud Firestore
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

  const handleAddSite = (newSite: any) => {
    const newEquipe: Equipe = {
      id: newSite.id,
      nom: newSite.nom,
      siteNom: newSite.siteNom,
      zone: newSite.zone,
      horaire: newSite.horaire,
      statut: 'Actif',
      agentsCount: 0,
      presenceTaux: 100,
    };
    setEquipes((prev) => [newEquipe, ...prev]);
  };

  const handleAdminLogin = (admin: RhAdminUser) => {
    setCurrentAdmin(admin);
    try {
      localStorage.setItem('klinatop_logged_admin', JSON.stringify(admin));
    } catch (e) {}
    setIsRhLoginModalOpen(false);
  };

  const handleAdminLogout = () => {
    setCurrentAdmin(null);
    try {
      localStorage.removeItem('klinatop_logged_admin');
    } catch (e) {}
  };

  // If mobile viewport, show exclusively Mobile App view
  if (isSmallScreen) {
    return (
      <div className="min-h-screen bg-[#F5F7FA]">
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
          onRegisterNewAgent={handleRegisterNewAgent}
          onSelectAgent={(agent) => setSelectedAgent(agent)}
          onUpdateAgentPhoto={handleUpdateAgentPhoto}
          isNativeMobile={true}
        />
        {isCameraModalOpen && (
          <CameraModal
            isOpen={isCameraModalOpen}
            onClose={() => setIsCameraModalOpen(false)}
            onCapturePhoto={(photoData) => {
              setPhotoCaptured(photoData);
              setIsCameraModalOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-poppins flex flex-col">
      {/* Top Bar Header */}
      <header className="bg-[#1F2937] text-white border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KlinaTopLogo variant="compact" size="sm" lightBackground={false} />
            <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>
            <span className="text-xs text-emerald-400 font-semibold hidden sm:inline-flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Système Officiel RH
            </span>
          </div>

          {/* Navigation Items (RH Desktop) */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#0F9D58] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('pointages')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'pointages'
                  ? 'bg-[#0F9D58] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Pointages
            </button>
            <button
              onClick={() => setActiveTab('presences')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'presences'
                  ? 'bg-[#0F9D58] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Présences
            </button>
            <button
              onClick={() => setActiveTab('employes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'employes'
                  ? 'bg-[#0F9D58] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Employés ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'sites'
                  ? 'bg-[#0F9D58] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Sites & Équipes
            </button>
            <button
              onClick={() => setActiveTab('rapports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'rapports'
                  ? 'bg-[#0F9D58] text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Paie & Rapports
            </button>
            <button
              onClick={() => setActiveTab('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'mobile'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-400 hover:bg-emerald-950/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simulateur Mobile</span>
            </button>
          </nav>

          {/* Admin User Profile or Login Trigger */}
          <div className="flex items-center gap-2">
            {currentAdmin ? (
              <div className="flex items-center gap-2.5 bg-gray-800/80 border border-gray-700 px-3 py-1.5 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                  {currentAdmin.nom.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-white leading-tight">{currentAdmin.nom}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">{currentAdmin.role}</p>
                </div>
                <button
                  onClick={handleAdminLogout}
                  title="Se déconnecter"
                  className="text-gray-400 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsRhLoginModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#0F9D58] hover:bg-[#0c8047] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>Connexion RH</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content View Switcher */}
      {activeTab === 'mobile' ? (
        <main className="flex-1 py-6 px-4">
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
            onRegisterNewAgent={handleRegisterNewAgent}
            onSelectAgent={(agent) => setSelectedAgent(agent)}
            onUpdateAgentPhoto={handleUpdateAgentPhoto}
            isNativeMobile={isSmallScreen}
          />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              <DashboardHeader
                onAddEmployeeClick={() => setIsAddEmployeeModalOpen(true)}
                onAddSiteClick={() => setIsAddSiteModalOpen(true)}
              />
              <DashboardStats
                pointages={pointages}
                presences={presences}
                users={users}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <LiveTrackingCard
                    pointages={pointages}
                    onInspectPhoto={(ptg) => setInspectPointage(ptg)}
                  />
                  <PresencesTable
                    presences={presences}
                    onInspectPhoto={(ptg) => setInspectPointage(ptg)}
                  />
                </div>
                <div className="space-y-6">
                  <QuickActions
                    onOpenAddEmployee={() => setIsAddEmployeeModalOpen(true)}
                    onOpenAddSite={() => setIsAddSiteModalOpen(true)}
                    onOpenMobileSim={() => setActiveTab('mobile')}
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'pointages' && (
            <PointagesTable
              pointages={pointages}
              onInspectPhoto={(ptg) => setInspectPointage(ptg)}
            />
          )}

          {activeTab === 'presences' && (
            <PresencesTable
              presences={presences}
              onInspectPhoto={(ptg) => setInspectPointage(ptg)}
            />
          )}

          {activeTab === 'employes' && (
            <EmployeesView
              users={users}
              equipes={equipes}
              onAddEmployeeClick={() => setIsAddEmployeeModalOpen(true)}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'sites' && (
            <SitesView
              equipes={equipes}
              onAddSiteClick={() => setIsAddSiteModalOpen(true)}
            />
          )}

          {activeTab === 'rapports' && (
            <RapportsView
              users={users}
              pointages={pointages}
              presences={presences}
              exportHistory={exportHistory}
              onAddExportRecord={(rec) => setExportHistory((prev) => [rec, ...prev])}
            />
          )}
        </main>
      )}

      {/* Global Modals */}
      {isCameraModalOpen && (
        <CameraModal
          isOpen={isCameraModalOpen}
          onClose={() => setIsCameraModalOpen(false)}
          onCapturePhoto={(photoData) => {
            setPhotoCaptured(photoData);
            setIsCameraModalOpen(false);
          }}
        />
      )}

      {inspectPointage && (
        <PhotoInspectionModal
          isOpen={!!inspectPointage}
          onClose={() => setInspectPointage(null)}
          pointage={inspectPointage}
        />
      )}

      {isAddEmployeeModalOpen && (
        <AddEmployeeModal
          isOpen={isAddEmployeeModalOpen}
          onClose={() => setIsAddEmployeeModalOpen(false)}
          equipes={equipes}
          onAddEmployee={handleAddEmployee}
        />
      )}

      {isAddSiteModalOpen && (
        <AddSiteModal
          isOpen={isAddSiteModalOpen}
          onClose={() => setIsAddSiteModalOpen(false)}
          onAddSite={handleAddSite}
        />
      )}

      {isRhLoginModalOpen && (
        <RhLoginModal
          isOpen={isRhLoginModalOpen}
          onClose={() => setIsRhLoginModalOpen(false)}
          onLogin={handleAdminLogin}
          adminsList={adminsList}
        />
      )}
    </div>
  );
}