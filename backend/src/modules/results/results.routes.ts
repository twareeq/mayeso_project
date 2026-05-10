import { Router } from 'express';
import prisma from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { computeStudentResult } from '../../services/results.service';

const router = Router();
router.use(authenticate);

router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { termId } = req.query;
  const result = await prisma.studentResult.findFirst({
    where: { studentId, termId: termId as string },
    include: { subjectResults: true }
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
      where: { id: req.params.id },
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
