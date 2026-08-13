import { Response } from 'express';
import { Request } from 'express';
import prisma from '../utils/prisma';
import { RequeteAuthentifiee } from '../middlewares/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Multer setup for file uploads ─────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Helper: ensure XOF devise exists ──────────────────────────────────────
async function ensureDevise(code: string = 'XOF') {
  await prisma.devise.upsert({
    where: { code },
    update: {},
    create: { code, libelle: 'Franc CFA', symbole: 'FCFA', estActif: true },
  });
}

// ─── Helper: find or create EspaceLocatif for a bien ──────────────────────
async function getOrCreateEspace(bienId: string, loyer: number, devise: string) {
  const existing = await prisma.espaceLocatif.findFirst({
    where: { bienImmobilierId: bienId, supprimeLe: null },
  });
  if (existing) return existing;

  const bien = await prisma.bienImmobilier.findUnique({ where: { id: bienId } });
  return prisma.espaceLocatif.create({
    data: {
      bienImmobilierId: bienId,
      libelle: bien?.nom ?? 'Logement',
      type: bien?.type ?? 'Appartement',
      prixParMois: loyer,
      codeDevise: devise,
    },
  });
}

// Types de biens a occupation unique (un seul locataire a la fois)
const TYPES_BIEN_UNIQUE = ['villa', 'appartement', 'studio', 'maison', 'duplex', 'chambre', 'bureau', 'boutique', 'residence'];

function estBienTypeUnique(type: string): boolean {
  return TYPES_BIEN_UNIQUE.some(t => type.toLowerCase().includes(t));
}

