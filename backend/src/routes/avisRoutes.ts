import { Router } from 'express';
import { creerAvis, obtenirMesAvisLocataire, obtenirMesAvisBailleur, contesterAvis, upload } from '../controllers/avisController';
import { exigerAuth, exigerRole } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/avis — Créer/mettre à jour un avis (bailleur), accepte des pièces jointes
router.post('/', exigerAuth, exigerRole('BAILLEUR'), upload.array('piecesJointes', 5), creerAvis);

// GET /api/avis/mes-avis-locataire — Avis reçus par le locataire
router.get('/mes-avis-locataire', exigerAuth, exigerRole('LOCATAIRE'), obtenirMesAvisLocataire);

// GET /api/avis/mes-avis-bailleur — Avis émis par le bailleur
router.get('/mes-avis-bailleur', exigerAuth, exigerRole('BAILLEUR'), obtenirMesAvisBailleur);

// POST /api/avis/:avisId/contester — Contester un avis (locataire), accepte des pièces jointes
router.post('/:avisId/contester', exigerAuth, exigerRole('LOCATAIRE'), upload.array('piecesJointes', 5), contesterAvis);

export default router;
