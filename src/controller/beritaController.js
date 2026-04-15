// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require("../utils/prisma");
const fs = require("fs");
const path = require("path");

const parseImageNames = (contentImages) => {
    if (!contentImages) return [];
    return String(contentImages)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => path.basename(item));
};

const deleteFile = (fileName) => {
    if (!fileName) return;

    const safeName = path.basename(fileName);
    const realPath = path.join(__dirname, "..", "..", "uploads", "berita", safeName);
    if (fs.existsSync(realPath)) {
        fs.unlinkSync(realPath);
    }
};

const createBerita = async (req, res, next) => {
    try {
        const { title, content, categoryId, tanggal, lokasi, isPublished } = req.body;

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
        const { title, content, categoryId, tanggal, lokasi, isPublished, keep_existing_images } = req.body;

        const berita = await prisma.berita.findUnique({ where: { id: Number(id) }});
        if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

        const existing = (berita.content_images || "")
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        let keepList = [];
        if (typeof keep_existing_images === 'string' && keep_existing_images.length > 0) {
            try {
                if (keep_existing_images.trim().startsWith('[')) {
                    keepList = JSON.parse(keep_existing_images).map(s => String(s).trim()).filter(Boolean);
                } else {
                    keepList = keep_existing_images.split(',').map(s => s.trim()).filter(Boolean);
                }
            } catch {
                keepList = keep_existing_images.split(',').map(s => s.trim()).filter(Boolean);
            }
        }

        const newImages = Array.isArray(req.files) && req.files.length > 0
            ? req.files.map(f => f.filename)
            : (req.file ? [req.file.filename] : []);

        let finalImages = existing;
        if (newImages.length > 0) {
            finalImages = [...newImages];
        } else if (keepList.length > 0) {
            finalImages = [...keepList];
        }

        const toDelete = existing.filter(x => !finalImages.includes(x));
        toDelete.forEach(file => {
            const oldPath = path.join(__dirname, "..", "..", "uploads", "berita", file);
            if (fs.existsSync(oldPath)) {
                try { fs.unlinkSync(oldPath); } catch {}
            }
        });

        const categoryIdNum = categoryId ? Number(categoryId) : null;
        if (categoryId && Number.isNaN(categoryIdNum)) {
            return res.status(400).json({ message: "categoryId tidak valid" });
        }

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
                content_images: finalImages.length > 0 ? finalImages.join(',') : null,
            },
            include: { category: true },
        });

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
        const imageNames = parseImageNames(berita.content_images);
        imageNames.forEach((fileName) => {
            try {
                deleteFile(fileName);
            } catch {}
        });

        await prisma.berita.delete({ where: { id: Number(id) } });

        res.status(204).send();

    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus berita" });
    }
}

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

const updateBeritaCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;

        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: "ID kategori tidak valid" });
        }
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: "Nama kategori wajib diisi" });
        }

        const existing = await prisma.beritaCategory.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        const duplicate = await prisma.beritaCategory.findFirst({
            where: {
                name: String(name).trim(),
                NOT: { id },
            },
        });
        if (duplicate) {
            return res.status(409).json({ message: "Nama kategori sudah digunakan" });
        }

        const updated = await prisma.beritaCategory.update({
            where: { id },
            data: { name: String(name).trim() },
        });

        res.json({ message: "Kategori berita berhasil diperbarui", category: updated });
    } catch (err) {
        res.status(500).json({ error: "Gagal memperbarui kategori berita" });
    }
};

const deleteBeritaCategory = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: "ID kategori tidak valid" });
        }

        const existing = await prisma.beritaCategory.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        const usedCount = await prisma.berita.count({ where: { categoryId: id } });
        if (usedCount > 0) {
            return res.status(409).json({
                message: "Kategori sedang digunakan oleh berita dan tidak bisa dihapus",
                usedCount,
            });
        }

        await prisma.beritaCategory.delete({ where: { id } });

        res.json({ message: "Kategori berita berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: "Gagal menghapus kategori berita" });
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
    updateBeritaCategory,
    deleteBeritaCategory,
};