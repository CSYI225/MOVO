import { Router } from 'express';
import { rechercherLocataires, creerLocataireManuel, changerMotDePasseTemporaire, obtenirMesLocataires, obtenirMonBienActuel, modifierProfilLocataire, retirerLocataireListe } from '../controllers/locataireController';
import { exigerAuth, exigerRole } from '../middlewares/authMiddleware';

const router = Router();

// Recherche globale de locataires (réservée aux bailleurs)
router.get('/recherche', exigerAuth, exigerRole('BAILLEUR'), rechercherLocataires);

// Mes locataires créés (réservée aux bailleurs)
router.get('/mes-locataires', exigerAuth, exigerRole('BAILLEUR'), obtenirMesLocataires);

// Retirer un locataire de sa liste (réservé aux bailleurs)
router.delete('/mes-locataires/:id', exigerAuth, exigerRole('BAILLEUR'), retirerLocataireListe);

// Création manuelle d'un compte locataire (réservée aux bailleurs)
router.post('/creer-manuel', exigerAuth, exigerRole('BAILLEUR'), creerLocataireManuel);

// Changement de mot de passe temporaire (locataire connecté)
router.post('/changer-mdp-temporaire', exigerAuth, changerMotDePasseTemporaire);

// Modifier le profil locataire
router.put('/profil', exigerAuth, exigerRole('LOCATAIRE'), modifierProfilLocataire);

// Obtenir le bien actuellement occupé par le locataire connecté
router.get('/mon-bien-actuel', exigerAuth, exigerRole('LOCATAIRE'), obtenirMonBienActuel);

export default router;
