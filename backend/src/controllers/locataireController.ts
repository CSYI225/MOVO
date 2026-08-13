import { Response } from 'express';
import prisma from '../utils/prisma';
import { hacherMotDePasse } from '../utils/jwt';
import { RequeteAuthentifiee } from '../middlewares/authMiddleware';

// Génère un mot de passe éphémère lisible du type "Movo-4829"
function genererMotDePasseEphemere(): string {
  const chiffres = Math.floor(1000 + Math.random() * 9000);
  return `Movo-${chiffres}`;
}

// GET /api/locataires/recherche?q=terme
// Recherche globale parmi tous les utilisateurs ayant le rôle LOCATAIRE
export async function rechercherLocataires(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const { q } = req.query as { q?: string };
    const terme = q ? q.trim().toLowerCase() : '';

    const whereCondition: any = {
      roles: {
        some: {
          role: { code: 'LOCATAIRE' },
        },
      },
    };

    if (terme.length > 0) {
      whereCondition.OR = [
        {
          email: {
            contains: terme,
            mode: 'insensitive',
          },
        },
        {
          telephone: {
            contains: terme,
          },
        },
        {
          profil: {
            OR: [
              { prenom: { contains: terme, mode: 'insensitive' } },
              { nom: { contains: terme, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const utilisateurs = await prisma.utilisateur.findMany({
      where: whereCondition,
      include: {
        profil: true,
        roles: { include: { role: true } },
      },
      take: 50,
      orderBy: { creeLe: 'desc' },
    });

    const bailleurId = req.utilisateur?.id;

    const locataires = await Promise.all(utilisateurs.map(async (u) => {
      const bailActif = await prisma.bail.findFirst({
        where: {
          locataireUtilisateurId: u.id,
          termineLe: null,
          supprimeLe: null,
        },
        include: {
          espaceLocatif: { include: { bienImmobilier: true } },
        },
      });

      return {
        id: u.id,
        email: u.email,
        telephone: u.telephone,
        prenom: u.profil?.prenom,
        nom: u.profil?.nom,
        name: `${u.profil?.prenom || ''} ${u.profil?.nom || ''}`.trim() || u.email || u.telephone,
        estActif: !!bailActif,
        estActifAilleurs: bailActif ? bailActif.bailleurUtilisateurId !== bailleurId : false,
        bienActuel: bailActif ? {
          nom: bailActif.espaceLocatif.bienImmobilier.nom,
          adresse: bailActif.espaceLocatif.bienImmobilier.adresse,
          bailleurId: bailActif.bailleurUtilisateurId,
        } : null,
      };
    }));

    res.status(200).json({ locataires });
  } catch (error: any) {
    console.error('Erreur recherche locataires :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche.' });
  }
}

// POST /api/locataires/creer-manuel
// Crée un compte locataire manuellement (par le bailleur)
export async function creerLocataireManuel(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    if (!bailleurId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    const { prenom, nom, email, telephone } = req.body;

    if (!prenom || !nom) {
      res.status(400).json({ message: 'Le prénom et le nom sont obligatoires.' });
      return;
    }

    if (!email && !telephone) {
      res.status(400).json({ message: 'Un email ou un numéro de téléphone est requis.' });
      return;
    }

    // Verifier la non-existence - retourner les infos de l'existant si doublon
    if (email) {
      const existant = await prisma.utilisateur.findUnique({
        where: { email },
        include: { profil: true },
      });
      if (existant) {
        res.status(409).json({
          code: 'EMAIL_EXISTE',
          message: `Un compte avec cet email existe deja sur la plateforme.`,
          utilisateurExistant: {
            id: existant.id,
            prenom: existant.profil?.prenom,
            nom: existant.profil?.nom,
            email: existant.email,
            telephone: existant.telephone,
            name: `${existant.profil?.prenom || ''} ${existant.profil?.nom || ''}`.trim() || existant.email,
          },
        });
        return;
      }
    }

    if (telephone) {
      const existant = await prisma.utilisateur.findUnique({
        where: { telephone },
        include: { profil: true },
      });
      if (existant) {
        res.status(409).json({
          code: 'TELEPHONE_EXISTE',
          message: `Un compte avec ce numero de telephone existe deja sur la plateforme.`,
          utilisateurExistant: {
            id: existant.id,
            prenom: existant.profil?.prenom,
            nom: existant.profil?.nom,
            email: existant.email,
            telephone: existant.telephone,
            name: `${existant.profil?.prenom || ''} ${existant.profil?.nom || ''}`.trim() || existant.email || existant.telephone,
          },
        });
        return;
      }
    }

    // Générer le mot de passe éphémère
    const motDePasseEphemere = genererMotDePasseEphemere();
    const motDePasseHash = await hacherMotDePasse(motDePasseEphemere);

    // Récupérer ou créer le rôle LOCATAIRE
    let role = await prisma.role.findUnique({ where: { code: 'LOCATAIRE' } });
    if (!role) {
      role = await prisma.role.create({
        data: { code: 'LOCATAIRE', libelle: 'Locataire' },
      });
    }

    // Créer le compte locataire
    // estReclame = false signifie que le locataire n'a pas encore activé son compte
    const nouveauLocataire = await prisma.utilisateur.create({
      data: {
        email: email || null,
        telephone: telephone || null,
        motDePasseHash,
        estReclame: false, // Compte non encore réclamé / activé par le locataire
        creeParUtilisateurId: bailleurId,
        profil: {
          create: {
            prenom,
            nom,
          },
        },
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        profil: true,
        roles: { include: { role: true } },
      },
    });

    res.status(201).json({
      message: 'Compte locataire créé avec succès.',
      locataire: {
        id: nouveauLocataire.id,
        prenom: nouveauLocataire.profil?.prenom,
        nom: nouveauLocataire.profil?.nom,
        email: nouveauLocataire.email,
        telephone: nouveauLocataire.telephone,
      },
      // On renvoie le mot de passe en clair UNE SEULE FOIS pour le communiquer au locataire
      motDePasseEphemere,
      instructions: `Communiquez ces identifiants au locataire. Il devra changer son mot de passe lors de sa première connexion.`,
    });
  } catch (error: any) {
    console.error('Erreur création locataire :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du compte locataire.' });
  }
}

// POST /api/locataires/changer-mdp-temporaire
// Permet au locataire de changer son mot de passe éphémère lors de la première connexion
export async function changerMotDePasseTemporaire(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const utilisateurId = req.utilisateur?.id;
    if (!utilisateurId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      res.status(400).json({ message: 'L\'ancien et le nouveau mot de passe sont requis.' });
      return;
    }

    if (nouveauMotDePasse.length < 6) {
      res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
    });

    if (!utilisateur || !utilisateur.motDePasseHash) {
      res.status(404).json({ message: 'Utilisateur non trouvé.' });
      return;
    }

    // Vérifier l'ancien mot de passe
    const { mepMotDePasseValide } = await import('../utils/jwt');
    const valide = await mepMotDePasseValide(ancienMotDePasse, utilisateur.motDePasseHash);
    if (!valide) {
      res.status(401).json({ message: 'L\'ancien mot de passe est incorrect.' });
      return;
    }

    const nouveauHash = await hacherMotDePasse(nouveauMotDePasse);

    // Mettre à jour le mot de passe et marquer le compte comme réclamé
    await prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: {
        motDePasseHash: nouveauHash,
        estReclame: true, // Le locataire a activé son compte
      },
    });

    res.status(200).json({
      message: 'Mot de passe changé avec succès. Votre compte est maintenant activé.',
    });
  } catch (error: any) {
    console.error('Erreur changement mot de passe :', error);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe.' });
  }
}

