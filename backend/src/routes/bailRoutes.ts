import { Router } from 'express';
import { assignerLocataire, obtenirMesDemandes, repondreDemande, obtenirMonBienActuel } from '../controllers/bailController';
import { exigerAuth, exigerRole } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/bails/assigner — Bailleur assigne un locataire + crée bail + demande de liaison
router.post('/assigner', exigerAuth, exigerRole('BAILLEUR'), assignerLocataire);

// GET /api/bails/mes-demandes — Locataire voit ses demandes de liaison en attente
router.get('/mes-demandes', exigerAuth, exigerRole('LOCATAIRE'), obtenirMesDemandes);

// POST /api/bails/repondre-demande — Locataire valide ou refuse une demande
router.post('/repondre-demande', exigerAuth, exigerRole('LOCATAIRE'), repondreDemande);

// GET /api/bails/mon-bien-actuel — Locataire voit son bien actuel
router.get('/mon-bien-actuel', exigerAuth, exigerRole('LOCATAIRE'), obtenirMonBienActuel);

export default router;
