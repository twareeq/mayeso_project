import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import authRoutes from './modules/auth/auth.routes';
import zonesRoutes from './modules/zones/zones.routes';
import schoolsRoutes from './modules/schools/schools.routes';
import usersRoutes from './modules/users/users.routes';
import levelsRoutes from './modules/levels/levels.routes';
import academicYearsRoutes from './modules/academic_years/academic_years.routes';
import termsRoutes from './modules/terms/terms.routes';
import classesRoutes from './modules/classes/classes.routes';
import subjectsRoutes from './modules/subjects/subjects.routes';
import studentsRoutes from './modules/students/students.routes';
import marksRoutes from './modules/marks/marks.routes';
import resultsRoutes from './modules/results/results.routes';
import reportsRoutes from './modules/reports/reports.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mayeso API is running' });
});

// Setup modules
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/zones', zonesRoutes);
app.use('/api/v1/schools', schoolsRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/levels', levelsRoutes);
app.use('/api/v1/academic-years', academicYearsRoutes);
app.use('/api/v1/terms', termsRoutes);
app.use('/api/v1/classes', classesRoutes);
app.use('/api/v1/subjects', subjectsRoutes);
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/marks', marksRoutes);
app.use('/api/v1/results', resultsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
