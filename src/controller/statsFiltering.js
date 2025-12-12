// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
const prisma = require("../utils/prisma");

function roundIPK(ipk) {
    if (ipk >= 3.5) return 3.5;
    if (ipk >= 3.0) return 3.0;
    if (ipk >= 2.5) return 2.5;
    return 2.0;
}

function formatMahasiswa(m) {
    return {
        id: m.id,
        nama: m.nama,
        nim: m.nim,
        provinsi: m.provinsi,
        angkatan: m.angkatan,
        jalur_masuk: m.jalur_masuk,
        status: m.status,
        jenjang: m.jenjang,
        gender: m.gender,
        asal_sekolah: m.asal_sekolah,
        ipk: roundIPK(m.ipk),
        fakultas: m.fakultas?.nama || null,
        prodi: m.prodi?.nama || null,
        jenisDisabilitas:
            m.jenisDisabilitas.length > 0
                ? m.jenisDisabilitas[0].jenis.jenis
                : null,
        kategoriDisabilitas: m.kategoriDisabilitas.map(
            (k) => k.kategori.kategori
        ),
    };
}

const adminfilterMahasiswa = async (req, res) => {
    try {
        const {
            provinsi,
            prodi,
            angkatan,
            jalur_masuk,
            gender,
            status,
            jenjang,
            asal_sekolah,
            ipk,
            kategori_disabilitas,
            fakultas,
        } = req.query;

        const where = {};

        if (provinsi) where.provinsi = provinsi;
        if (angkatan) where.angkatan = Number(angkatan);
        if (jalur_masuk) where.jalur_masuk = jalur_masuk;
        if (gender) where.gender = gender;
        if (status) where.status = status;
        if (jenjang) where.jenjang = jenjang;
        if (asal_sekolah) where.asal_sekolah = asal_sekolah;

        if (fakultas){
            where.fakultas = { nama: fakultas };
        }

        if (ipk) {
            where.ipk = { gte: Number(ipk) };
        }

        if (prodi) {
            where.prodi = { nama: prodi };
        }

        if (kategori_disabilitas) {
            where.kategoriDisabilitas = {
                some: {
                    kategori: {
                        kategori: kategori_disabilitas
                    }
                }
            };
        }

        const result = await prisma.mahasiswa.findMany({
            where,
            include: {
                fakultas: { select: { nama: true } },
                prodi: { select: { nama: true } },
                kategoriDisabilitas: {
                    include: {
                        kategori: { select: { kategori: true } },
                    },
                },
                jenisDisabilitas: {
                    include: {
                        jenis: { select: { jenis: true } },
                    },
                },
            },
        });

        const formatted = result.map(formatMahasiswa);
        
        res.json({
            total: formatted.length,
            data: formatted,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
};

const filterMahasiswa = async (req, res) => {
    try {
        const {
        provinsi,
        prodi,
        fakultas,
        angkatan,
        jalur_masuk,
        gender,
        status,
        jenjang,
        asal_sekolah,
        ipk,
        kategori_disabilitas,
        } = req.query;

        const where = {};

        if (provinsi) where.provinsi = provinsi;
        if (angkatan) where.angkatan = Number(angkatan);
        if (jalur_masuk) where.jalur_masuk = jalur_masuk;
        if (gender) where.gender = gender;
        if (status) where.status = status;
        if (jenjang) where.jenjang = jenjang;
        if (asal_sekolah) where.asal_sekolah = asal_sekolah;
        if (ipk) where.ipk = { gte: Number(ipk) };
        if (fakultas) {
            where.fakultas = { nama: fakultas };
        }

        if (prodi) {
        where.prodi = { nama: prodi };
        }

        if (kategori_disabilitas) {
        where.kategoriDisabilitas = {
            some: {
            kategori: {
                kategori: kategori_disabilitas,
            },
            },
        };
        }

        const result = await prisma.mahasiswa.findMany({
        where,
        include: {
            fakultas: true,
            prodi: true,
            kategoriDisabilitas: {
            include: { kategori: true },
            },
            jenisDisabilitas: {
            include: { jenis: true },
            },
        },
        });

        const formatted = result.map((m) => {
        const data = formatMahasiswa(m);
        delete data.nama;
        delete data.nim;
        return data;
        });

        res.json({
        total: formatted.length,
        data: formatted,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
};

module.exports = { adminfilterMahasiswa, filterMahasiswa };