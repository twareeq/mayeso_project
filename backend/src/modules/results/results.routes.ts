import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { computeStudentResult } from '../../services/results.service';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { classId, termId, search } = req.query;
  const user = (req as any).user;

  const where: any = {};
  
  if (termId) {
    where.termId = termId as string;
  }

  if (classId) {
    where.student = { classId: classId as string };
  } else if (user.role === 'HEAD_TEACHER' && user.schoolId) {
    // Scope to their school
    where.student = { class: { level: { schoolId: user.schoolId } } };
  } else if (user.role === 'TEACHER') {
    // Scope to their responsible class or subjects
    where.student = { 
      class: { 
        OR: [
          { responsibleTeacherId: user.id },
          { subjects: { some: { teachers: { some: { teacherId: user.id } } } } }
        ]
      } 
    };
  }

  if (search) {
    where.student = {
      ...where.student,
      OR: [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { admissionNumber: { contains: search as string, mode: 'insensitive' } },
      ]
    };
  }

  const results = await prisma.studentResult.findMany({
    where,
    include: {
      student: { include: { class: true } },
      term: { include: { academicYear: true } }
    },
    orderBy: { student: { firstName: 'asc' } }
  });
  
  res.json(results);
});

router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { termId } = req.query;
  const result = await prisma.studentResult.findFirst({
    where: { studentId, termId: termId as string },
    include: { 
      subjectResults: { orderBy: { subjectName: 'asc' } },
      student: { include: { class: { include: { level: { include: { school: true } } } } } },
      term: { include: { academicYear: true } }
    }
  });
  res.json(result);
});

router.post('/compute/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId } = req.query;
    await computeStudentResult(studentId, termId as string);
    res.json({ message: 'Result computed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error computing result' });
  }
});

router.patch('/:id/remarks', async (req, res) => {
  try {
    const { teacherRemarks } = req.body;
    const result = await prisma.studentResult.update({
      where: { id: req.params.id as string },
      data: { teacherRemarks }
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Error updating remarks' });
  }
});

router.post('/finalize/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId } = req.query;
    await prisma.studentResult.update({
      where: { studentId_termId: { studentId, termId: termId as string } },
      data: { isFinalized: true, finalizedAt: new Date() }
    });
    res.json({ message: 'Result finalized' });
  } catch (err) {
    res.status(500).json({ message: 'Error finalizing result' });
  }
});

export default router;
