"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const pdf_service_1 = require("../../services/pdf.service");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/student', async (req, res) => {
    try {
        const { studentId, termId } = req.body;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="report_${studentId}.pdf"`);
        await (0, pdf_service_1.generateStudentReportPDF)(studentId, termId, res);
    }
    catch (err) {
        res.status(500).json({ message: 'Error generating PDF' });
    }
});
router.get('/class/:classId/term/:termId', async (req, res) => {
    try {
        const { classId, termId } = req.params;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="class_reports_${classId}.pdf"`);
        await (0, pdf_service_1.generateClassReportsPDF)(classId, termId, res);
    }
    catch (err) {
        res.status(500).json({ message: 'Error generating class PDF' });
    }
});
exports.default = router;
