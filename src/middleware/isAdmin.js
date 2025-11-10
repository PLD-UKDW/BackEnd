const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function isAdmin(req, res, next) {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden, admin only" });
    }
    next();
}

module.exports = isAdmin;