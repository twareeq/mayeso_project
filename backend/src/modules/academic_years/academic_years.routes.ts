import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/', async (req, res) => {
  const years = await prisma.academicYear.findMany({ include: { terms: true } });
  res.json(years);
});

router.post('/', async (req, res) => {
  try {
    const year = await prisma.academicYear.create({ data: req.body });
    res.status(201).json(year);
  } catch (err) {
    res.status(400).json({ message: 'Error creating academic year' });
  }
});

export default router;
