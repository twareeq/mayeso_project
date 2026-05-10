import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);
router.use(requireRole(['HEAD_TEACHER', 'ADMIN']));

router.get('/', async (req, res) => {
  const students = await prisma.student.findMany({ include: { class: true } });
  res.json(students);
});

router.post('/', async (req, res) => {
  try {
    // Generate admission number
    const count = await prisma.student.count();
    const admissionNumber = `MPS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    const data = { ...req.body, admissionNumber, createdById: (req as any).user.id };
    const student = await prisma.student.create({ data });
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: 'Error creating student' });
  }
});

export default router;
