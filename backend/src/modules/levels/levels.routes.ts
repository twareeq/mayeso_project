import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const levels = await prisma.level.findMany({ include: { school: true } });
  res.json(levels);
});

router.post('/', requireRole(['ADMIN']), async (req, res) => {
  try {
    const level = await prisma.level.create({ data: req.body });
    res.status(201).json(level);
  } catch (err) {
    res.status(400).json({ message: 'Error creating level' });
  }
});

export default router;
