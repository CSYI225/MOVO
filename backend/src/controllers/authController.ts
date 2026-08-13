import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hacherMotDePasse, mepMotDePasseValide, genererToken } from '../utils/jwt';
import { RequeteAuthentifiee } from '../middlewares/authMiddleware';

export async function inscription(req: Request, res: Response): Promise<void> {
  try {
    const { email, telephone, motDePasse, prenom, nom, roleCode = 'VISITEUR' } = req.body;

    if (!email && !telephone) {
      res.status(400).json({ message: 'Veuillez fournir un email ou un numéro de téléphone.' });
      return;
    }

    if (!motDePasse || motDePasse.length < 6) {
      res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    if (!prenom || !nom) {
      res.status(400).json({ message: 'Le prénom et le nom sont requis.' });
      return;
    }

    // Vérifier l'existence
    if (email) {
      const existantEmail = await prisma.utilisateur.findUnique({ where: { email } });
      if (existantEmail) {
        res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        return;
      }
    }

    if (telephone) {
      const existantTel = await prisma.utilisateur.findUnique({ where: { telephone } });
      if (existantTel) {
        res.status(409).json({ message: 'Ce numéro de téléphone est déjà utilisé.' });
        return;
      }
    }

    const motDePasseHash = await hacherMotDePasse(motDePasse);

    // Récupérer ou créer le rôle
    const codeFormate = roleCode.toUpperCase();
    let role = await prisma.role.findUnique({ where: { code: codeFormate } });
    if (!role) {
      role = await prisma.role.create({
        data: {
          code: codeFormate,
          libelle: codeFormate.charAt(0) + codeFormate.slice(1).toLowerCase(),
        },
      });
    }

    // Créer l'utilisateur avec son profil et son rôle
    const nouvelUtilisateur = await prisma.utilisateur.create({
      data: {
        email: email || null,
        telephone: telephone || null,
        motDePasseHash,
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
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const rolesCodes = nouvelUtilisateur.roles.map((r: any) => r.role.code);

    const token = genererToken({
      id: nouvelUtilisateur.id,
      email: nouvelUtilisateur.email,
      telephone: nouvelUtilisateur.telephone,
      roles: rolesCodes,
    });

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      utilisateur: {
        id: nouvelUtilisateur.id,
        email: nouvelUtilisateur.email,
        telephone: nouvelUtilisateur.telephone,
        prenom: nouvelUtilisateur.profil?.prenom,
        nom: nouvelUtilisateur.profil?.nom,
        roles: rolesCodes,
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de l inscription :', error);
    res.status(500).json({ message: 'Erreur serveur lors de l inscription.' });
  }
}

export async function connexion(req: Request, res: Response): Promise<void> {
  try {
    const { identifiant, motDePasse } = req.body; // identifiant = email ou téléphone

    if (!identifiant || !motDePasse) {
      res.status(400).json({ message: 'Veuillez fournir votre identifiant (email ou téléphone) et mot de passe.' });
      return;
    }

    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        OR: [{ email: identifiant }, { telephone: identifiant }],
      },
      include: {
        profil: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!utilisateur || !utilisateur.motDePasseHash) {
      res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' });
      return;
    }

    if (!utilisateur.estActif) {
      res.status(403).json({ message: 'Ce compte a été désactivé.' });
      return;
    }

    const mdpValide = await mepMotDePasseValide(motDePasse, utilisateur.motDePasseHash);
    if (!mdpValide) {
      res.status(401).json({ message: 'Identifiant ou mot de passe incorrect.' });
      return;
    }

    // Mettre à jour la date de dernière connexion
    await prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { derniereConnexionLe: new Date() },
    });

    const rolesCodes = utilisateur.roles.map((r: any) => r.role.code);

    const token = genererToken({
      id: utilisateur.id,
      email: utilisateur.email,
      telephone: utilisateur.telephone,
      roles: rolesCodes,
    });

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        prenom: utilisateur.profil?.prenom,
        nom: utilisateur.profil?.nom,
        roles: rolesCodes,
        estReclame: utilisateur.estReclame, // false = premier login, mot de passe à changer
      },
    });
  } catch (error: any) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
}

export async function obtenirProfilConnecte(req: RequeteAuthentifiee, res: Response): Promise<void> {
  try {
    if (!req.utilisateur) {
      res.status(401).json({ message: 'Non authentifié.' });
      return;
    }

    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.utilisateur.id },
      include: {
        profil: {
          include: {
            ville: true,
          },
        },
        profilProBailleur: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!utilisateur) {
      res.status(404).json({ message: 'Utilisateur non trouvé.' });
      return;
    }

    const rolesCodes = utilisateur.roles.map((r: any) => r.role.code);

    res.status(200).json({
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        emailVerifie: utilisateur.emailVerifie,
        creeLe: utilisateur.creeLe,
        profil: utilisateur.profil,
        profilProBailleur: utilisateur.profilProBailleur,
        roles: rolesCodes,
      },
    });
  } catch (error: any) {
    console.error('Erreur profil :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil.' });
  }
}
