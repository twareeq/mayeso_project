import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/', async (req, res) => {
  const zones = await prisma.zone.findMany({
    include: { _count: { select: { schools: true } } }
  });
  res.json(zones);
});

router.post('/', async (req, res) => {
  const { name, region } = req.body;
  try {
    const zone = await prisma.zone.create({ data: { name, region } });
    res.status(201).json(zone);
  } catch (err) {
    res.status(400).json({ message: 'Error creating zone. Name might be taken.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const zoneId = req.params.id as string;
    const schoolsCount = await prisma.school.count({ where: { zoneId } });
    
    if (schoolsCount > 0) {
      return res.status(400).json({ message: 'Cannot delete zone with existing schools' });
    }
    
    await prisma.zone.delete({ where: { id: zoneId } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
