import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const classes = await prisma.class.findMany({ include: { level: true, responsibleTeacher: true } });
  res.json(classes);
});

router.post('/', async (req, res) => {
  try {
    const newClass = await prisma.class.create({ data: req.body });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ message: 'Error creating class' });
  }
});

export default router;
