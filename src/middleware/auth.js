const jwt = require('jsonwebtoken');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        req.user = user;
        next();

    } catch (err) {
        console.error(err);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = auth;



// const jwt = require("jsonwebtoken");
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// // AUTH → cek token
// const auth = async (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     const token = authHeader.split(" ")[1];

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         const user = await prisma.user.findUnique({
//             where: { id: decoded.userId }
//         });

//         if (!user) {
//             return res.status(404).json({ error: "User not found" });
//         }

//         req.user = user;
//         next();

//     } catch (err) {
//         return res.status(401).json({ error: "Invalid token" });
//     }
// };

// // ROLE CHECK → cek role tertentu
// const requireRole = (role) => {
//     return (req, res, next) => {
//         if (!req.user) {
//             return res.status(401).json({ error: "Unauthorized" });
//         }

//         if (req.user.role !== role) {
//             return res.status(403).json({ error: "Forbidden: Admin only" });
//         }

//         next();
//     };
// };

// module.exports = { auth, requireRole };
