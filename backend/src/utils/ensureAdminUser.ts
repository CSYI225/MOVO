import prisma from './prisma';
import { hacherMotDePasse } from './jwt';

export async function initialiserCompteAdmin(): Promise<void> {
  try {
    // 1. S'assurer que le rôle ADMIN existe
    let roleAdmin = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
    if (!roleAdmin) {
      roleAdmin = await prisma.role.create({
        data: {
          code: 'ADMIN',
          libelle: 'Administrateur',
          description: 'Super Administrateur Système MOVO',
        },
      });
      console.log('✅ Rôle ADMIN créé.');
    }

    // 2. S'assurer que le compte Admin initial existe
    const adminEmail = 'admin@movo.ci';
    const adminExistant = await prisma.utilisateur.findUnique({ where: { email: adminEmail } });

    if (!adminExistant) {
      const motDePasseHash = await hacherMotDePasse('Admin123456!');
      await prisma.utilisateur.create({
        data: {
          email: adminEmail,
          telephone: '+2250000000000',
          motDePasseHash,
          estReclame: true,
          emailVerifie: true,
          estActif: true,
          profil: {
            create: {
              prenom: 'Super',
              nom: 'Admin MOVO',
            },
          },
          roles: {
            create: {
              roleId: roleAdmin.id,
            },
          },
        },
      });
      console.log('🚀 Super Admin initial créé avec succès (admin@movo.ci / Admin123456!).');
    }
  } catch (error) {
    console.error('Erreur initialisation compte Admin :', error);
  }
}