// GET /api/locataires/mes-locataires
// Récupère la liste des locataires liés au bailleur connecté (via baux)
export async function obtenirMesLocataires(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    if (!bailleurId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    // 1. Récupérer toutes les demandes de liaison de ce bailleur (la plus récente par locataire)
    const demandesDirectes = await prisma.demandeLiaison.findMany({
      where: { bailleurUtilisateurId: bailleurId },
      orderBy: { creeLe: 'desc' },
    });
    const demandesParLocataire = new Map<string, string>();
    demandesDirectes.forEach(d => {
      if (!demandesParLocataire.has(d.locataireUtilisateurId)) {
        demandesParLocataire.set(d.locataireUtilisateurId, d.statut);
      }
    });

    // 2. Récupérer tous les baux de ce bailleur (actifs ET terminés)
    const baux = await prisma.bail.findMany({
      where: { bailleurUtilisateurId: bailleurId, supprimeLe: null },
      include: {
        locataire: { include: { profil: true } },
        espaceLocatif: { include: { bienImmobilier: true } },
        demandesLiaison: {
          orderBy: { creeLe: 'desc' },
          take: 1,
        },
      },
      orderBy: { commenceLe: 'desc' },
    });

    // Dédupliquer par locataire (garder le bail le plus récent par locataire)
    const locatairesMap = new Map<string, any>();
    for (const bail of baux) {
      const u = bail.locataire;
      const locataireId = u.id;
      if (!locatairesMap.has(locataireId)) {
        const bailActif = !bail.termineLe;
        const bien = bail.espaceLocatif.bienImmobilier;
        
        // Priorité à la dernière demande de liaison enregistrée pour ce locataire
        const statutDemande = demandesParLocataire.get(locataireId) || bail.demandesLiaison[0]?.statut;
        let relation = 'En attente';
        if (statutDemande === 'valide') relation = 'Vérifié';
        else if (statutDemande === 'refuse') relation = 'Refusé';
        else if (statutDemande === 'en_attente') relation = 'En attente';

        locatairesMap.set(locataireId, {
          id: u.id,
          email: u.email,
          phone: u.telephone,
          telephone: u.telephone,
          prenom: u.profil?.prenom,
          nom: u.profil?.nom,
          name: `${u.profil?.prenom || ''} ${u.profil?.nom || ''}`.trim() || u.email || u.telephone || 'Locataire',
          // Colonne Relation = réponse locataire à la demande de liaison
          relation,
          status: relation, // Pour compatibilité
          isFormer: !bailActif,
          property: bailActif ? bien.nom : null,
          propertyId: bien.id,
          initials: `${u.profil?.prenom?.[0] || ''}${u.profil?.nom?.[0] || ''}`.toUpperCase() || 'LC',
          bailId: bail.id,
          bailActif,
        });
      }
    }

    // Ajouter aussi les locataires créés manuellement sans bail
    const locatairesCrees = await prisma.utilisateur.findMany({
      where: { creeParUtilisateurId: bailleurId },
      include: { profil: true },
      orderBy: { creeLe: 'desc' },
    });
    for (const u of locatairesCrees) {
      if (!locatairesMap.has(u.id)) {
        const statutDemande = demandesParLocataire.get(u.id);
        let relation = 'En attente';
        if (statutDemande === 'valide') relation = 'Vérifié';
        else if (statutDemande === 'refuse') relation = 'Refusé';
        else if (statutDemande === 'en_attente') relation = 'En attente';
        else if (!u.estReclame) relation = 'Non-vérifié';

        locatairesMap.set(u.id, {
          id: u.id,
          email: u.email,
          phone: u.telephone,
          telephone: u.telephone,
          prenom: u.profil?.prenom,
          nom: u.profil?.nom,
          name: `${u.profil?.prenom || ''} ${u.profil?.nom || ''}`.trim() || u.email || u.telephone || 'Locataire',
          relation,
          status: relation,
          isFormer: true,
          property: null,
          initials: `${u.profil?.prenom?.[0] || ''}${u.profil?.nom?.[0] || ''}`.toUpperCase() || 'LC',
        });
      }
    }

    const locataires = Array.from(locatairesMap.values());
    res.status(200).json({ locataires });
  } catch (error: any) {
    console.error('Erreur obtention mes locataires :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des locataires.' });
  }
}