// ─── POST /api/bails/assigner ───────────────────────────────────────────────
export async function assignerLocataire(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    if (!bailleurId) { res.status(401).json({ message: 'Non authentifie.' }); return; }

    const { bienId, locataireId, prixParMois } = req.body;
    if (!bienId || !locataireId) {
      res.status(400).json({ message: 'bienId et locataireId sont obligatoires.' });
      return;
    }

    // Verifier que le bien appartient au bailleur
    const bien = await prisma.bienImmobilier.findFirst({
      where: { id: bienId, bailleurUtilisateurId: bailleurId },
    });
    if (!bien) { res.status(404).json({ message: 'Bien introuvable.' }); return; }

    // Verifier que le locataire existe
    const locataire = await prisma.utilisateur.findFirst({
      where: { id: locataireId, roles: { some: { role: { code: 'LOCATAIRE' } } } },
      include: { profil: true },
    });
    if (!locataire) { res.status(404).json({ message: 'Locataire introuvable.' }); return; }

    // Regle 1: Le locataire ne peut pas avoir de bail actif chez un autre bailleur
    const bailActifAilleurs = await prisma.bail.findFirst({
      where: {
        locataireUtilisateurId: locataireId,
        termineLe: null,
        supprimeLe: null,
        NOT: { bailleurUtilisateurId: bailleurId },
      },
      include: {
        espaceLocatif: { include: { bienImmobilier: true } },
      },
    });
    if (bailActifAilleurs) {
      const nomBien = bailActifAilleurs.espaceLocatif.bienImmobilier.nom;
      const adresse = bailActifAilleurs.espaceLocatif.bienImmobilier.adresse;
      res.status(409).json({
        code: 'LOCATAIRE_DEJA_ACTIF',
        message: `Ce locataire occupe deja le bien "${nomBien}" (${adresse}). Un locataire ne peut pas avoir deux baux actifs simultanement.`,
      });
      return;
    }

    // Regle 2: Pour les biens a occupation unique, verifier que l'espace n'est pas deja occupe par un autre locataire
    if (estBienTypeUnique(bien.type)) {
      const espaceExistant = await prisma.espaceLocatif.findFirst({
        where: { bienImmobilierId: bienId, supprimeLe: null },
        include: {
          baux: {
            where: {
              termineLe: null,
              supprimeLe: null,
              NOT: { locataireUtilisateurId: locataireId },
            },
            include: { locataire: { include: { profil: true } } },
          },
        },
      });
      if (espaceExistant && espaceExistant.baux.length > 0) {
        const locActuel = espaceExistant.baux[0].locataire;
        const nomOccupant = `${locActuel.profil?.prenom || ''} ${locActuel.profil?.nom || ''}`.trim() || locActuel.email || 'un autre locataire';
        res.status(409).json({
          code: 'ESPACE_DEJA_OCCUPE',
          message: `Ce bien est deja occupe par ${nomOccupant}. Cloturez son bail avant d'assigner un nouveau locataire.`,
        });
        return;
      }
    }

    await ensureDevise('XOF');
    const loyer = parseFloat(String(prixParMois ?? '0').replace(/[^\d.]/g, '')) || 0;
    const espace = await getOrCreateEspace(bienId, loyer, 'XOF');

    // Clore les baux actifs du meme bailleur pour ce locataire sur cet espace
    await prisma.bail.updateMany({
      where: { locataireUtilisateurId: locataireId, espaceLocatifId: espace.id, termineLe: null },
      data: { termineLe: new Date() },
    });

    // Creer le nouveau bail
    const bail = await prisma.bail.create({
      data: {
        espaceLocatifId: espace.id,
        locataireUtilisateurId: locataireId,
        bailleurUtilisateurId: bailleurId,
        commenceLe: new Date(),
        loyerMensuel: loyer,
        codeDevise: 'XOF',
        statutVerification: 'non_verifie',
      },
    });

    // Creer la demande de liaison (expiration dans 30 jours)
    const expireLe = new Date();
    expireLe.setDate(expireLe.getDate() + 30);

    const demande = await prisma.demandeLiaison.create({
      data: {
        bailleurUtilisateurId: bailleurId,
        locataireUtilisateurId: locataireId,
        bailId: bail.id,
        statut: locataire.estReclame ? 'en_attente' : 'valide',
        expireLe,
        message: `Le bailleur vous a assigne au bien "${bien.nom}". Veuillez confirmer cette relation.`,
      },
    });

    res.status(201).json({
      message: 'Locataire assigne avec succes. Bail et demande de liaison crees.',
      bail: { id: bail.id, commenceLe: bail.commenceLe },
      demandeLiaison: { id: demande.id, statut: demande.statut },
    });
  } catch (error: any) {
    console.error('[assignerLocataire] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// ─── GET /api/bails/mes-demandes (locataire) ───────────────────────────────
// Retourne toutes les demandes de liaison pour le locataire connecte
export async function obtenirMesDemandes(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const locataireId = req.utilisateur?.id;
    if (!locataireId) { res.status(401).json({ message: 'Non authentifie.' }); return; }

    const demandes = await prisma.demandeLiaison.findMany({
      where: { locataireUtilisateurId: locataireId },
      include: {
        bailleur: { include: { profil: true } },
        bail: { include: { espaceLocatif: { include: { bienImmobilier: true } } } },
      },
      orderBy: { creeLe: 'desc' },
    });

    const formatted = demandes.map(d => ({
      id: d.id,
      statut: d.statut,
      message: d.message,
      expireLe: d.expireLe,
      creeLe: d.creeLe,
      bailleur: {
        id: d.bailleur.id,
        nom: `${d.bailleur.profil?.prenom || ''} ${d.bailleur.profil?.nom || ''}`.trim() || d.bailleur.email,
      },
      bien: d.bail.espaceLocatif.bienImmobilier.nom,
      adresse: d.bail.espaceLocatif.bienImmobilier.adresse,
    }));

    res.status(200).json({ demandes: formatted });
  } catch (error: any) {
    console.error('[obtenirMesDemandes] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// ─── POST /api/bails/repondre-demande ─────────────────────────────────────
export async function repondreDemande(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const locataireId = req.utilisateur?.id;
    if (!locataireId) { res.status(401).json({ message: 'Non authentifie.' }); return; }

    const { demandeId, accepter } = req.body;
    if (!demandeId || accepter === undefined) {
      res.status(400).json({ message: 'demandeId et accepter sont obligatoires.' });
      return;
    }

    const demande = await prisma.demandeLiaison.findFirst({
      where: { id: demandeId, locataireUtilisateurId: locataireId },
    });
    if (!demande) { res.status(404).json({ message: 'Demande introuvable.' }); return; }

    const nouveauStatut = accepter ? 'valide' : 'refuse';

    await prisma.demandeLiaison.update({
      where: { id: demandeId },
      data: { statut: nouveauStatut, reponduLe: new Date() },
    });

    // Si refus, terminer le bail associe
    if (!accepter) {
      await prisma.bail.update({
        where: { id: demande.bailId },
        data: { termineLe: new Date() },
      });
    } else {
      // Marquer le bail comme verifie par le locataire
      await prisma.bail.update({
        where: { id: demande.bailId },
        data: { statutVerification: 'verifie', verifieParLocataireLe: new Date() },
      });
    }

    res.status(200).json({ message: accepter ? 'Relation validee.' : 'Relation refusee.' });
  } catch (error: any) {
    console.error('[repondreDemande] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}

// ─── GET /api/bails/mon-bien-actuel (locataire) ────────────────────────────
export async function obtenirMonBienActuel(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const locataireId = req.utilisateur?.id;
    if (!locataireId) { res.status(401).json({ message: 'Non authentifie.' }); return; }

    const bail = await prisma.bail.findFirst({
      where: { locataireUtilisateurId: locataireId, termineLe: null, supprimeLe: null },
      include: {
        espaceLocatif: { include: { bienImmobilier: { include: { ville: true } } } },
        bailleur: { include: { profil: true } },
      },
      orderBy: { commenceLe: 'desc' },
    });

    if (bail) {
      const b = bail.espaceLocatif.bienImmobilier;
      res.status(200).json({
        bienActuel: {
          nom: b.nom,
          type: b.type,
          adresse: `${b.adresse}, ${b.ville.nom}`,
          loyer: `${Math.round(Number(bail.loyerMensuel)).toLocaleString('fr-FR')} ${bail.codeDevise}`,
          bailleur: `${bail.bailleur.profil?.prenom || ''} ${bail.bailleur.profil?.nom || ''}`.trim() || bail.bailleur.email,
          statut: bail.statutVerification === 'verifie' ? 'Actif' : 'En attente de validation',
          commenceLe: bail.commenceLe,
        },
      });
      return;
    }

    res.status(200).json({ bienActuel: null });
  } catch (error: any) {
    console.error('[obtenirMonBienActuel] Erreur :', error);
    res.status(500).json({ message: `Erreur serveur : ${error.message}` });
  }
}
