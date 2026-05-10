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
router.get('/', async (req, res) => {
    const { classId, termId, search } = req.query;
    const user = req.user;
    const where = {};
    if (termId) {
        where.termId = termId;
    }
    if (classId) {
        where.student = { classId: classId };
    }
    else if (user.role === 'HEAD_TEACHER' && user.schoolId) {
        // Scope to their school
        where.student = { class: { level: { schoolId: user.schoolId } } };
    }
    else if (user.role === 'TEACHER') {
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
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { admissionNumber: { contains: search, mode: 'insensitive' } },
            ]
        };
    }
    const results = await database_1.default.studentResult.findMany({
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
    const result = await database_1.default.studentResult.findFirst({
        where: { studentId, termId: termId },
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
        await (0, results_service_1.computeStudentResult)(studentId, termId);
        res.json({ message: 'Result computed successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'Error computing result' });
    }
});
router.patch('/:id/remarks', async (req, res) => {
    try {
        const { teacherRemarks } = req.body;
        const result = await database_1.default.studentResult.update({
            where: { id: req.params.id },
            data: { teacherRemarks }
        });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ message: 'Error updating remarks' });
    }
});
router.post('/finalize/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { termId } = req.query;
        await database_1.default.studentResult.update({
            where: { studentId_termId: { studentId, termId: termId } },
            data: { isFinalized: true, finalizedAt: new Date() }
        });
        res.json({ message: 'Result finalized' });
    }
    catch (err) {
        res.status(500).json({ message: 'Error finalizing result' });
    }
});
exports.default = router;
