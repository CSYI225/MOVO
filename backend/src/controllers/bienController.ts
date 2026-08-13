import { Response } from 'express';
import prisma from '../utils/prisma';
import { RequeteAuthentifiee } from '../middlewares/authMiddleware';

// POST /api/biens
// Crée un bien immobilier pour le bailleur connecté
export async function creerBien(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    if (!bailleurId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    const { nom, type, adresse, ville, prixParMois, codeDevise, nombrePieces, photo: photoBody } = req.body;

    let photoUrl: string | null = null;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      photoUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else if (photoBody) {
      photoUrl = photoBody;
    }

    if (!nom || !type || !adresse) {
      res.status(400).json({ message: 'Le nom, le type et l\'adresse sont obligatoires.' });
      return;
    }

    const villeNom = ville || 'Abidjan';

    // Chercher ou créer la ville via Prisma
    let villeRecord = await prisma.ville.findFirst({
      where: { nom: { equals: villeNom, mode: 'insensitive' } },
    });

    if (!villeRecord) {
      villeRecord = await prisma.ville.create({
        data: {
          nom: villeNom,
          codePays: 'CI',
          estActif: true,
        },
      });
    }

    const villeId = villeRecord.id;

    // S'assurer que la devise existe
    const deviseCode = codeDevise || 'XOF';
    await prisma.devise.upsert({
      where: { code: deviseCode },
      update: {},
      create: {
        code: deviseCode,
        libelle: 'Franc CFA',
        symbole: 'FCFA',
        estActif: true,
      },
    });

    // Créer le bien immobilier
    const bien = await prisma.bienImmobilier.create({
      data: {
        nom,
        type,
        adresse,
        villeId,
        bailleurUtilisateurId: bailleurId,
        photo: photoUrl,
        nombrePieces: nombrePieces ? parseInt(nombrePieces.toString(), 10) : null,
      },
    });

    // Si ce n'est pas un immeuble, créer un espace locatif unique
    if (type !== 'Immeuble' && prixParMois) {
      const prixNum = parseFloat(prixParMois.toString().replace(/[^\d.]/g, '')) || 0;
      await prisma.espaceLocatif.create({
        data: {
          bienImmobilierId: bien.id,
          libelle: nom,
          type,
          prixParMois: prixNum,
          codeDevise: deviseCode,
        },
      });
    }

    res.status(201).json({
      message: 'Bien immobilier créé avec succès.',
      bien: {
        id: bien.id,
        nom: bien.nom,
        type: bien.type,
        adresse: bien.adresse,
        ville: villeNom,
        photo: bien.photo,
        rooms: bien.nombrePieces || undefined,
        nombrePieces: bien.nombrePieces || undefined,
        creeLe: bien.creeLe,
      },
    });
  } catch (error: any) {
    console.error('Erreur création bien :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du bien.' });
  }
}

