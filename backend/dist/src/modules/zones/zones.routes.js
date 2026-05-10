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
    const zones = await database_1.default.zone.findMany({
        include: { _count: { select: { schools: true } } }
    });
    res.json(zones);
});
router.post('/', async (req, res) => {
    const { name, region } = req.body;
    try {
        const zone = await database_1.default.zone.create({ data: { name, region } });
        res.status(201).json(zone);
    }
    catch (err) {
        res.status(400).json({ message: 'Error creating zone. Name might be taken.' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const zoneId = req.params.id;
        const schoolsCount = await database_1.default.school.count({ where: { zoneId } });
        if (schoolsCount > 0) {
            return res.status(400).json({ message: 'Cannot delete zone with existing schools' });
        }
        await database_1.default.zone.delete({ where: { id: zoneId } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
