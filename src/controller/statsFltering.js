const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function roundIPK(ipk) {
    if (ipk >= 3.5) return 3.5;
    if (ipk >= 3.0) return 3.0;
    if (ipk >= 2.5) return 2.5;
    return 2.0;
}

exports.filterMahasiswa = async (req, res) => {
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
            kategori_disabilitas
        } = req.query;

        const where = {};

        if (provinsi) where.provinsi = provinsi;
        if (angkatan) where.angkatan = Number(angkatan);
        if (jalur_masuk) where.jalur_masuk = jalur_masuk;
        if (gender) where.gender = gender;
        if (status) where.status = status;
        if (jenjang) where.jenjang = jenjang;
        if (asal_sekolah) where.asal_sekolah = asal_sekolah;

        // ============================================
        // ✅ FILTER IPK RANGE
        // ============================================
        if (ipk) {
            where.ipk = { gte: Number(ipk) };
        }

        // ============================================
        // ✅ FILTER PRODI by NAMA (bukan id)
        // ============================================
        if (prodi) {
            where.prodi = { nama: prodi };
        }

        // ============================================
        // ✅ FILTER KATEGORI DISABILITAS by NAMA
        // menggunakan pivot mahasiswa_kategori_disabilitas
        // ============================================
        if (kategori_disabilitas) {
            where.kategoriDisabilitas = {
                some: {
                    kategori: {
                        kategori: kategori_disabilitas
                    }
                }
            };
        }

        // ============================================
        // ✅ FETCH DATA
        // ============================================
        const result = await prisma.mahasiswa.findMany({
            where,
            include: {
                fakultas: true,
                prodi: true,
                kategoriDisabilitas: {
                    include: {
                        kategori: true
                    }
                },
                jenisDisabilitas: {
                    include: {
                        jenis: true
                    }
                }
            }
        });

        // =============================
        // BULATKAN IPK (HANYA UNTUK TAMPILAN)
        // =============================
        const finalOutput = result.map((m) => ({
            ...m,
            ipk: roundIPK(m.ipk)
        }));

        
        res.json({
            total: result.length,
            data: finalOutput,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Terjadi kesalahan server" });
    }
};
