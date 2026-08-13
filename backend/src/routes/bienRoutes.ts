import { Router } from 'express';
import { creerBien, obtenirMesBiens, assignerLocataire, modifierBien } from '../controllers/bienController';
import { exigerAuth, exigerRole } from '../middlewares/authMiddleware';
import { upload } from '../controllers/avisController';

const router = Router();

// Créer un bien immobilier (réservé aux bailleurs)
router.post('/', exigerAuth, exigerRole('BAILLEUR'), upload.single('photo'), creerBien);

// Modifier un bien immobilier (réservé aux bailleurs)
router.put('/:id', exigerAuth, exigerRole('BAILLEUR'), upload.single('photo'), modifierBien);

// Récupérer les biens du bailleur connecté
router.get('/mes-biens', exigerAuth, exigerRole('BAILLEUR'), obtenirMesBiens);

// Assigner un locataire à un bien (réservé aux bailleurs)
router.post('/assigner-locataire', exigerAuth, exigerRole('BAILLEUR'), assignerLocataire);

export default router;
