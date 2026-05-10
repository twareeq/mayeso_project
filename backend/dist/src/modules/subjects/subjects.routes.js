"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', async (req, res) => {
    const user = req.user;
    const { classId, mySubjects } = req.query;
    const where = {};
    if (classId)
        where.classId = classId;
    if (mySubjects === 'true' && user.role === 'TEACHER') {
        where.teachers = { some: { teacherId: user.id } };
    }
    const subjects = await database_1.default.subject.findMany({ where });
    res.json(subjects);
});
router.post('/', async (req, res) => {
    try {
        const subject = await database_1.default.subject.create({ data: req.body });
        res.status(201).json(subject);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating subject' });
    }
});
exports.default = router;
