// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
const prisma = require("../utils/prisma");

async function getJenisFromKategori(kategoriArray) {
    if (kategoriArray.length === 1) {
        const kategoriDB = await prisma.kategoriDisabilitas.findUnique({
            where: { id: kategoriArray[0] },
            include: { jenisDisabilitas: true }
        });
        return kategoriDB.jenis_disabilitas_id;
    }

    const jenisGanda = await prisma.jenisDisabilitas.findFirst({
        where: { jenis: "Ganda" }
    });

    return jenisGanda.id;
}

// async function resolveJenisDisabilitas(kategoriDB) {
//     if (kategoriDB.length === 1) {
//         return kategoriDB[0].jenisDisabilitas.id;
//     }

//     const jenisGanda = await prisma.jenisDisabilitas.findFirst({
//         where: { jenis: "Ganda" }
//     });

//     return jenisGanda.id;
// }

const getAllMahasiswa = async (req, res) => {
    try {
        const mahasiswa = await prisma.mahasiswa.findMany({
            include: {
                fakultas: {
                    select: {
                        nama: true
                    }
                },
                prodi: {
                    select: {
                        nama: true
                    }
                },
                jenisDisabilitas: {
                    include: {
                        jenis: {
                            select: {
                                jenis: true
                            }
                        }
                    }
                },
                kategoriDisabilitas: {
                    include: {
                        kategori: {
                            select: {
                                kategori: true
                            }
                        }
                    }
                },
            }
        });
        const formatted = mahasiswa.map(m => ({
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
            ipk: m.ipk,
            fakultas: m.fakultas?.nama || null,
            prodi: m.prodi?.nama || null,
            jenisDisabilitas:
                m.jenisDisabilitas.length > 0
                    ? m.jenisDisabilitas[0].jenis.jenis
                    : null,
            kategoriDisabilitas: m.kategoriDisabilitas.map(k => k.kategori.kategori)
        }));

        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mahasiswa' });
    }
};

const getMahasiswaById = async (req, res) => {
    const { id } = req.params;
    try {
        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { id: Number(id) },
            include: {
                fakultas: { select: { nama: true } },
                prodi: { select: { nama: true } },
                kategoriDisabilitas: {
                    include: {
                        kategori: { select: { kategori: true } }
                    }
                },
                jenisDisabilitas: {
                    include: {
                        jenis: { select: { jenis: true } }
                    }
                }
            }
        });

        if (!mahasiswa) {
            return res.status(404).json({ error: "Mahasiswa not found" });
        }

        const formatted = {
            id: mahasiswa.id,
            nama: mahasiswa.nama,
            nim: mahasiswa.nim,
            provinsi: mahasiswa.provinsi,
            angkatan: mahasiswa.angkatan,
            jalur_masuk: mahasiswa.jalur_masuk,
            status: mahasiswa.status,
            jenjang: mahasiswa.jenjang,
            gender: mahasiswa.gender,
            asal_sekolah: mahasiswa.asal_sekolah,
            ipk: mahasiswa.ipk,
            fakultas: mahasiswa.fakultas?.nama || null,
            prodi: mahasiswa.prodi?.nama || null,
            jenisDisabilitas:
                mahasiswa.jenisDisabilitas.length > 0
                    ? mahasiswa.jenisDisabilitas[0].jenis.jenis
                    : null,
            kategoriDisabilitas: mahasiswa.kategoriDisabilitas.map(k => k.kategori.kategori)
        };
        return res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mahasiswa' });
    }
};

