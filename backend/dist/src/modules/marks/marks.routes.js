"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const auth_1 = require("../../middleware/auth");
const results_service_1 = require("../../services/results.service");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/completion', async (req, res) => {
    try {
        const { classId, subjectId, termId } = req.query;
        if (!classId || !subjectId || !termId) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }
        const students = await database_1.default.student.findMany({
            where: { classId: classId },
            select: { id: true }
        });
        const completionData = await Promise.all(students.map(async (student) => {
            const marks = await database_1.default.mark.findMany({
                where: {
                    studentId: student.id,
                    subjectId: subjectId,
                    termId: termId
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
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching completion status' });
    }
});
router.get('/', async (req, res) => {
    const { studentId, subjectId, termId } = req.query;
    const marks = await database_1.default.mark.findMany({
        where: {
            studentId: studentId,
            subjectId: subjectId,
            termId: termId,
        }
    });
    res.json(marks);
});
router.post('/assessment', async (req, res) => {
    try {
        const { studentId, subjectId, termId, assessmentNumber, score, isDraft } = req.body;
        const mark = await database_1.default.mark.upsert({
            where: {
                studentId_subjectId_termId_markType_assessmentNumber: {
                    studentId, subjectId, termId, markType: 'ASSESSMENT', assessmentNumber
                }
            },
            update: { score, isDraft, enteredById: req.user.id },
            create: {
                studentId, subjectId, termId, markType: 'ASSESSMENT', assessmentNumber, score, maxScore: 5, isDraft, enteredById: req.user.id
            }
        });
        // Trigger compute asynchronously
        (0, results_service_1.computeStudentResult)(studentId, termId).catch(console.error);
        res.json(mark);
    }
    catch (err) {
        res.status(400).json({ message: 'Error saving assessment' });
    }
});
router.post('/end-of-term', async (req, res) => {
    try {
        const { studentId, subjectId, termId, score, isDraft } = req.body;
        const existing = await database_1.default.mark.findFirst({
            where: { studentId, subjectId, termId, markType: 'END_OF_TERM' }
        });
        const mark = existing
            ? await database_1.default.mark.update({
                where: { id: existing.id },
                data: { score, isDraft, updatedAt: new Date(), enteredById: req.user.id }
            })
            : await database_1.default.mark.create({
                data: { studentId, subjectId, termId, markType: 'END_OF_TERM',
                    score, maxScore: 70, isDraft, enteredById: req.user.id }
            });
        (0, results_service_1.computeStudentResult)(studentId, termId).catch(console.error);
        res.json(mark);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error saving end of term mark' });
    }
});
router.post('/finalize', async (req, res) => {
    try {
        const { studentId, termId } = req.body;
        await database_1.default.mark.updateMany({
            where: { studentId, termId },
            data: { isDraft: false }
        });
        await (0, results_service_1.computeStudentResult)(studentId, termId);
        res.json({ message: 'Marks finalized' });
    }
    catch (err) {
        res.status(500).json({ message: 'Error finalizing marks' });
    }
});
exports.default = router;
