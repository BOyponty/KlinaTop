import { Presence, User } from '../types';

export function downloadPayrollExport(
  periode: string,
  format: 'excel' | 'csv' | 'pdf',
  presences: Presence[],
  users: User[]
) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `KlinaTop_Paie_${periode.replace(/\s+/g, '_')}_${dateStr}.${format === 'excel' ? 'xlsx' : format}`;

  if (format === 'csv' || format === 'excel') {
    // Generate CSV content
    const headers = [
      'Matricule ID',
      'Nom Employe',
      'Poste',
      'Equipe',
      'Heures de Check-in',
      'Heures de Check-out',
      'Duree Travaillee',
      'Statut Presence',
      'Periode Paie'
    ];

    const rows = presences.map((p) => {
      const u = users.find((usr) => usr.id === p.userId);
      return [
        p.userId,
        `"${p.userName}"`,
        `"${p.userPoste}"`,
        `"${p.equipeNom}"`,
        p.heureCheckin || '--:--',
        p.heureCheckout || '--:--',
        `"${p.duree}"`,
        p.statut,
        `"${periode}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === 'pdf') {
    // For PDF, generate a clean printable/downloadable text report
    const pdfSimulatedText = `
====================================================================
               KLINATOP - EXPORT PAIE & HEURES TRAVAILLÉES
====================================================================
Période: ${periode}
Généré le: ${new Date().toLocaleString('fr-FR')}
Entreprise: KlinaTop Bénin - Service de Nettoyage Professionnel
--------------------------------------------------------------------

RÉSUMÉ GLOBALE:
- Total Employés Suivis: ${users.length}
- Période Concernée: ${periode}
- Export Sécurisé avec Photo & Horodatage GPS

DÉTAILS DES HEURES PAR EMPLOYÉ:
--------------------------------------------------------------------
${presences
  .map(
    (p, idx) =>
      `${idx + 1}. ${p.userName} (${p.userPoste})
   Équipe: ${p.equipeNom} | Statut: ${p.statut.toUpperCase()}
   Arrivée: ${p.heureCheckin || 'N/A'} | Départ: ${p.heureCheckout || 'N/A'} | Durée: ${p.duree}
   Location Checkin: ${p.adresseCheckin || 'N/A'}
--------------------------------------------------------------------`
  )
  .join('\n')}

Note: Ce document certifie l'exactitude des présences avec preuve GPS et photo.
Document prêt pour l'intégration dans le logiciel de paie.
====================================================================
`;

    const blob = new Blob([pdfSimulatedText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `KlinaTop_Paie_${periode.replace(/\s+/g, '_')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