const createMahasiswa = async (req, res, next) => {
    try {
        const { nama, nim, provinsi, angkatan, jalur_masuk, status, jenjang, gender, asal_sekolah, ipk, fakultas_id, prodi_id, kategori } = req.body;
        if (!Array.isArray(kategori) || kategori.length === 0) {
            return res.status(400).json({ message: "Kategori disabilitas wajib diisi array" });
        }
        const mahasiswa = await prisma.mahasiswa.create({
            data: {
                nama,
                nim,
                provinsi,
                angkatan: Number(angkatan),
                jalur_masuk,
                status,
                jenjang,
                gender,
                asal_sekolah,
                ipk: Number(ipk),
                fakultas_id: Number(fakultas_id),
                prodi_id: Number(prodi_id),
            }
        });
        const kategoriDB = await prisma.kategoriDisabilitas.findMany({
            where: {
                kategori: { in: kategori }
            },
            include: { jenisDisabilitas: true }
        });

        if (kategoriDB.length !== kategori.length) {
            return res.status(400).json({ message: "Ada kategori yang tidak ditemukan" });
        }

        // Masukkan ke pivot mahasiswa_kategori_disabilitas
        for (const k of kategoriDB) {
            await prisma.mahasiswaKategoriDisabilitas.create({
                data: {
                    mahasiswa_id: mahasiswa.id,
                    kategori_id: k.id
                }
            });
        }

        // Tentukan jenis otomatis
        let jenisToInsert;

        if (kategoriDB.length === 1) {
            jenisToInsert = kategoriDB[0].jenisDisabilitas.id;
        } else {
            const jenisGanda = await prisma.jenisDisabilitas.findFirst({
                where: { jenis: "Ganda" }
            });
            jenisToInsert = jenisGanda.id;
        }

        // Masukkan ke pivot mahasiswa_jenis_disabilitas
        await prisma.mahasiswaJenisDisabilitas.create({
            data: {
                mahasiswa_id: mahasiswa.id,
                jenis_id: jenisToInsert
            }
        });

        res.status(201).json({
            message: "Mahasiswa berhasil dibuat",
            mahasiswa: mahasiswa
        });
    } catch (error) {
        next(error);
    }
};

const updateMahasiswa = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const {
            nama,
            nim,
            provinsi,
            angkatan,
            jalur_masuk,
            status,
            jenjang,
            gender,
            asal_sekolah,
            ipk,
            fakultas_id,
            prodi_id,
            kategori
        } = req.body;

        const existingMahasiswa = await prisma.mahasiswa.findUnique({
            where: { id: Number(id) }
        });

        if (!existingMahasiswa) {
            return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
        }

        if (nim) {
            const nimConflict = await prisma.mahasiswa.findFirst({
                where: {
                    nim,
                    NOT: { id }
                }
            });

            if (nimConflict) {
                return res.status(400).json({
                    message: "NIM sudah digunakan oleh mahasiswa lain"
                });
            }
        }

        const updated = await prisma.mahasiswa.update({
            where: { id: Number(id) },
            data: {
                nama,
                nim,
                provinsi,
                angkatan: Number(angkatan),
                jalur_masuk,
                status,
                jenjang,
                gender,
                asal_sekolah,
                ipk: Number(ipk),
                fakultas_id: Number(fakultas_id),
                prodi_id: Number(prodi_id)
            }
        });
        
        if (kategori && Array.isArray(kategori)) {
            const kategoriDB = await prisma.kategoriDisabilitas.findMany({
                where: { kategori: { in: kategori } },
                include: { jenisDisabilitas: true }
            });

            if (kategoriDB.length !== kategori.length) {
                return res.status(400).json({ message: "Ada kategori tidak valid" });
            }

            await prisma.mahasiswaKategoriDisabilitas.deleteMany({
                where: { mahasiswa_id: id }
            });

            for (const k of kategoriDB) {
                await prisma.mahasiswaKategoriDisabilitas.create({
                    data: {
                        mahasiswa_id: id,
                        kategori_id: k.id
                    }
                });
            }

            let jenisToInsert;

            if (kategoriDB.length === 1) {
                jenisToInsert = kategoriDB[0].jenisDisabilitas.id;
            } else {
                const jenisGanda = await prisma.jenisDisabilitas.findFirst({
                    where: { jenis: "Ganda" }
                });
                jenisToInsert = jenisGanda.id;
            }

            await prisma.mahasiswaJenisDisabilitas.deleteMany({
                where: { mahasiswa_id: updated.id }
            });

            await prisma.mahasiswaJenisDisabilitas.create({
                data: {
                    mahasiswa_id: updated.id,
                    jenis_id: jenisToInsert
                }
            });
        }

        const finalData = await prisma.mahasiswa.findUnique({
            where: { id },
            include: {
                fakultas: { select: { nama: true } },
                prodi: { select: { nama: true } },
                kategoriDisabilitas: {
                    include: { kategori: { select: { kategori: true } } }
                },
                jenisDisabilitas: {
                    include: { jenis: { select: { jenis: true } } }
                }
            }
        });

        const formatted = {
            id: finalData.id,
            nama: finalData.nama,
            nim: finalData.nim,
            provinsi: finalData.provinsi,
            angkatan: finalData.angkatan,
            jalur_masuk: finalData.jalur_masuk,
            status: finalData.status,
            jenjang: finalData.jenjang,
            gender: finalData.gender,
            asal_sekolah: finalData.asal_sekolah,
            ipk: finalData.ipk,
            fakultas: finalData.fakultas?.nama || null,
            prodi: finalData.prodi?.nama || null,
            jenisDisabilitas:
                finalData.jenisDisabilitas.length > 0
                    ? finalData.jenisDisabilitas[0].jenis.jenis
                    : null,
            kategoriDisabilitas: finalData.kategoriDisabilitas.map(
                k => k.kategori.kategori
            )
        };
        res.json({
            message: "Mahasiswa berhasil diperbarui",
            data: formatted
        });
    } catch (error) {
        next(error);
    }
};

