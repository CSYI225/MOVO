import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();

import authRoutes from './routes/authRoutes';
import locataireRoutes from './routes/locataireRoutes';
import bienRoutes from './routes/bienRoutes';
import avisRoutes from './routes/avisRoutes';
import bailRoutes from './routes/bailRoutes';

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'MOVO Backend is running' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Locataire routes (recherche globale, création manuelle, changement mdp)
app.use('/api/locataires', locataireRoutes);

// Bien immobilier routes
app.use('/api/biens', bienRoutes);

// Avis / Rapports routes
app.use('/api/avis', avisRoutes);

// Baux et Demandes de liaison routes
app.use('/api/baux', bailRoutes);

export default app;
