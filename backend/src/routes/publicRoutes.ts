import { Router } from 'express';
import {
  rechercherLocatairesPublic,
  obtenirProfilPublicLocataire,
  obtenirAvisPublicLocataire,
  obtenirHistoriqueLocataire,
} from '../controllers/publicController';

const router = Router();

// GET /api/public/locataires?q=terme&page=1&limit=20
router.get('/locataires', rechercherLocatairesPublic);

// GET /api/public/locataires/:id
router.get('/locataires/:id', obtenirProfilPublicLocataire);

// GET /api/public/locataires/:id/avis
router.get('/locataires/:id/avis', obtenirAvisPublicLocataire);

// GET /api/public/locataires/:id/historique
router.get('/locataires/:id/historique', obtenirHistoriqueLocataire);

export default router;
