import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { generateStudentReportPDF, generateClassReportsPDF } from '../../services/pdf.service';

const router = Router();
router.use(authenticate);

router.post('/student', async (req, res) => {
  try {
    const { studentId, termId } = req.body;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report_${studentId}.pdf"`);
    await generateStudentReportPDF(studentId, termId, res);
  } catch (err) {
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

router.get('/class/:classId/term/:termId', async (req, res) => {
  try {
    const { classId, termId } = req.params;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="class_reports_${classId}.pdf"`);
    await generateClassReportsPDF(classId, termId, res);
  } catch (err) {
    res.status(500).json({ message: 'Error generating class PDF' });
  }
});

export default router;
