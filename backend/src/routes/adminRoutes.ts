import { Router } from 'express';
import { exigerAuth, exigerRole } from '../middlewares/authMiddleware';
import {
  obtenirStatsGlobales,
  creerBailleurParAdmin,
  obtenirBailleursAdmin,
  basculerStatutBailleur,
  obtenirLocatairesAdmin,
  obtenirBiensAdmin,
  obtenirContestationsAdmin,
  arbitrerContestationAdmin,
} from '../controllers/adminController';

const router = Router();

// Toutes les routes admin nécessitent l'authentification ET le rôle ADMIN
router.use(exigerAuth, exigerRole('ADMIN'));

// Dashboard stats
router.get('/stats', obtenirStatsGlobales);

// Bailleurs
router.post('/bailleurs', creerBailleurParAdmin);
router.get('/bailleurs', obtenirBailleursAdmin);
router.put('/bailleurs/:id/statut', basculerStatutBailleur);

// Locataires & Biens
router.get('/locataires', obtenirLocatairesAdmin);
router.get('/biens', obtenirBiensAdmin);

// Modération
router.get('/contestations', obtenirContestationsAdmin);
router.post('/contestations/:id/arbitrer', arbitrerContestationAdmin);

export default router;