// PUT /api/locataires/profil
// Permet au locataire connecté de modifier son profil (Nom, Prénom, Email, Mot de passe)
export async function modifierProfilLocataire(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const userId = req.utilisateur?.id;
    if (!userId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    const { nom, prenom, email, motDePasse } = req.body;

    // Vérifier l'unicité de l'email s'il est changé
    if (email) {
      const existant = await prisma.utilisateur.findFirst({
        where: { email: { equals: email, mode: 'insensitive' }, id: { not: userId } },
      });
      if (existant) {
        res.status(400).json({ message: 'Cet email est déjà utilisé par un autre utilisateur.' });
        return;
      }
    }

    const userData: any = {};
    if (email) userData.email = email;
    if (motDePasse && motDePasse.trim().length >= 6) {
      userData.motDePasseHash = await hacherMotDePasse(motDePasse.trim());
    }

    if (Object.keys(userData).length > 0) {
      await prisma.utilisateur.update({
        where: { id: userId },
        data: userData,
      });
    }

    if (nom !== undefined || prenom !== undefined) {
      await prisma.profil.upsert({
        where: { utilisateurId: userId },
        update: {
          ...(nom !== undefined && { nom }),
          ...(prenom !== undefined && { prenom }),
        },
        create: {
          utilisateurId: userId,
          nom: nom || '',
          prenom: prenom || '',
        },
      });
    }

    const updatedUser = await prisma.utilisateur.findUnique({
      where: { id: userId },
      include: { profil: true, roles: { include: { role: true } } },
    });

    res.status(200).json({
      message: 'Profil mis à jour avec succès.',
      utilisateur: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        prenom: updatedUser?.profil?.prenom,
        nom: updatedUser?.profil?.nom,
        name: `${updatedUser?.profil?.prenom || ''} ${updatedUser?.profil?.nom || ''}`.trim() || updatedUser?.email,
      },
    });
  } catch (error: any) {
    console.error('Erreur modification profil :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// DELETE /api/locataires/mes-locataires/:id
// Supprime un locataire de la liste du bailleur s'il n'a pas de bail actif accepté
export async function retirerLocataireListe(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    const locataireIdParam = req.params.id;
    const locataireId = Array.isArray(locataireIdParam) ? locataireIdParam[0] : locataireIdParam;

    if (!bailleurId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    // Vérifier si un bail actif vérifié existe
    const bailVerifie = await prisma.bail.findFirst({
      where: {
        bailleurUtilisateurId: bailleurId,
        locataireUtilisateurId: locataireId,
        termineLe: null,
        supprimeLe: null,
        demandesLiaison: { some: { statut: 'valide' } },
      },
    });

    if (bailVerifie) {
      res.status(400).json({
        message: 'Impossible de retirer ce locataire car la demande de liaison a déjà été acceptée et le bail est actif. Vous devez d\'abord libérer le logement.',
      });
      return;
    }

    // Soft delete baux non vérifiés
    await prisma.bail.updateMany({
      where: {
        bailleurUtilisateurId: bailleurId,
        locataireUtilisateurId: locataireId,
        termineLe: null,
      },
      data: { supprimeLe: new Date() },
    });

    // Anuller demandes en attente
    await prisma.demandeLiaison.updateMany({
      where: {
        bailleurUtilisateurId: bailleurId,
        locataireUtilisateurId: locataireId,
        statut: 'en_attente',
      },
      data: { statut: 'annulee' },
    });

    res.status(200).json({ message: 'Locataire retiré de votre liste avec succès.' });
  } catch (error: any) {
    console.error('Erreur retrait locataire :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// GET /api/locataires/mon-bien-actuel
export async function obtenirMonBienActuel(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const locataireId = req.utilisateur?.id;
    if (!locataireId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    // Chercher un bail actif pour le locataire
    const bail = await prisma.bail.findFirst({
      where: {
        locataireUtilisateurId: locataireId,
        termineLe: null,
        supprimeLe: null,
      },
      include: {
        espaceLocatif: {
          include: { bienImmobilier: true },
        },
        bailleur: {
          include: { profil: true },
        },
      },
      orderBy: { creeLe: 'desc' },
    });

    if (bail) {
      const bien = bail.espaceLocatif.bienImmobilier;
      res.status(200).json({
        bienActuel: {
          nom: bien.nom,
          type: bien.type,
          adresse: bien.adresse,
          loyer: `${Math.round(Number(bail.loyerMensuel)).toLocaleString('fr-FR')} ${bail.codeDevise || 'FCFA'}`,
          bailleur: `${bail.bailleur.profil?.prenom || ''} ${bail.bailleur.profil?.nom || ''}`.trim() || bail.bailleur.email,
          statut: 'Actif',
        },
      });
      return;
    }

    // Sinon vérifier si un avis a été publié par un bailleur
    const avisRecent = await prisma.avis.findFirst({
      where: { sujetUtilisateurId: locataireId, supprimeLe: null },
      include: { auteur: { include: { profil: true } } },
      orderBy: { publieLe: 'desc' },
    });

    if (avisRecent) {
      res.status(200).json({
        bienActuel: {
          nom: 'Logement Rattaché',
          type: 'Résidence',
          adresse: 'Abidjan, Côte d\'Ivoire',
          loyer: 'Loyer conventionnel',
          bailleur: `${avisRecent.auteur.profil?.prenom || ''} ${avisRecent.auteur.profil?.nom || ''}`.trim() || avisRecent.auteur.email,
          statut: 'Actif',
        },
      });
      return;
    }

    res.status(200).json({ bienActuel: null });
  } catch (error: any) {
    console.error('Erreur obtention bien actuel :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du bien actuel.' });
  }
}
