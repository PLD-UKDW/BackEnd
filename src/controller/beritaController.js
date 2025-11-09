const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createBerita = async (req, res, next) => {
    try {
        const { title, content, category } = req.body;

        const image = req.file ? `/uploads/berita/${req.file.filename}` : null;

        const newBerita = await prisma.berita.create({
        data: {
            title,
            content,
            category,
            images: image,
        },
        });

        res.status(201).json({
        status: 'success',
        message: 'Berita berhasil dibuat',
        data: newBerita,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {createBerita};