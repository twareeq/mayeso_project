import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);
router.get('/', async (req, res) => {
  const terms = await prisma.term.findMany({
    include: { academicYear: true },
    orderBy: [{ academicYear: { year: 'desc' } }, { termNumber: 'asc' }]
  });
  res.json(terms);
});

router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const term = await prisma.term.create({ data: req.body });
    res.status(201).json(term);
  } catch (err) {
    res.status(400).json({ message: 'Error creating term' });
  }
});

export default router;
