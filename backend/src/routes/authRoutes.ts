import { Router } from 'express';
import { inscription, connexion, obtenirProfilConnecte } from '../controllers/authController';
import { exigerAuth } from '../middlewares/authMiddleware';

const router = Router();

// Routes publiques
router.post('/register', inscription);
router.post('/login', connexion);

// Route protégée
router.get('/me', exigerAuth, obtenirProfilConnecte);

export default router;
