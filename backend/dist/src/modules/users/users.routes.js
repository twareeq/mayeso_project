"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../../config/database"));
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use((0, rbac_1.requireRole)(['ADMIN', 'HEAD_TEACHER']));
router.get('/', async (req, res) => {
    const user = req.user;
    const where = {};
    if (user.role === 'HEAD_TEACHER') {
        where.schoolId = user.schoolId;
    }
    const users = await database_1.default.user.findMany({
        where,
        include: { school: true }
    });
    res.json(users);
});
router.post('/', async (req, res) => {
    const { fullName, email, password, role, schoolId, phoneNumber } = req.body;
    if (role !== 'ADMIN' && !schoolId) {
        return res.status(400).json({ message: 'School is required for this role' });
    }
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const user = await database_1.default.user.create({
            data: {
                fullName,
                email,
                password: hashedPassword,
                role,
                schoolId: role === 'ADMIN' ? null : schoolId,
                phoneNumber
            }
        });
        // Don't send password back
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating user' });
    }
});
exports.default = router;
