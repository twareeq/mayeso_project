import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { computeStudentResult } from '../../services/results.service';

const router = Router();
router.use(authenticate);

router.get('/completion', async (req, res) => {
  try {
    const { classId, subjectId, termId } = req.query;
    
    if (!classId || !subjectId || !termId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const students = await prisma.student.findMany({
      where: { classId: classId as string },
      select: { id: true }
    });

    const completionData = await Promise.all(students.map(async (student) => {
      const marks = await prisma.mark.findMany({
        where: {
          studentId: student.id,
          subjectId: subjectId as string,
          termId: termId as string
        }
      });

      const assessmentsEntered = marks.filter(m => m.markType === 'ASSESSMENT').length;
      const endOfTermEntered = marks.some(m => m.markType === 'END_OF_TERM');
      // Assuming 6 assessments are required
      const isComplete = assessmentsEntered >= 6 && endOfTermEntered;

      return {
        studentId: student.id,
        assessmentsEntered,
        endOfTermEntered,
        isComplete
      };
    }));

    res.json(completionData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching completion status' });
  }
});

router.get('/', async (req, res) => {
  const { studentId, subjectId, termId } = req.query;
  const marks = await prisma.mark.findMany({
    where: {
      studentId: studentId as string,
      subjectId: subjectId as string,
      termId: termId as string,
    }
  });
  res.json(marks);
});

router.post('/assessment', async (req, res) => {
  try {
    const { studentId, subjectId, termId, assessmentNumber, score, isDraft } = req.body;
    const mark = await prisma.mark.upsert({
      where: {
        studentId_subjectId_termId_markType_assessmentNumber: {
          studentId, subjectId, termId, markType: 'ASSESSMENT', assessmentNumber
        }
      },
      update: { score, isDraft, enteredById: (req as any).user.id },
      create: {
        studentId, subjectId, termId, markType: 'ASSESSMENT', assessmentNumber, score, maxScore: 5, isDraft, enteredById: (req as any).user.id
      }
    });
    // Trigger compute asynchronously
    computeStudentResult(studentId as string, termId as string).catch(console.error);
    res.json(mark);
  } catch (err) {
    res.status(400).json({ message: 'Error saving assessment' });
  }
});

router.post('/end-of-term', async (req, res) => {
  try {
    const { studentId, subjectId, termId, score, isDraft } = req.body;

    const existing = await prisma.mark.findFirst({
      where: { studentId, subjectId, termId, markType: 'END_OF_TERM' }
    });

    const mark = existing
      ? await prisma.mark.update({
          where: { id: existing.id },
          data: { score, isDraft, updatedAt: new Date(), enteredById: (req as any).user.id }
        })
      : await prisma.mark.create({
          data: { studentId, subjectId, termId, markType: 'END_OF_TERM',
                  score, maxScore: 70, isDraft, enteredById: (req as any).user.id }
        });

    computeStudentResult(studentId, termId).catch(console.error);
    res.json(mark);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Error saving end of term mark' });
  }
});

router.post('/finalize', async (req, res) => {
  try {
    const { studentId, termId } = req.body;
    await prisma.mark.updateMany({
      where: { studentId, termId },
      data: { isDraft: false }
    });
    await computeStudentResult(studentId as string, termId as string);
    res.json({ message: 'Marks finalized' });
  } catch (err) {
    res.status(500).json({ message: 'Error finalizing marks' });
  }
});

export default router;
