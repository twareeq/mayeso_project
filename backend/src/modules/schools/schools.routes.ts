import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/', async (req, res) => {
  const schools = await prisma.school.findMany({
    include: { 
      zone: true,
      _count: { select: { users: true, levels: true } }
    }
  });
  res.json(schools);
});

router.post('/', async (req, res) => {
  const { name, zoneId, address, phone, email, logoUrl } = req.body;
  try {
    const school = await prisma.school.create({ 
      data: { name, zoneId, address, phone, email, logoUrl } 
    });
    res.status(201).json(school);
  } catch (err) {
    res.status(400).json({ message: 'Error creating school' });
  }
});

export default router;
