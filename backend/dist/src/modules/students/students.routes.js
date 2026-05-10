"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const { classId, search } = req.query;
    const user = req.user;
    const where = {};
    if (search) {
        const s = search;
        where.OR = [
            { firstName: { contains: s, mode: 'insensitive' } },
            { lastName: { contains: s, mode: 'insensitive' } },
            { admissionNumber: { contains: s, mode: 'insensitive' } }
        ];
    }
    else if (classId) {
        where.classId = classId;
    }
    else if (user.role === 'HEAD_TEACHER' && user.schoolId) {
        // Scope to their school if not searching
        where.class = { level: { schoolId: user.schoolId } };
    }
    const students = await database_1.default.student.findMany({
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
        const student = await database_1.default.student.findUnique({
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
    }
    catch (err) {
        res.status(500).json({ message: 'Error fetching student details' });
    }
});
router.post('/', (0, rbac_1.requireRole)(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
    try {
        const { classId, ...rest } = req.body;
        const userId = req.user.id;
        const admissionNumber = await generateAdmissionNumber(classId);
        const student = await database_1.default.student.create({
            data: { ...rest, classId, admissionNumber, createdById: userId }
        });
        res.status(201).json(student);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Error creating student' });
    }
});
router.patch('/:id', (0, rbac_1.requireRole)(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { classId, ...rest } = req.body;
        const user = req.user;
        const existingStudent = await database_1.default.student.findUnique({
            where: { id: id },
            include: { class: { include: { level: true } } }
        });
        if (!existingStudent)
            return res.status(404).json({ message: 'Student not found' });
        let admissionNumber = existingStudent.admissionNumber;
        // If class changed, check if school changed
        if (classId && classId !== existingStudent.classId) {
            const newClass = await database_1.default.class.findUnique({
                where: { id: classId },
                include: { level: true }
            });
            if (!newClass)
                return res.status(404).json({ message: 'New class not found' });
            // If school changed, generate new admission number
            if (newClass.level.schoolId !== existingStudent.class.level.schoolId) {
                admissionNumber = await generateAdmissionNumber(classId);
            }
        }
        const updated = await database_1.default.student.update({
            where: { id: id },
            data: { ...rest, classId, admissionNumber }
        });
        res.json(updated);
    }
    catch (err) {
        console.error('Update student error:', err);
        res.status(400).json({
            message: 'Error updating student',
            error: err instanceof Error ? err.message : String(err)
        });
    }
});
async function generateAdmissionNumber(classId) {
    const cls = await database_1.default.class.findUnique({
        where: { id: classId },
        include: { level: { include: { school: true } } }
    });
    if (!cls)
        throw new Error('Class not found');
    const school = cls.level.school;
    const prefix = school.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase();
    const year = new Date().getFullYear();
    const schoolStudentCount = await database_1.default.student.count({
        where: { class: { level: { schoolId: school.id } } }
    });
    return `${prefix}-${year}-${String(schoolStudentCount + 1).padStart(4, '0')}`;
}
exports.default = router;
