import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

const router = Router();
router.use(authenticate);
router.get('/', async (req, res) => {
  const { classId, search } = req.query;
  const user = (req as any).user;

  const where: any = {};
  
  if (search) {
    const s = search as string;
    where.OR = [
      { firstName: { contains: s, mode: 'insensitive' } },
      { lastName: { contains: s, mode: 'insensitive' } },
      { admissionNumber: { contains: s, mode: 'insensitive' } }
    ];
  } else if (classId) {
    where.classId = classId as string;
  } else if (user.role === 'HEAD_TEACHER' && user.schoolId) {
    // Scope to their school if not searching
    where.class = { level: { schoolId: user.schoolId } };
  }

  const students = await prisma.student.findMany({
    where,
    include: { class: { include: { level: { include: { school: true } } } } },
    orderBy: { firstName: 'asc' },
    take: search ? 10 : undefined // Limit search results
  });
  res.json(students);
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: { 
        class: { 
          include: { 
            level: { 
              include: { 
                school: true 
              } 
            } 
          } 
        },
        createdBy: {
          select: { fullName: true, email: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student details' });
  }
});

router.post('/', requireRole(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { classId, ...rest } = req.body;
    const userId = (req as any).user.id;

    const admissionNumber = await generateAdmissionNumber(classId);

    const student = await prisma.student.create({
      data: { ...rest, classId, admissionNumber, createdById: userId }
    });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error creating student' });
  }
});

router.patch('/:id', requireRole(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { classId, ...rest } = req.body;
    const user = (req as any).user;

    const existingStudent = await prisma.student.findUnique({
      where: { id: id as string },
      include: { class: { include: { level: true } } }
    }) as any;

    if (!existingStudent) return res.status(404).json({ message: 'Student not found' });

    let admissionNumber = existingStudent.admissionNumber;

    // If class changed, check if school changed
    if (classId && classId !== existingStudent.classId) {
      const newClass = await prisma.class.findUnique({
        where: { id: classId as string },
        include: { level: true }
      }) as any;
      
      if (!newClass) return res.status(404).json({ message: 'New class not found' });

      // If school changed, generate new admission number
      if (newClass.level.schoolId !== existingStudent.class.level.schoolId) {
        admissionNumber = await generateAdmissionNumber(classId);
      }
    }

    const updated = await prisma.student.update({
      where: { id: id as string },
      data: { ...rest, classId, admissionNumber }
    });
    res.json(updated);
  } catch (err) {
    console.error('Update student error:', err);
    res.status(400).json({ 
      message: 'Error updating student', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
});

async function generateAdmissionNumber(classId: string): Promise<string> {
  const cls = await prisma.class.findUnique({
    where: { id: classId as string },
    include: { level: { include: { school: true } } }
  }) as any;
  if (!cls) throw new Error('Class not found');

  const school = cls.level.school;
  const prefix = school.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();
  const year = new Date().getFullYear();

  const schoolStudentCount = await prisma.student.count({
    where: { class: { level: { schoolId: school.id } } }
  });

  return `${prefix}-${year}-${String(schoolStudentCount + 1).padStart(4, '0')}`;
}

export default router;
