// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require("../utils/prisma");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const login = async (req, res) => {
    try {
        const { registrationNumber } = req.body;
        if (!registrationNumber) return res.status(400).json({ message: "registrationNumber required" });
        
        const user = await prisma.user.findUnique({
            where: { registrationNumber }
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "ADMIN") {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          await prisma.user.update({
            where: { id: user.id },
            data: {
              otp,
              otpExpired: new Date(Date.now() + 5 * 60 * 1000),
            },
          });
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: "kkngondangukdw@gmail.com",
                subject: "OTP Login Admin",
                html: `
                    <h3>OTP Login Admin</h3>
                    <p>Gunakan kode berikut untuk login:</p>
                    <h2>${otp}</h2>
                    <p>Masa berlaku: 5 menit</p>
                `
            });

            return res.json({
                message: "OTP sent"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                registrationNumber: user.registrationNumber,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        return res.json({
            token,
            user: { id: user.id, name: user.name, registrationNumber: user.registrationNumber, role: user.role },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

const verifyAdmin = async (req, res) => {
    try {
        const { registrationNumber, otp } = req.body;

        if (!registrationNumber || !otp) {
            return res.status(400).json({ message: "registrationNumber and otp required" });
        }

        const user = await prisma.user.findUnique({ where: { registrationNumber } });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role !== "ADMIN") {
          return res.status(403).json({ message: "Forbidden" });
        }

        if (user.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        if (user.otpExpired < new Date()) {
            return res.status(410).json({ message: "OTP expired" });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                registrationNumber: user.registrationNumber,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        await prisma.user.update({
            where: { registrationNumber },
            data: { otp: null, otpExpired: null }
        });

        return res.json({
            message: "Admin verified successfully",
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

const resendOtp = async (req, res) => {
    try {
        const { registrationNumber } = req.body;

        if (!registrationNumber) {
            return res.status(400).json({ message: "registrationNumber required" });
        }

        const user = await prisma.user.findUnique({ where: { registrationNumber } });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await prisma.user.update({
            where: { id: user.id },
            data: {
                otp,
                otpExpired: new Date(Date.now() + 5 * 60 * 1000),
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "kkngondangukdw@gmail.com",
            subject: "OTP Login Admin",
            html: `
                <h3>OTP Login Admin</h3>
                <p>Gunakan kode berikut untuk login:</p>
                <h2>${otp}</h2>
                <p>Masa berlaku: 5 menit</p>
            `,
        });

        return res.json({ message: "OTP re-sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { login, verifyAdmin, resendOtp };


// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
// const jwt = require("jsonwebtoken");
// const nodemailer = require("nodemailer");

// const JWT_SECRET = process.env.JWT_SECRET;

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// const login = async (req, res) => {
//   try {
//     const { registrationNumber } = req.body;

//     if (!registrationNumber) {
//       return res.status(400).json({ message: "registrationNumber required" });
//     }

//     const user = await prisma.user.findUnique({ where: { registrationNumber } });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Admin → kirim OTP
//     if (user.role === "ADMIN") {
//       const otp = Math.floor(100000 + Math.random() * 900000).toString();

//       await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           otp,
//           otpExpired: new Date(Date.now() + 5 * 60 * 1000),
//         },
//       });

//       await transporter.sendMail({
//         from: process.env.MAIL_USER,
//         to: process.env.ADMIN_EMAIL,
//         subject: "OTP Login Admin",
//         html: `<h3>OTP Login Admin</h3><h2>${otp}</h2>`,
//       });

//       return res.json({ message: "OTP sent" });
//     }

//     // PARTICIPANT → langsung login
//     const token = jwt.sign(
//       {
//         userId: user.id,
//         role: user.role,
//       },
//       JWT_SECRET,
//       { expiresIn: "8h" }
//     );

//     return res.json({
//       token,
//       user: { id: user.id, name: user.name, role: user.role },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const verifyAdmin = async (req, res) => {
//   try {
//     const { registrationNumber, otp } = req.body;

//     const user = await prisma.user.findUnique({ where: { registrationNumber } });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.role !== "ADMIN") {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     if (otp !== user.otp) {
//       return res.status(401).json({ message: "Invalid OTP" });
//     }

//     if (user.otpExpired < new Date()) {
//       return res.status(410).json({ message: "OTP expired" });
//     }

//     const token = jwt.sign(
//       {
//         userId: user.id,
//         role: user.role,
//       },
//       JWT_SECRET,
//       { expiresIn: "8h" }
//     );

//     await prisma.user.update({
//       where: { id: user.id },
//       data: { otp: null, otpExpired: null },
//     });

//     return res.json({ message: "Admin verified", token });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = { login, verifyAdmin };

