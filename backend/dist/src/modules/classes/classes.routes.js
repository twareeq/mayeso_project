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
    const user = req.user;
    const { myClasses } = req.query;
    const where = {};
    if (myClasses === 'true' && user.role === 'TEACHER') {
        where.responsibleTeacherId = user.id;
    }
    else if (user.role === 'HEAD_TEACHER') {
        where.level = { schoolId: user.schoolId };
    }
    const classes = await database_1.default.class.findMany({
        where,
        include: { level: { include: { school: true } }, responsibleTeacher: true }
    });
    res.json(classes);
});
router.get('/:id', async (req, res) => {
    try {
        const cls = await database_1.default.class.findUnique({
            where: { id: req.params.id },
            include: {
                level: { include: { school: true } },
                responsibleTeacher: true,
                _count: { select: { students: true, subjects: true } }
            }
        });
        if (!cls)
            return res.status(404).json({ message: 'Class not found' });
        res.json(cls);
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', async (req, res) => {
    try {
        const newClass = await database_1.default.class.create({ data: req.body });
        res.status(201).json(newClass);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating class' });
    }
});
router.patch('/:id', (0, rbac_1.requireRole)(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, standard, stream, levelId, responsibleTeacherId } = req.body;
        const user = req.user;
        // Security: Head Teacher can only update classes in their school
        if (user.role === 'HEAD_TEACHER') {
            const cls = await database_1.default.class.findUnique({
                where: { id: id },
                include: { level: true }
            });
            if (!cls || cls.level.schoolId !== user.schoolId) {
                return res.status(403).json({ message: 'Forbidden: You can only update classes in your school' });
            }
        }
        const updated = await database_1.default.class.update({
            where: { id: id },
            data: {
                name,
                standardNumber: standard ? parseInt(standard) : undefined,
                stream,
                levelId,
                responsibleTeacherId
            }
        });
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ message: 'Error updating class' });
    }
});
router.post('/:id/assign-teacher', (0, rbac_1.requireRole)(['HEAD_TEACHER', 'ADMIN']), async (req, res) => {
    try {
        const { teacherId } = req.body;
        const updated = await database_1.default.class.update({
            where: { id: req.params.id },
            data: { responsibleTeacherId: teacherId }
        });
        res.json(updated);
    }
    catch (err) {
        res.status(400).json({ message: 'Error assigning teacher' });
    }
});
exports.default = router;
