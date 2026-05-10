import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { computeStudentResult } from '../../services/results.service';

const router = Router();
router.use(authenticate);

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
    const mark = await prisma.mark.upsert({
      where: {
        studentId_subjectId_termId_markType_assessmentNumber: {
          studentId, subjectId, termId, markType: 'END_OF_TERM', assessmentNumber: 0 // using 0 or null depending on schema handling
        }
      },
      update: { score, isDraft, enteredById: (req as any).user.id },
      create: {
        studentId, subjectId, termId, markType: 'END_OF_TERM', score, maxScore: 70, isDraft, enteredById: (req as any).user.id
      }
    });
    computeStudentResult(studentId as string, termId as string).catch(console.error);
    res.json(mark);
  } catch (err) {
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
