import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hacherMotDePasse } from '../utils/jwt';
import { RequeteAuthentifiee } from '../middlewares/authMiddleware';

// ─── GET /api/admin/stats ──────────────────────────────────────────────────
export async function obtenirStatsGlobales(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const [
      totalBailleurs,
      totalLocataires,
      totalVisiteurs,
      totalBiens,
      totalBauxActifs,
      totalAvis,
      contestationsEnAttente,
    ] = await Promise.all([
      prisma.utilisateur.count({ where: { roles: { some: { role: { code: 'BAILLEUR' } } }, supprimeLe: null } }),
      prisma.utilisateur.count({ where: { roles: { some: { role: { code: 'LOCATAIRE' } } }, supprimeLe: null } }),
      prisma.utilisateur.count({ where: { roles: { some: { role: { code: 'VISITEUR' } } }, supprimeLe: null } }),
      prisma.bienImmobilier.count({ where: { supprimeLe: null } }),
      prisma.bail.count({ where: { supprimeLe: null, termineLe: null } }),
      prisma.avis.count({ where: { supprimeLe: null } }),
      prisma.contestation.count({ where: { statut: 'en_attente' } }),
    ]);

    res.status(200).json({
      stats: {
        bailleurs: totalBailleurs,
        locataires: totalLocataires,
        visiteurs: totalVisiteurs,
        biens: totalBiens,
        bauxActifs: totalBauxActifs,
        avis: totalAvis,
        contestationsEnAttente,
      },
    });
  } catch (error: any) {
    console.error('Erreur stats admin :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── POST /api/admin/bailleurs (Création de compte Bailleur par l'Admin) ───
export async function creerBailleurParAdmin(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const { email, telephone, prenom, nom, motDePasseTemp, nomEntreprise, telephonePro } = req.body;

    if (!email && !telephone) {
      res.status(400).json({ message: 'Veuillez fournir un email ou un numéro de téléphone.' });
      return;
    }
    if (!prenom || !nom) {
      res.status(400).json({ message: 'Le prénom et le nom sont obligatoires.' });
      return;
    }

    const mdpAUtiliser = motDePasseTemp || 'Bailleur2026!';
    if (mdpAUtiliser.length < 6) {
      res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    // Vérifier l'unicité
    if (email) {
      const existantEmail = await prisma.utilisateur.findUnique({ where: { email } });
      if (existantEmail) {
        res.status(409).json({ message: 'Un utilisateur existe déjà avec cet email.' });
        return;
      }
    }
    if (telephone) {
      const existantTel = await prisma.utilisateur.findUnique({ where: { telephone } });
      if (existantTel) {
        res.status(409).json({ message: 'Un utilisateur existe déjà avec ce numéro de téléphone.' });
        return;
      }
    }

    const motDePasseHash = await hacherMotDePasse(mdpAUtiliser);

    // Rôle BAILLEUR
    let roleBailleur = await prisma.role.findUnique({ where: { code: 'BAILLEUR' } });
    if (!roleBailleur) {
      roleBailleur = await prisma.role.create({ data: { code: 'BAILLEUR', libelle: 'Bailleur' } });
    }

    const nouveauBailleur = await prisma.utilisateur.create({
      data: {
        email: email || null,
        telephone: telephone || null,
        motDePasseHash,
        estReclame: false, // Compte temporaire non réclamé = premier login force changement MDP
        creeParUtilisateurId: req.utilisateur?.id || null,
        profil: {
          create: { prenom, nom },
        },
        profilProBailleur: nomEntreprise || telephonePro ? {
          create: { nomEntreprise: nomEntreprise || null, telephonePro: telephonePro || null, estVerifieAdmin: true },
        } : undefined,
        roles: {
          create: { roleId: roleBailleur.id },
        },
      },
      include: { profil: true, profilProBailleur: true },
    });

    res.status(201).json({
      message: 'Compte Bailleur créé avec succès.',
      bailleur: {
        id: nouveauBailleur.id,
        email: nouveauBailleur.email,
        telephone: nouveauBailleur.telephone,
        prenom: nouveauBailleur.profil?.prenom,
        nom: nouveauBailleur.profil?.nom,
        nomEntreprise: nouveauBailleur.profilProBailleur?.nomEntreprise || null,
        motDePasseTemp: mdpAUtiliser,
        estReclame: false,
        creeLe: nouveauBailleur.creeLe,
      },
    });
  } catch (error: any) {
    console.error('Erreur création bailleur par admin :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── GET /api/admin/bailleurs ──────────────────────────────────────────────
export async function obtenirBailleursAdmin(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const { q } = req.query as { q?: string };
    const terme = (q || '').trim().toLowerCase();

    const whereClause: any = {
      roles: { some: { role: { code: 'BAILLEUR' } } },
      supprimeLe: null,
    };

    if (terme.length > 0) {
      whereClause.OR = [
        { email: { contains: terme, mode: 'insensitive' } },
        { telephone: { contains: terme, mode: 'insensitive' } },
        { profil: { prenom: { contains: terme, mode: 'insensitive' } } },
        { profil: { nom: { contains: terme, mode: 'insensitive' } } },
      ];
    }

    const bailleurs = await prisma.utilisateur.findMany({
      where: whereClause,
      include: {
        profil: true,
        profilProBailleur: true,
        biensImmobiliers: { where: { supprimeLe: null } },
        bauxBailleur: { where: { supprimeLe: null } },
      },
      orderBy: { creeLe: 'desc' },
    });

    const formatted = bailleurs.map((b) => ({
      id: b.id,
      email: b.email,
      telephone: b.telephone,
      prenom: b.profil?.prenom || '',
      nom: b.profil?.nom || '',
      nomComplet: `${b.profil?.prenom || ''} ${b.profil?.nom || ''}`.trim() || b.email || b.telephone || 'Bailleur',
      nomEntreprise: b.profilProBailleur?.nomEntreprise || null,
      estActif: b.estActif,
      estReclame: b.estReclame,
      nombreBiens: b.biensImmobiliers.length,
      nombreBaux: b.bauxBailleur.length,
      creeLe: b.creeLe,
      derniereConnexionLe: b.derniereConnexionLe,
    }));

    res.status(200).json({ bailleurs: formatted });
  } catch (error: any) {
    console.error('Erreur liste bailleurs admin :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── PUT /api/admin/bailleurs/:id/statut ───────────────────────────────────
export async function basculerStatutBailleur(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { estActif } = req.body;

    const bailleur = await prisma.utilisateur.findFirst({
      where: { id, roles: { some: { role: { code: 'BAILLEUR' } } } },
    });
    if (!bailleur) {
      res.status(404).json({ message: 'Bailleur introuvable.' });
      return;
    }

    const misAJour = await prisma.utilisateur.update({
      where: { id },
      data: { estActif: Boolean(estActif) },
    });

    res.status(200).json({
      message: `Compte bailleur ${misAJour.estActif ? 'activé' : 'désactivé'} avec succès.`,
      estActif: misAJour.estActif,
    });
  } catch (error: any) {
    console.error('Erreur statut bailleur :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── GET /api/admin/locataires ─────────────────────────────────────────────
export async function obtenirLocatairesAdmin(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const { q } = req.query as { q?: string };
    const terme = (q || '').trim().toLowerCase();

    const whereClause: any = {
      roles: { some: { role: { code: 'LOCATAIRE' } } },
      supprimeLe: null,
    };

    if (terme.length > 0) {
      whereClause.OR = [
        { email: { contains: terme, mode: 'insensitive' } },
        { telephone: { contains: terme, mode: 'insensitive' } },
        { profil: { prenom: { contains: terme, mode: 'insensitive' } } },
        { profil: { nom: { contains: terme, mode: 'insensitive' } } },
      ];
    }

    const locataires = await prisma.utilisateur.findMany({
      where: whereClause,
      include: {
        profil: true,
        dossierLocataire: true,
        avisRecus: { where: { supprimeLe: null } },
        bauxLocataire: { where: { supprimeLe: null }, orderBy: { commenceLe: 'desc' }, take: 1 },
      },
      orderBy: { creeLe: 'desc' },
    });

    const formatted = locataires.map((l) => ({
      id: l.id,
      email: l.email,
      telephone: l.telephone,
      prenom: l.profil?.prenom || '',
      nom: l.profil?.nom || '',
      nomComplet: `${l.profil?.prenom || ''} ${l.profil?.nom || ''}`.trim() || l.email || l.telephone || 'Locataire',
      estActif: l.estActif,
      estReclame: l.estReclame,
      reviewCount: l.avisRecus.length,
      pieceVerifiee: l.dossierLocataire?.pieceVerifiee || false,
      creeLe: l.creeLe,
    }));

    res.status(200).json({ locataires: formatted });
  } catch (error: any) {
    console.error('Erreur liste locataires admin :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── GET /api/admin/biens ──────────────────────────────────────────────────
export async function obtenirBiensAdmin(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const biens = await prisma.bienImmobilier.findMany({
      where: { supprimeLe: null },
      include: {
        ville: true,
        bailleur: { include: { profil: true } },
        espacesLocatifs: { where: { supprimeLe: null }, include: { baux: { where: { supprimeLe: null } } } },
      },
      orderBy: { creeLe: 'desc' },
    });

    const formatted = biens.map((b) => ({
      id: b.id,
      nom: b.nom,
      type: b.type,
      adresse: b.adresse,
      ville: b.ville?.nom || '',
      nombrePieces: b.nombrePieces,
      photo: b.photo,
      bailleurNom: `${b.bailleur?.profil?.prenom || ''} ${b.bailleur?.profil?.nom || ''}`.trim() || b.bailleur?.email || 'Inconnu',
      bailleurId: b.bailleurUtilisateurId,
      nombreEspaces: b.espacesLocatifs.length,
      creeLe: b.creeLe,
    }));

    res.status(200).json({ biens: formatted });
  } catch (error: any) {
    console.error('Erreur biens admin :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── GET /api/admin/contestations & POST arbitrer ─────────────────────────
export async function obtenirContestationsAdmin(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const contestations = await prisma.contestation.findMany({
      include: {
        plaignant: { include: { profil: true } },
        piecesJointes: true,
        avis: {
          include: {
            auteur: { include: { profil: true } },
            sujet: { include: { profil: true } },
          },
        },
      },
      orderBy: { soumisLe: 'desc' },
    });

    const formatted = contestations.map((c) => ({
      id: c.id,
      raison: c.raison,
      statut: c.statut,
      soumisLe: c.soumisLe,
      plaignantNom: `${c.plaignant.profil?.prenom || ''} ${c.plaignant.profil?.nom || ''}`.trim() || c.plaignant.email,
      auteurAvisNom: `${c.avis.auteur.profil?.prenom || ''} ${c.avis.auteur.profil?.nom || ''}`.trim() || c.avis.auteur.email,
      noteAvis: Number(c.avis.note),
      commentaireAvis: c.avis.commentaire,
      piecesJointes: c.piecesJointes.map((p) => ({ id: p.id, url: p.urlFichier, nom: p.nomFichier })),
    }));

    res.status(200).json({ contestations: formatted });
  } catch (error: any) {
    console.error('Erreur contestations admin :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function arbitrerContestationAdmin(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { action, noteResolution } = req.body; // action = 'approuver' | 'rejeter'

    const contestationId = String(id);
    const contestation = await prisma.contestation.findUnique({ where: { id: contestationId } });
    if (!contestation) {
      res.status(404).json({ message: 'Contestation introuvable.' });
      return;
    }

    const statutFinal = action === 'approuver' ? 'resolu_valide' : 'resolu_rejete';

    const misAJour = await prisma.contestation.update({
      where: { id: contestationId },
      data: {
        statut: statutFinal,
        resoluPar: req.utilisateur?.id || null,
        resoluLe: new Date(),
        noteResolution: noteResolution || null,
      },
    });

    // Si la contestation est approuvée par l'admin, marquer l'avis comme supprimé (soft delete)
    if (action === 'approuver') {
      await prisma.avis.update({
        where: { id: contestation.avisId },
        data: { supprimeLe: new Date() },
      });
    }

    res.status(200).json({ message: `Contestation arbitrée avec succès (${statutFinal}).`, contestation: misAJour });
  } catch (error: any) {
    console.error('Erreur arbitrage contestation :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
