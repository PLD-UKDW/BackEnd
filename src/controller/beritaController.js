// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require("../utils/prisma");
const fs = require("fs");
const path = require("path");

const deleteFile = (filePath) => {
    if (!filePath) return;

    const realPath = path.join(__dirname, "..", "..", "uploads", "berita", filePath);
    if (fs.existsSync(realPath)) {
        fs.unlinkSync(realPath);
    }
};

const createBerita = async (req, res, next) => {
    try {
        const { title, content, categoryId, tanggal, lokasi, isPublished } = req.body;

        // Handle multiple images - combine all uploaded files into comma-separated string
        let imageString = "";
        if (req.files && req.files.length > 0) {
            imageString = req.files.map(f => f.filename).join(',');
        } else if (req.file) {
            imageString = req.file.filename;
        }

        const categoryIdNum = categoryId ? Number(categoryId) : null;
        if (categoryId && Number.isNaN(categoryIdNum)) {
            return res.status(400).json({ message: "categoryId tidak valid" });
        }

        // Validate that category exists if provided
        if (categoryIdNum) {
            const category = await prisma.beritaCategory.findUnique({
                where: { id: categoryIdNum },
            });
            if (!category) {
                return res.status(400).json({ message: "Kategori tidak ditemukan" });
            }
        }

        const newBerita = await prisma.berita.create({
            data: {
                title,
                content_images: imageString,
                content,
                categoryId: categoryIdNum,
                tanggal: tanggal ? new Date(tanggal) : null,
                lokasi: lokasi || null,
                isPublished: isPublished === 'true' || isPublished === true,
            },
            include: {
                category: true,
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

const getBeritaAdmin = async (req, res, next) => {
    try {
        const berita = await prisma.berita.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
            },
        });

        if(berita.length === 0){
            return res.status(404).json({ message: "Berita tidak ditemukan" });
        }
        
        res.json({ total: berita.length, data: berita });
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil berita admin" });
    }
}

const publishBerita = async (req, res, next) => {
    try{
        const { id } = req.params;
        const berita = await prisma.berita.update({
            where: { id: Number(id) },
            data: { isPublished: true },
            include: { category: true },
        });
        res.json({ message: "Berita berhasil dipublikasikan", data: berita });
    }catch(err){
        next(err);
    }
}

const unpublishBerita = async (req, res, next) => {
    try{
        const { id } = req.params;
        const berita = await prisma.berita.update({
            where: { id: Number(id) },
            data: { isPublished: false },
            include: { category: true },
        });
        res.json({ message: "Berita berhasil disembunyikan", data: berita });
    }catch(err){
        next(err);
    }
}

const getBeritaPublic = async (req, res, next) => {
    try {
        const berita = await prisma.berita.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                content: true,
                content_images: true,
                category: {
                    select: { id: true, name: true },
                },
                tanggal: true,
                lokasi: true,
                createdAt: true,
            }
        });

        if(berita.length === 0){
            return res.status(404).json({ message: "Berita tidak ditemukan" });
        }

        res.json({ total: berita.length, data: berita });
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil berita" });
    }
}

const getBeritaByIdAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const berita = await prisma.berita.findUnique({
            where: { id: Number(id) },
            include: { category: true },
        });

        if (!berita) {
            return res.status(404).json({ message: "Berita tidak ditemukan" });
        }

        res.json(berita);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil berita" });
    }
}

const getBeritaByIdPublic = async (req, res, next) => {
    try {
        const { id } = req.params;

        const berita = await prisma.berita.findUnique({
            where: {
                id: Number(id),
                isPublished: true
            },
            select: {
                id: true,
                title: true,
                content: true,
                content_images: true,
                category: {
                    select: { id: true, name: true },
                },
                tanggal: true,
                lokasi: true,
                createdAt: true,
            }

        });

        if(!berita){
            return res.status(404).json({ message: "Berita tidak ditemukan" });
        }

        res.json({ total: 1, data: berita });
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil berita" });
    }
}

const updateBerita = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, categoryId, tanggal, lokasi, isPublished } = req.body;

        const berita = await prisma.berita.findUnique({ where: { id: Number(id) }});
        if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

        const newContentImage = req.file ? req.file.filename : null;

        if (newContentImage && berita.content_images) {
            const oldPath = path.join(__dirname, "..", "..", "uploads", "berita", berita.content_images);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const categoryIdNum = categoryId ? Number(categoryId) : null;
        if (categoryId && Number.isNaN(categoryIdNum)) {
            return res.status(400).json({ message: "categoryId tidak valid" });
        }

        // Validate that category exists if provided
        if (categoryIdNum) {
            const category = await prisma.beritaCategory.findUnique({
                where: { id: categoryIdNum },
            });
            if (!category) {
                return res.status(400).json({ message: "Kategori tidak ditemukan" });
            }
        }

        const updated = await prisma.berita.update({
            where: { id: Number(id) },
            data: {
                title: title ?? berita.title,
                content: content ?? berita.content,
                categoryId: categoryId !== undefined ? categoryIdNum : berita.categoryId,
                tanggal: tanggal !== undefined ? (tanggal ? new Date(tanggal) : null) : berita.tanggal,
                lokasi: lokasi !== undefined ? (lokasi || null) : berita.lokasi,
                isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : berita.isPublished,
                content_images: newContentImage
                    ? newContentImage
                    : berita.content_images
            },
            include: { category: true },
        });
        console.log("FILE DITERIMA:", req.file);
console.log("FILES:", req.files);


        res.json({ message: "Berita berhasil diupdate", data: updated });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Gagal update berita" });
    }
}

const deleteBerita = async (req, res, next) => {
    try {
        const { id } = req.params;

        const berita = await prisma.berita.findUnique({
            where: { id: Number(id) }
        });

        if (!berita) {
            return res.status(404).json({ message: "Berita tidak ditemukan" });
        }
        deleteFile(berita.content_images);
        await prisma.berita.delete({ where: { id: Number(id) } });

        res.status(204).send();

    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus berita" });
    }
}

// =============================
// Kategori Berita
// =============================
const getBeritaCategories = async (_req, res) => {
    try {
        const categories = await prisma.beritaCategory.findMany({ orderBy: { name: "asc" } });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil kategori" });
    }
};

const createBeritaCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Nama kategori wajib diisi" });

        const exists = await prisma.beritaCategory.findFirst({ where: { name } });
        if (exists) return res.status(400).json({ message: "Kategori sudah ada" });

        const category = await prisma.beritaCategory.create({ data: { name } });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ error: "Gagal membuat kategori" });
    }
};

module.exports = {
    createBerita,
    getBeritaAdmin,
    getBeritaPublic,
    getBeritaByIdAdmin,
    getBeritaByIdPublic,
    updateBerita,
    deleteBerita,
    publishBerita,
    unpublishBerita,
    getBeritaCategories,
    createBeritaCategory,
};