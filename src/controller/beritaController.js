const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
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
        const { title, content, category } = req.body;

        const image = req.file ? req.file.filename : null;

        const newBerita = await prisma.berita.create({
            data: {
                title,
                content_images: image,
                content,
                category,
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
            orderBy: { createdAt: "desc" }
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
                category: true,
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
            where: { id: Number(id) }
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
                category: true,
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

const updateBerita = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, category } = req.body;

        const berita = await prisma.berita.findUnique({ where: { id: Number(id) }});
        if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

        const newContentImage = req.file ? req.file.filename : null;

        if (newContentImage && berita.content_images) {
            const oldPath = path.join(__dirname, "..", "..", "uploads", "berita", berita.content_images);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const updated = await prisma.berita.update({
            where: { id: Number(id) },
            data: {
                title: title ?? berita.title,
                content: content ?? berita.content,
                category: category ?? berita.category,
                content_images: newContentImage
                    ? newContentImage
                    : berita.content_images
            },
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
module.exports = {createBerita, getBeritaAdmin, getBeritaPublic, getBeritaByIdAdmin, getBeritaByIdPublic, updateBerita, deleteBerita, publishBerita, unpublishBerita};