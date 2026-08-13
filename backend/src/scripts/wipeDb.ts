import dotenv from 'dotenv';
dotenv.config();
import prisma from '../utils/prisma';

async function wipeDatabase() {
  console.log('🧹 Clearing all user data from database...');

  // Truncate user data tables using CASCADE
  const userTables = [
    'pieces_jointes_contestations',
    'contestations',
    'pieces_jointes_avis',
    'reponses_avis',
    'historique_avis',
    'signalements_abus',
    'historique_credibilite',
    'avis',
    'demandes_liaison',
    'documents',
    'baux',
    'espaces_locatifs',
    'biens_immobiliers',
    'dossiers_locataires',
    'refresh_tokens',
    'verification_tokens',
    'utilisateurs_roles',
    'profils',
    'profils_pro_bailleurs',
    'deblocages_profil',
    'paiements',
    'abonnements',
    'notifications',
    'evenements_systeme',
    'membres_agence',
    'agences',
    'utilisateurs',
  ];

  for (const table of userTables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`  ✓ Table "${table}" truncated.`);
    } catch (err: any) {
      console.warn(`  ⚠️ Could not truncate "${table}":`, err.message);
    }
  }

  console.log('\n🌱 Ensuring reference tables (roles, devises, villes)...');

  // Roles
  const roles = [
    { code: 'BAILLEUR', libelle: 'Bailleur' },
    { code: 'LOCATAIRE', libelle: 'Locataire' },
    { code: 'ADMIN', libelle: 'Administrateur' },
    { code: 'MODERATEUR', libelle: 'Modérateur' },
    { code: 'AGENT_AGENCE', libelle: 'Agent d\'agence' },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }

  // Devises
  await prisma.devise.upsert({
    where: { code: 'XOF' },
    update: {},
    create: { code: 'XOF', libelle: 'Franc CFA', symbole: 'FCFA', estActif: true },
  });

  // Villes
  const villesCI = ['Abidjan', 'Yamoussoukro', 'Bouaké', 'San-Pédro', 'Korhogo', 'Daloa'];
  for (const v of villesCI) {
    const existing = await prisma.ville.findFirst({ where: { nom: v } });
    if (!existing) {
      await prisma.ville.create({
        data: { nom: v, codePays: 'CI' },
      });
    }
  }

  console.log('✅ Database wiped successfully and reference data verified!\n');
}

wipeDatabase()
  .catch((e) => {
    console.error('❌ Error during wipeDatabase:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
