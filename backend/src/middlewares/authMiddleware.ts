import { Request, Response, NextFunction } from 'express';
import { verifierToken, TokenPayload } from '../utils/jwt';

export interface RequeteAuthentifiee extends Request {
  utilisateur?: TokenPayload;
  files?: any;
}

export function exigerAuth(req: RequeteAuthentifiee, res: Response, next: NextFunction): void {
  const headerAuth = req.headers.authorization;

  if (!headerAuth || !headerAuth.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
    return;
  }

  const token = headerAuth.split(' ')[1];

  try {
    const payload = verifierToken(token);
    req.utilisateur = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide ou expiré.' });
    return;
  }
}

export function exigerRole(...rolesAutorises: string[]) {
  return (req: RequeteAuthentifiee, res: Response, next: NextFunction): void => {
    if (!req.utilisateur) {
      res.status(401).json({ message: 'Accès non autorisé.' });
      return;
    }

    const aRoleSuperpose = req.utilisateur.roles.some((role) =>
      rolesAutorises.includes(role)
    );

    if (!aRoleSuperpose) {
      res.status(403).json({
        message: `Accès interdit. Rôle(s) requis : ${rolesAutorises.join(', ')}`,
      });
      return;
    }

    next();
  };
}
