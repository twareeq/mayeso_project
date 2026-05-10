import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/overview', async (req, res) => {
  try {
    const students = await prisma.student.count();
    const teachers = await prisma.user.count({ where: { role: 'TEACHER' } });
    const schools = await prisma.school.count();
    const zones = await prisma.zone.count();
    res.json({ students, teachers, schools, zones });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

export default router;