const deleteMahasiswa = async (req, res) => {
    const { id } = req.params;
    try {
        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { id: Number(id) },
        });
        if (!mahasiswa) {
            return res.status(404).json({ error: "Mahasiswa not found" });
        }
        await prisma.mahasiswaKategoriDisabilitas.deleteMany({
            where: { mahasiswa_id: Number(id) }
        });
        await prisma.mahasiswaJenisDisabilitas.deleteMany({
            where: { mahasiswa_id: Number(id) }
        });
        await prisma.mahasiswa.delete({
            where: { id: Number(id) }
        });
        res.status(200).json({ message: "Mahasiswa deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete mahasiswa" });
    }
};

const getAllFakultas = async (req, res) => {
    try {
        const data = await prisma.fakultas.findMany({
            orderBy: { nama: "asc" }
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat fakultas" });
    }
};

const getProdiByFakultas = async (req, res) => {
    try {
        const fakultasId = Number(req.query.fakultasId);

        if (!fakultasId) {
            return res.status(400).json({ message: "fakultasId diperlukan" });
        }

        const data = await prisma.prodi.findMany({
            where: { fakultas_id: fakultasId },
            orderBy: { nama: "asc" }
        });

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat prodi" });
    }
};

// const addFakultas = async (req, res) => {
//     try {
//         const { nama } = req.body;
//         if (!nama) {
//         return res.status(400).json({ message: "Nama fakultas diperlukan" });
//         }

//         const fakultas = await prisma.fakultas.create({
//         data: { nama },
//         });

//         res.status(201).json({ message: "Fakultas berhasil ditambahkan", fakultas });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Gagal menambahkan fakultas" });
//     }
// };

// const addProdi = async (req, res) => {
//     try {
//         const { nama, fakultas_id } = req.body;

//         if (!nama || !fakultas_id) {
//         return res.status(400).json({ message: "Nama prodi dan fakultas_id diperlukan" });
//         }

//         const fakultas = await prisma.fakultas.findUnique({
//         where: { id: Number(fakultas_id) },
//         });

//         if (!fakultas) {
//         return res.status(404).json({ message: "Fakultas tidak ditemukan" });
//         }

//         const prodi = await prisma.prodi.create({
//         data: {
//             nama,
//             fakultas_id: Number(fakultas_id),
//         },
//         });

//         res.status(201).json({ message: "Prodi berhasil ditambahkan", prodi });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Gagal menambahkan prodi" });
//     }
// };

const addFakultasProdi = async (req, res) => {
    try {
        const fakultasList = req.body;

        if (!Array.isArray(fakultasList)) {
        return res.status(400).json({ message: "Body harus berupa array fakultas" });
        }

        for (const fakultas of fakultasList) {
        const createdFakultas = await prisma.fakultas.create({
            data: {
            nama: fakultas.nama,
            prodi: {
                create: fakultas.prodi.map((p) => ({ nama: p })),
            },
            },
        });
        }

        res.status(201).json({ message: "Fakultas dan prodi berhasil ditambahkan" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan fakultas dan prodi" });
    }
};

module.exports = {
    getAllMahasiswa,
    getMahasiswaById,
    createMahasiswa,
    updateMahasiswa,
    deleteMahasiswa,
    getAllFakultas,
    getProdiByFakultas,
    // addFakultas,
    // addProdi
    addFakultasProdi
};