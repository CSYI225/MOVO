import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ─── Helper : calculer le score d'un locataire ─────────────────────────────
function calculerScore(avis: any[]): number {
  if (!avis || avis.length === 0) return 5.0;
  let totalRating = 0;
  let totalWeight = 0;

  avis.forEach((a) => {
    const noteNum = Number(a.note) || 5;
    const estConteste = a.contestations && a.contestations.length > 0;
    let weight = 1.0;
    if (estConteste) weight = 0.2;
    else if (noteNum >= 4) weight = 1.3;

    totalRating += noteNum * weight;
    totalWeight += weight;
  });

  let base = totalWeight > 0 ? totalRating / totalWeight : 5.0;

  let adj = 0;
  avis.forEach((a) => {
    const estConteste = a.contestations && a.contestations.length > 0;
    if (!estConteste) {
      if (a.regularitePaiement === 'Toujours à temps') adj += 0.05;
      if (a.regularitePaiement === 'Pas régulier') adj -= 0.4;
    }
  });

  const final = Math.max(1.0, Math.min(5.0, base + adj));
  return Math.round(final * 10) / 10;
}

// ─── GET /api/public/locataires?q=terme&page=1&limit=20 ───────────────────
export async function rechercherLocatairesPublic(req: Request, res: Response): Promise<void> {
  try {
    const { q, page = '1', limit = '20' } = req.query as { q?: string; page?: string; limit?: string };
    const terme = (typeof q === 'string' ? q : '').trim().toLowerCase();
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(50, parseInt(String(limit), 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const whereCondition: any = {
      roles: { some: { role: { code: 'LOCATAIRE' } } },
      supprimeLe: null,
    };

    if (terme.length > 0) {
      whereCondition.OR = [
        { email: { contains: terme, mode: 'insensitive' } },
        { profil: { prenom: { contains: terme, mode: 'insensitive' } } },
        { profil: { nom: { contains: terme, mode: 'insensitive' } } },
      ];
    }

    const [utilisateurs, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where: whereCondition,
        include: {
          profil: true,
          avisRecus: {
            where: { supprimeLe: null },
            include: { contestations: true },
          },
          bauxLocataire: {
            where: { supprimeLe: null },
            orderBy: { commenceLe: 'desc' },
            take: 1,
            include: {
              espaceLocatif: {
                include: {
                  bienImmobilier: {
                    include: { ville: true },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { creeLe: 'desc' },
      }),
      prisma.utilisateur.count({ where: whereCondition }),
    ]);

    const locataires = utilisateurs.map((u) => {
      const score = calculerScore(u.avisRecus);
      const prenom = u.profil?.prenom || '';
      const nom = u.profil?.nom || '';
      const fullName = `${prenom} ${nom}`.trim() || u.email || u.telephone || 'Locataire';
      const initials = `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase() || 'LC';

      const dernierBail = u.bauxLocataire[0];
      const bien = dernierBail?.espaceLocatif?.bienImmobilier;
      const ville = bien?.ville?.nom || null;
      const adresse = bien?.adresse || null;
      const location = ville ? (adresse ? `${adresse}, ${ville}` : ville) : 'Côte d\'Ivoire';

      return {
        id: u.id,
        name: fullName,
        prenom,
        nom,
        initials,
        location,
        rating: score,
        reviewCount: u.avisRecus.length,
        avatar: u.profil?.urlAvatar || null,
      };
    });

    res.status(200).json({ locataires, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    console.error('Erreur recherche publique locataires :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── GET /api/public/locataires/:id ────────────────────────────────────────
export async function obtenirProfilPublicLocataire(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const u = await prisma.utilisateur.findFirst({
      where: { id, supprimeLe: null, roles: { some: { role: { code: 'LOCATAIRE' } } } },
      include: {
        profil: true,
        avisRecus: {
          where: { supprimeLe: null },
          include: { contestations: true },
        },
        bauxLocataire: {
          where: { supprimeLe: null },
          orderBy: { commenceLe: 'desc' },
          take: 1,
          include: {
            espaceLocatif: {
              include: {
                bienImmobilier: {
                  include: { ville: true },
                },
              },
            },
          },
        },
      },
    });

    if (!u) {
      res.status(404).json({ message: 'Locataire introuvable.' });
      return;
    }

    const score = calculerScore(u.avisRecus);
    const prenom = u.profil?.prenom || '';
    const nom = u.profil?.nom || '';
    const fullName = `${prenom} ${nom}`.trim() || u.email || u.telephone || 'Locataire';
    const initials = `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase() || 'LC';

    const dernierBail = u.bauxLocataire[0];
    const bien = dernierBail?.espaceLocatif?.bienImmobilier;
    const ville = bien?.ville?.nom || null;
    const adresse = bien?.adresse || null;
    const location = ville ? (adresse ? `${adresse}, ${ville}` : ville) : 'Côte d\'Ivoire';

    res.status(200).json({
      locataire: {
        id: u.id,
        name: fullName,
        prenom,
        nom,
        initials,
        location,
        rating: score,
        reviewCount: u.avisRecus.length,
        avatar: u.profil?.urlAvatar || null,
      },
    });
  } catch (error: any) {
    console.error('Erreur profil public locataire :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── GET /api/public/locataires/:id/avis ───────────────────────────────────
export async function obtenirAvisPublicLocataire(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const locataireExiste = await prisma.utilisateur.findFirst({
      where: { id, supprimeLe: null, roles: { some: { role: { code: 'LOCATAIRE' } } } },
    });
    if (!locataireExiste) {
      res.status(404).json({ message: 'Locataire introuvable.' });
      return;
    }

    const avisList = await prisma.avis.findMany({
      where: { sujetUtilisateurId: id, supprimeLe: null },
      include: {
        auteur: { include: { profil: true } },
        bail: {
          include: {
            espaceLocatif: {
              include: {
                bienImmobilier: { include: { ville: true } },
              },
            },
          },
        },
        piecesJointes: { where: { supprimeLe: null } },
        contestations: {
          include: { piecesJointes: true },
        },
      },
      orderBy: { publieLe: 'desc' },
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const avisFormates = avisList.map((a) => {
      const normUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
      };

      const bien = a.bail?.espaceLocatif?.bienImmobilier;
      const contestation = a.contestations[0] || null;

      return {
        id: a.id,
        note: Number(a.note) || 5,
        commentaire: a.commentaire,
        regularitePaiement: a.regularitePaiement,
        publieLe: a.publieLe,
        dejaConteste: a.contestations.length > 0,
        bailleur: {
          initials: `${a.auteur?.profil?.prenom?.[0] || ''}${a.auteur?.profil?.nom?.[0] || ''}`.toUpperCase() || 'B',
        },
        bien: bien ? {
          type: bien.type,
          adresse: bien.adresse,
          ville: bien.ville?.nom || null,
          location: bien.ville?.nom ? `${bien.adresse}, ${bien.ville.nom}` : bien.adresse,
        } : null,
        piecesJointes: a.piecesJointes.map((p: any) => ({
          id: p.id,
          url: normUrl(p.urlFichier),
          nom: p.nomFichier,
        })),
        contestation: contestation ? {
          id: contestation.id,
          raison: contestation.raison,
          creeLe: contestation.soumisLe,
          piecesJointes: contestation.piecesJointes.map((p: any) => ({
            id: p.id,
            url: normUrl(p.urlFichier),
            nom: p.nomFichier,
          })),
        } : null,
      };
    });

    res.status(200).json({ avis: avisFormates });
  } catch (error: any) {
    console.error('Erreur avis public locataire :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}

// ─── GET /api/public/locataires/:id/historique ─────────────────────────────
export async function obtenirHistoriqueLocataire(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const locataireExiste = await prisma.utilisateur.findFirst({
      where: { id, supprimeLe: null, roles: { some: { role: { code: 'LOCATAIRE' } } } },
    });
    if (!locataireExiste) {
      res.status(404).json({ message: 'Locataire introuvable.' });
      return;
    }

    const baux = await prisma.bail.findMany({
      where: { locataireUtilisateurId: id, supprimeLe: null },
      include: {
        espaceLocatif: { include: { bienImmobilier: { include: { ville: true } } } },
        demandesLiaison: { orderBy: { creeLe: 'desc' }, take: 1 },
      },
      orderBy: { commenceLe: 'desc' },
    });

    const historique = baux.map((b) => {
      const bien = b.espaceLocatif?.bienImmobilier;
      const ville = bien?.ville?.nom || '';
      const location = ville ? `${bien?.adresse || ''}, ${ville}` : (bien?.adresse || 'Côte d\'Ivoire');

      const debut = new Date(b.commenceLe).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      const fin = b.termineLe
        ? new Date(b.termineLe).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        : 'Présent';
      const date = `${debut} - ${fin}`;

      const derniereDemande = b.demandesLiaison[0];
      let relation = 'Non vérifiée';
      if (derniereDemande?.statut === 'valide') relation = 'Vérifiée';
      else if (derniereDemande?.statut === 'refuse') relation = 'Refusée';
      else if (derniereDemande?.statut === 'en_attente') relation = 'En attente';

      return {
        id: b.id,
        location,
        date,
        relation,
        actif: !b.termineLe,
      };
    });

    res.status(200).json({ historique });
  } catch (error: any) {
    console.error('Erreur historique locataire :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}
