import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const user = (req as any).user;
  const { classId, mySubjects } = req.query;

  const where: any = {};
  if (classId) where.classId = classId as string;
  if (mySubjects === 'true' && user.role === 'TEACHER') {
    where.teachers = { some: { teacherId: user.id } };
  }

  const subjects = await prisma.subject.findMany({ where });
  res.json(subjects);
});

router.post('/', async (req, res) => {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    res.status(201).json(subject);
  } catch (err) {
    res.status(400).json({ message: 'Error creating subject' });
  }
});

export default router;
