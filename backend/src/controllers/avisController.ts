import { Response } from 'express';
import prisma from '../utils/prisma';
import { RequeteAuthentifiee } from '../middlewares/authMiddleware';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// ─── Multer setup ───────────────────────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${Buffer.from(file.originalname, 'latin1').toString('utf8')}`);
  },
});
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── POST /api/avis (multipart/form-data) ─────────────────────────────────
export async function creerAvis(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const auteurId = req.utilisateur?.id;
    if (!auteurId) { res.status(401).json({ message: 'Non authentifié.' }); return; }

    const { sujetId, note, commentaire, regularitePaiement, typeAvis } = req.body;

    if (!sujetId || note === undefined || !commentaire || !regularitePaiement) {
      res.status(400).json({ message: 'sujetId, note, commentaire et regularitePaiement sont obligatoires.' });
      return;
    }

    const noteParsed = parseFloat(note);
    if (isNaN(noteParsed) || noteParsed < 1 || noteParsed > 5) {
      res.status(400).json({ message: 'La note doit être entre 1 et 5.' });
      return;
    }

    // Tronquer regularitePaiement à 30 chars
    const regularite = String(regularitePaiement).slice(0, 30);

    const sujet = await prisma.utilisateur.findFirst({
      where: { id: sujetId, roles: { some: { role: { code: 'LOCATAIRE' } } } },
    });
    if (!sujet) { res.status(404).json({ message: 'Locataire introuvable.' }); return; }

    // Chercher l'avis existant de ce bailleur pour ce locataire
    const avisExistant = await prisma.avis.findFirst({
      where: {
        auteurUtilisateurId: auteurId,
        sujetUtilisateurId: sujetId,
        supprimeLe: null,
      },
    });

    // Trouver le bail concerné (même pour un ancien locataire) pour rattacher le bien
    const bailConcerne = await prisma.bail.findFirst({
      where: {
        bailleurUtilisateurId: auteurId,
        locataireUtilisateurId: sujetId,
        supprimeLe: null,
      },
      orderBy: { commenceLe: 'desc' },
    });

    const targetBailId = avisExistant?.bailId || bailConcerne?.id || null;

    let avis;
    if (avisExistant) {
      avis = await prisma.avis.update({
        where: { id: avisExistant.id },
        data: {
          note: noteParsed,
          commentaire,
          regularitePaiement: regularite,
          typeAvis: typeAvis || 'locataire',
          bailId: targetBailId,
        },
        include: { auteur: { include: { profil: true } }, sujet: { include: { profil: true } } },
      });
    } else {
      avis = await prisma.avis.create({
        data: {
          auteurUtilisateurId: auteurId,
          sujetUtilisateurId: sujetId,
          bailId: targetBailId,
          note: noteParsed,
          commentaire,
          regularitePaiement: regularite,
          typeAvis: typeAvis || 'locataire',
        },
        include: { auteur: { include: { profil: true } }, sujet: { include: { profil: true } } },
      });
    }

    // Traiter les fichiers joints (sans créer de doublons)
    const files = req.files as any[] | undefined;
    if (files && files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      for (const file of files) {
        const existant = await prisma.pieceJointeAvis.findFirst({
          where: { avisId: avis.id, nomFichier: file.originalname, supprimeLe: null },
        });
        if (!existant) {
          await prisma.pieceJointeAvis.create({
            data: {
              avisId: avis.id,
              urlFichier: `${baseUrl}/uploads/${file.filename}`,
              nomFichier: file.originalname,
              typeFichier: file.mimetype.includes('pdf') ? 'pdf' : 'image',
            },
          });
        }
      }
    }

    res.status(201).json({
      message: avisExistant ? 'Avis mis à jour.' : 'Avis publié avec succès.',
      avis: {
        id: avis.id,
        note: Number(avis.note),
        commentaire: avis.commentaire,
        regularitePaiement: avis.regularitePaiement,
        typeAvis: avis.typeAvis,
        publieLe: avis.publieLe,
        auteur: { id: avis.auteur.id, nom: avis.auteur.profil?.nom, prenom: avis.auteur.profil?.prenom },
        sujet: { id: avis.sujet.id, nom: avis.sujet.profil?.nom, prenom: avis.sujet.profil?.prenom },
      },
    });
  } catch (error: any) {
    console.error('[creerAvis] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// ─── GET /api/avis/mes-avis-locataire ─────────────────────────────────────
export async function obtenirMesAvisLocataire(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const locataireId = req.utilisateur?.id;
    if (!locataireId) { res.status(401).json({ message: 'Non authentifié.' }); return; }

    const avis = await prisma.avis.findMany({
      where: { sujetUtilisateurId: locataireId, supprimeLe: null },
      include: {
        auteur: { include: { profil: true } },
        piecesJointes: true,
        contestations: {
          where: { plaignantUtilisateurId: locataireId },
          include: { piecesJointes: true },
        },
        bail: {
          include: {
            espaceLocatif: {
              include: { bienImmobilier: { include: { ville: true } } },
            },
          },
        },
      },
      orderBy: { publieLe: 'desc' },
    });

    // Récupérer le bail le plus récent (actif ou terminé) du locataire comme fallback
    const dernierBailLocataire = await prisma.bail.findFirst({
      where: { locataireUtilisateurId: locataireId, supprimeLe: null },
      include: {
        espaceLocatif: {
          include: { bienImmobilier: { include: { ville: true } } },
        },
      },
      orderBy: { commenceLe: 'desc' },
    });

    const formatted = avis.map(a => {
      // Essayer d'abord le bail lié à l'avis, sinon le dernier bail (même terminé)
      const bailSource = a.bail ?? dernierBailLocataire;
      const bien = bailSource?.espaceLocatif?.bienImmobilier;
      const dejaConteste = a.contestations.length > 0;
      const contestationRecente = a.contestations[0];

      return {
        id: a.id,
        note: Number(a.note),
        commentaire: a.commentaire,
        regularitePaiement: a.regularitePaiement,
        typeAvis: a.typeAvis,
        publieLe: a.publieLe,
        dejaConteste,
        raisonContestation: contestationRecente?.raison || null,
        piecesJointesContestation: contestationRecente?.piecesJointes.map(pj => ({
          id: pj.id,
          url: pj.urlFichier,
          nom: pj.nomFichier,
        })) || [],
        bailleur: {
          id: a.auteur.id,
          nom: a.auteur.profil?.nom,
          prenom: a.auteur.profil?.prenom,
          email: a.auteur.email,
        },
        bien: bien ? {
          nom: bien.nom,
          type: bien.type,
          adresse: `${bien.adresse}, ${bien.ville?.nom ?? ''}`,
          loyer: bailSource ? `${Math.round(Number(bailSource.loyerMensuel)).toLocaleString('fr-FR')} ${bailSource.codeDevise}` : null,
        } : null,
        piecesJointes: a.piecesJointes.map(pj => ({
          id: pj.id,
          url: pj.urlFichier,
          nom: pj.nomFichier,
          type: pj.typeFichier,
        })),
      };
    });

    res.status(200).json({ avis: formatted });
  } catch (error: any) {
    console.error('[obtenirMesAvisLocataire] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// ─── GET /api/avis/mes-avis-bailleur ─────────────────────────────────────
export async function obtenirMesAvisBailleur(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    if (!bailleurId) { res.status(401).json({ message: 'Non authentifié.' }); return; }

    const avis = await prisma.avis.findMany({
      where: { auteurUtilisateurId: bailleurId, supprimeLe: null },
      include: {
        sujet: { include: { profil: true } },
        piecesJointes: { where: { supprimeLe: null } },
        contestations: {
          include: { piecesJointes: true },
          orderBy: { soumisLe: 'desc' },
        },
        bail: {
          include: {
            espaceLocatif: {
              include: { bienImmobilier: { include: { ville: true } } },
            },
          },
        },
      },
      orderBy: { publieLe: 'desc' },
    });

    const formatted = avis.map(a => {
      const contestationRecente = a.contestations[0] || null;
      const espace = a.bail?.espaceLocatif;
      const bien = espace?.bienImmobilier;
      const prixLoyerNum = espace?.prixParMois || a.bail?.loyerMensuel;
      const dev = espace?.codeDevise || a.bail?.codeDevise || 'FCFA';
      const loyerFormate = prixLoyerNum ? `${Math.round(Number(prixLoyerNum)).toLocaleString('fr-FR')} ${dev}` : null;

      return {
        id: a.id,
        note: Number(a.note),
        commentaire: a.commentaire,
        regularitePaiement: a.regularitePaiement,
        typeAvis: a.typeAvis,
        publieLe: a.publieLe,
        tenantId: a.sujet.id,
        tenantName: `${a.sujet.profil?.prenom || ''} ${a.sujet.profil?.nom || ''}`.trim() || a.sujet.email,
        tenantEmail: a.sujet.email,
        locataire: { id: a.sujet.id, nom: a.sujet.profil?.nom, prenom: a.sujet.profil?.prenom, email: a.sujet.email },
        propertyName: bien?.nom || null,
        propertyType: bien?.type || null,
        price: loyerFormate,
        bien: bien ? {
          nom: bien.nom,
          type: bien.type,
          adresse: `${bien.adresse}, ${bien.ville?.nom ?? ''}`,
          loyer: loyerFormate || 'Non spécifié',
        } : null,
        piecesJointes: a.piecesJointes.map(pj => ({ id: pj.id, url: pj.urlFichier, nom: pj.nomFichier, name: pj.nomFichier, type: pj.typeFichier })),
        attachments: a.piecesJointes.map(pj => ({ id: pj.id, url: pj.urlFichier, nom: pj.nomFichier, name: pj.nomFichier, type: pj.typeFichier })),
        hasContestation: a.contestations.length > 0,
        tenantResponse: contestationRecente?.raison || null,
        contestationPiecesJointes: contestationRecente?.piecesJointes.map(pj => ({
          id: pj.id,
          nomFichier: pj.nomFichier,
          urlFichier: pj.urlFichier,
          typeFichier: pj.nomFichier?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
        })) || [],
      };
    });

    res.status(200).json({ avis: formatted });
  } catch (error: any) {
    console.error('[obtenirMesAvisBailleur] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// ─── POST /api/avis/:avisId/contester ─────────────────────────────────────
export async function contesterAvis(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const locataireId = req.utilisateur?.id;
    if (!locataireId) { res.status(401).json({ message: 'Non authentifié.' }); return; }

    const avisIdParam = req.params.avisId;
    const avisIdStr = Array.isArray(avisIdParam) ? avisIdParam[0] : avisIdParam;
    const { raison } = req.body;

    if (!raison) { res.status(400).json({ message: 'La raison est obligatoire.' }); return; }

    const avis = await prisma.avis.findFirst({
      where: { id: avisIdStr, sujetUtilisateurId: locataireId, supprimeLe: null },
    });
    if (!avis) { res.status(404).json({ message: 'Avis introuvable.' }); return; }

    const dejaConteste = await prisma.contestation.findFirst({
      where: { avisId: avisIdStr, plaignantUtilisateurId: locataireId },
    });

    let contestation;
    if (dejaConteste) {
      contestation = await prisma.contestation.update({
        where: { id: dejaConteste.id },
        data: { raison, soumisLe: new Date() },
      });
    } else {
      contestation = await prisma.contestation.create({
        data: { avisId: avisIdStr, plaignantUtilisateurId: locataireId, raison },
      });
    }

    // Traiter fichiers joints (déduplication par nom de fichier)
    const files = req.files as any[] | undefined;
    if (files && files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      for (const file of files) {
        const existant = await prisma.pieceJointeContestation.findFirst({
          where: { contestationId: contestation.id, nomFichier: file.originalname },
        });
        if (!existant) {
          await prisma.pieceJointeContestation.create({
            data: {
              contestationId: contestation.id,
              urlFichier: `${baseUrl}/uploads/${file.filename}`,
              nomFichier: file.originalname,
            },
          });
        }
      }
    }

    res.status(200).json({
      message: dejaConteste ? 'Contestation modifiée avec succès.' : 'Contestation soumise avec succès.',
      contestation: { id: contestation.id },
    });
  } catch (error: any) {
    console.error('[contesterAvis] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}
