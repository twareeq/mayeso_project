import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import bcrypt from 'bcrypt';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN', 'HEAD_TEACHER']));

router.get('/', async (req, res) => {
  const user = (req as any).user;
  const where: any = {};
  
  if (user.role === 'HEAD_TEACHER') {
    where.schoolId = user.schoolId;
  }

  const users = await prisma.user.findMany({
    where,
    include: { school: true }
  });
  res.json(users);
});

router.post('/', async (req, res) => {
  const { fullName, email, password, role, schoolId, phoneNumber } = req.body;
  
  if (role !== 'ADMIN' && !schoolId) {
    return res.status(400).json({ message: 'School is required for this role' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
        schoolId: role === 'ADMIN' ? null : schoolId,
        phoneNumber
      }
    });
    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ message: 'Error creating user' });
  }
});

export default router;
