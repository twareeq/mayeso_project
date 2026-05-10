import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const user = (req as any).user;
  const { myClasses } = req.query;

  const where: any = {};
  if (myClasses === 'true' && user.role === 'TEACHER') {
    where.responsibleTeacherId = user.id;
  } else if (user.role === 'HEAD_TEACHER') {
    where.level = { schoolId: user.schoolId };
  }

  const classes = await prisma.class.findMany({
    where,
    include: { level: { include: { school: true } }, responsibleTeacher: true }
  });
  res.json(classes);
});

router.get('/:id', async (req, res) => {
  try {
    const cls = await prisma.class.findUnique({
      where: { id: req.params.id as string },
      include: { 
        level: { include: { school: true } }, 
        responsibleTeacher: true,
        _count: { select: { students: true, subjects: true } }
      }
    });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newClass = await prisma.class.create({ data: req.body });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ message: 'Error creating class' });
  }
});

router.patch('/:id', requireRole(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, standard, stream, levelId, responsibleTeacherId } = req.body;
    const user = (req as any).user;

    // Security: Head Teacher can only update classes in their school
    if (user.role === 'HEAD_TEACHER') {
    const cls = await prisma.class.findUnique({
      where: { id: id as string },
      include: { level: true }
    }) as any;
      if (!cls || cls.level.schoolId !== user.schoolId) {
        return res.status(403).json({ message: 'Forbidden: You can only update classes in your school' });
      }
    }

    const updated = await prisma.class.update({
      where: { id: id as string },
      data: { 
        name, 
        standardNumber: standard ? parseInt(standard) : undefined, 
        stream, 
        levelId, 
        responsibleTeacherId 
      }
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error updating class' });
  }
});

router.post('/:id/assign-teacher', requireRole(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { teacherId } = req.body;
    const updated = await prisma.class.update({
      where: { id: req.params.id as string },
      data: { responsibleTeacherId: teacherId }
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Error assigning teacher' });
  }
});

export default router;