// GET /api/biens/mes-biens
// Récupère tous les biens du bailleur connecté
export async function obtenirMesBiens(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    if (!bailleurId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    const biens = await prisma.bienImmobilier.findMany({
      where: {
        bailleurUtilisateurId: bailleurId,
        supprimeLe: null,
      },
      include: {
        ville: true,
        espacesLocatifs: {
          where: { supprimeLe: null },
          include: {
            baux: {
              where: { supprimeLe: null, termineLe: null },
              include: {
                locataire: {
                  include: { profil: true },
                },
              },
            },
          },
        },
      },
      orderBy: { creeLe: 'desc' },
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const biensFormates = biens.map((b) => {
      const totalEspaces = b.espacesLocatifs.length;
      const espacesOccupes = b.espacesLocatifs.filter((e) => e.baux.length > 0).length;
      const locataires = b.espacesLocatifs.flatMap((e) =>
        e.baux.map((bail) => ({
          id: bail.locataire.id,
          nom: bail.locataire.profil?.nom,
          prenom: bail.locataire.profil?.prenom,
          email: bail.locataire.email,
        }))
      );

      let statut = 'Vacant';
      if (totalEspaces > 0) {
        if (espacesOccupes === totalEspaces) statut = 'Occupé';
        else if (espacesOccupes > 0) statut = 'Partiellement occupé';
      }

      const premierEspace = b.espacesLocatifs[0];
      const prixParMois = premierEspace?.prixParMois;
      const codeDevise = premierEspace?.codeDevise;

      let photoFormatted = b.photo;
      if (photoFormatted && !photoFormatted.startsWith('http')) {
        photoFormatted = `${baseUrl}${photoFormatted.startsWith('/') ? '' : '/'}${photoFormatted}`;
      }

      return {
        id: b.id,
        name: b.nom,
        type: b.type,
        location: `${b.adresse}, ${b.ville.nom}`,
        adresse: b.adresse,
        ville: b.ville.nom,
        status: statut,
        photo: photoFormatted,
        image: photoFormatted,
        rooms: b.nombrePieces || undefined,
        nombrePieces: b.nombrePieces || undefined,
        price: prixParMois ? `${Math.round(Number(prixParMois)).toLocaleString('fr-FR')} ${codeDevise || 'FCFA'}` : null,
        occupants: locataires.length,
        units: b.type === 'Immeuble' ? b.espacesLocatifs.length : undefined,
        currentTenants: locataires.map(l => l.id),
        creeLe: b.creeLe,
      };
    });

    res.status(200).json({ biens: biensFormates });
  } catch (error: any) {
    console.error('Erreur récupération biens :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des biens.' });
  }
}

// POST /api/biens/assigner-locataire
export async function assignerLocataire(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    if (!bailleurId) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    const { bienId, locataireId, prixParMois } = req.body;

    if (!bienId || !locataireId) {
      res.status(400).json({ message: 'Le bien et le locataire sont obligatoires.' });
      return;
    }

    const bien = await prisma.bienImmobilier.findUnique({
      where: { id: bienId },
      include: { espacesLocatifs: true },
    });

    if (!bien) {
      res.status(404).json({ message: 'Bien immobilier introuvable.' });
      return;
    }

    let espaceId = bien.espacesLocatifs[0]?.id;
    if (!espaceId) {
      const nouvelEspace = await prisma.espaceLocatif.create({
        data: {
          bienImmobilierId: bien.id,
          libelle: bien.nom,
          type: bien.type,
          prixParMois: parseFloat((prixParMois || '0').toString().replace(/[^\d.]/g, '')) || 0,
          codeDevise: 'XOF',
        },
      });
      espaceId = nouvelEspace.id;
    }

    // Terminer d'anciens baux s'il y en a
    await prisma.bail.updateMany({
      where: { locataireUtilisateurId: locataireId, termineLe: null },
      data: { termineLe: new Date() },
    });

    // S'assurer que la devise XOF existe
    await prisma.devise.upsert({
      where: { code: 'XOF' },
      update: {},
      create: { code: 'XOF', libelle: 'Franc CFA', symbole: 'FCFA', estActif: true },
    });

    // Créer le nouveau bail
    const nouveauBail = await prisma.bail.create({
      data: {
        espaceLocatifId: espaceId,
        locataireUtilisateurId: locataireId,
        bailleurUtilisateurId: bailleurId,
        commenceLe: new Date(),
        loyerMensuel: parseFloat((prixParMois || '0').toString().replace(/[^\d.]/g, '')) || 0,
        codeDevise: 'XOF',
        statutVerification: 'verifie',
      },
    });

    res.status(201).json({
      message: 'Locataire assigné au bien avec succès.',
      bail: nouveauBail,
    });
  } catch (error: any) {
    console.error('Erreur assignation locataire :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'assignation du locataire.' });
  }
}

// PUT /api/biens/:id
export async function modifierBien(
  req: RequeteAuthentifiee,
  res: Response
): Promise<void> {
  try {
    const bailleurId = req.utilisateur?.id;
    const bienId = req.params.id as string;
    if (!bailleurId || !bienId) {
      res.status(401).json({ message: 'Non authentifié ou identifiant invalide.' });
      return;
    }

    const { nom, type, adresse, ville, prixParMois, codeDevise, nombrePieces, photo: photoBody } = req.body;

    const existingBien = await prisma.bienImmobilier.findFirst({
      where: { id: bienId, bailleurUtilisateurId: bailleurId, supprimeLe: null },
      include: { espacesLocatifs: true },
    });

    if (!existingBien) {
      res.status(404).json({ message: 'Bien immobilier introuvable.' });
      return;
    }

    let photoUrl: string | undefined = undefined;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      photoUrl = `${baseUrl}/uploads/${req.file.filename}`;
    } else if (photoBody) {
      photoUrl = photoBody;
    }

    let villeId = existingBien.villeId;
    if (ville) {
      let villeRecord = await prisma.ville.findFirst({
        where: { nom: { equals: ville, mode: 'insensitive' } },
      });
      if (!villeRecord) {
        villeRecord = await prisma.ville.create({
          data: { nom: ville, codePays: 'CI', estActif: true },
        });
      }
      villeId = villeRecord.id;
    }

    const updateData: any = {};
    if (nom) updateData.nom = nom;
    if (type) updateData.type = type;
    if (adresse) updateData.adresse = adresse;
    if (villeId) updateData.villeId = villeId;
    if (photoUrl !== undefined) updateData.photo = photoUrl;
    if (nombrePieces !== undefined) updateData.nombrePieces = nombrePieces ? parseInt(nombrePieces.toString(), 10) : null;

    const bienModifie = await prisma.bienImmobilier.update({
      where: { id: bienId },
      data: updateData,
    });

    if (prixParMois && existingBien.espacesLocatifs.length > 0) {
      const prixNum = parseFloat(prixParMois.toString().replace(/[^\d.]/g, '')) || 0;
      await prisma.espaceLocatif.update({
        where: { id: existingBien.espacesLocatifs[0].id },
        data: {
          prixParMois: prixNum,
          ...(nom && { libelle: nom }),
          ...(type && { type }),
        },
      });
    }

    res.status(200).json({
      message: 'Bien immobilier mis à jour avec succès.',
      bien: bienModifie,
    });
  } catch (error: any) {
    console.error('Erreur modification bien :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification du bien.' });
  }
}
