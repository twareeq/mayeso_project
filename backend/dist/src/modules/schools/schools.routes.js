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
router.use((0, rbac_1.requireRole)(['ADMIN']));
router.get('/', async (req, res) => {
    const schools = await database_1.default.school.findMany({
        include: {
            zone: true,
            _count: { select: { users: true, levels: true } }
        }
    });
    res.json(schools);
});
router.post('/', async (req, res) => {
    const { name, zoneId, address, phone, email, logoUrl } = req.body;
    try {
        const school = await database_1.default.school.create({
            data: { name, zoneId, address, phone, email, logoUrl }
        });
        res.status(201).json(school);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating school' });
    }
});
exports.default = router;
