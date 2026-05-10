import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const subjects = await prisma.subject.findMany({ include: { class: true } });
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
