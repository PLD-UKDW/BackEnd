const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all mahasiswa --> untuk admin aja
const getAllMahasiswa = async (req, res) => {
    try {
        const mahasiswa = await prisma.mahasiswa.findMany({
            include: {
                fakultas: {
                    select: {
                        id: true,
                        nama: true
                    }
                },
                prodi: {
                    select: {
                        id: true,
                        nama: true
                    }
                }
            }
        });
        res.status(200).json(mahasiswa);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mahasiswa' });
    }
};


// Get mahasiswa by ID --> untuk admin aja
const getMahasiswaById = async (req, res) => {
    const { id } = req.params;
    try {
        const mahasiswa = await prisma.mahasiswa.findUnique({
            where: { id: parseInt(id) },
        });
        if (mahasiswa) {
            res.status(200).json(mahasiswa);
        } else {
            res.status(404).json({ error: 'Mahasiswa not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mahasiswa' });
    }
};

module.exports = {
    getAllMahasiswa,
    getMahasiswaById,
};