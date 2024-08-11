const { db } = require("./firebase");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const login = async (request, h) => {
  const { username, password } = request.payload;

  try {
    const userQuery = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    if (userQuery.empty) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    const doc = userQuery.docs[0];
    const user = doc.data();
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return h.response({ error: "Kata sandi tidak valid" }).code(401);
    }

    return h
      .response({ message: "Login berhasil", userId: user.userId })
      .code(200);
  } catch (error) {
    console.error("Kesalahan saat login:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

const register = async (request, h) => {
  const { firstName, lastName, username, password } = request.payload;

  try {
    // Check if username already exists
    const userQuery = await db
      .collection("users")
      .where("username", "==", username)
      .get();

    if (!userQuery.empty) {
      return h.response({ message: "Username telah tersedia" }).code(200); // Changed status to 200
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const userRef = db.collection("users").doc(userId);

    await userRef.set({
      userId,
      firstName,
      lastName,
      username,
      password: hashedPassword,
      durasiPerMinggu: 0,
      kaloriPerMinggu: 0,
      weight: null,
      height: null,
    });

    return h.response({ message: "Registrasi sukses", userId }).code(201);
  } catch (error) {
    console.error("Kesalahan saat registrasi:", error);
    return h.response({ message: "Kesalahan server internal" }).code(500);
  }
};

const getAllProfile = async (request, h) => {
  const { userId } = request.params;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    const user = doc.data();

    // Ambil semua entri dari sub-koleksi metrikLatihan terkait
    const snapshotMetrik = await doc.ref.collection("metrikLatihan").get();
    const metrikLatihan = [];

    snapshotMetrik.forEach((doc) => {
      metrikLatihan.push(doc.data());
    });

    user.metrikLatihan = metrikLatihan;

    return h.response(user).code(200);
  } catch (error) {
    console.error("Kesalahan saat mengambil profil:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

const updateProfile = async (request, h) => {
  const { userId } = request.params;
  const updates = request.payload;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    await userRef.update(updates);

    return h.response({ message: "Profil berhasil diperbarui" }).code(200);
  } catch (error) {
    console.error("Kesalahan saat memperbarui profil:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

const addmetrikBody = async (request, h) => {
  const { userId } = request.params;
  const { weight, height } = request.payload;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    await userRef.update({
      weight,
      height,
    });

    return h
      .response({ message: "Tinggi dan berat badan berhasil ditambahkan" })
      .code(200);
  } catch (error) {
    console.error("Kesalahan saat menambahkan metrik tubuh:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

const completeMovement = async (request, h) => {
  const { userId } = request.params;
  const {
    durasi,
    kalori,
    jamLatihan,
    tanggalBulanLatihan,
    bagianLatihan,
    tingkatanLatihan,
  } = request.payload;

  // URL gambar untuk setiap bagian latihan
  const imageUrls = {
    Kaki: "https://storage.googleapis.com/fitsync-image/kakii.png",
    Lengan: "https://storage.googleapis.com/fitsync-image/lengan.png",
    Dada: "https://storage.googleapis.com/fitsync-image/dada.png",
    Perut: "https://storage.googleapis.com/fitsync-image/perut.png",
  };

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    // Tentukan URL gambar berdasarkan bagianLatihan
    const imageUrl = imageUrls[bagianLatihan];

    // Tambahkan data latihan baru ke dalam metrikLatihan
    await doc.ref.collection("metrikLatihan").add({
      durasi,
      kalori,
      jamLatihan,
      tanggalBulanLatihan,
      bagianLatihan,
      tingkatanLatihan,
      imageUrl, // tambahkan URL gambar di sini
    });

    // Ambil semua entri metrikLatihan
    const snapshotMetrik = await doc.ref.collection("metrikLatihan").get();

    // Hitung total durasi dan kalori dari semua entri metrikLatihan
    let totalDurasi = 0;
    let totalKalori = 0;

    snapshotMetrik.forEach((doc) => {
      const data = doc.data();
      if (data.durasi) totalDurasi += data.durasi;
      if (data.kalori) totalKalori += data.kalori;
    });

    // Update dokumen pengguna dengan total durasi dan kalori per minggu yang baru dihitung
    await doc.ref.update({
      durasiPerMinggu: totalDurasi,
      kaloriPerMinggu: totalKalori,
    });

    return h.response({ message: "Data berhasil ditambahkan" }).code(200);
  } catch (error) {
    console.error("Kesalahan saat menambahkan data aktivitas:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

const getProfile = async (request, h) => {
  const { userId } = request.params;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    const user = doc.data();

    const profile = {
      firstName: user.firstName,
      lastName: user.lastName,
      weight: user.weight,
      height: user.height,
    };

    return h.response(profile).code(200);
  } catch (error) {
    console.error("Kesalahan saat mengambil profil:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

const getDashboard = async (request, h) => {
  const { userId } = request.params;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    const user = doc.data();

    // Ambil semua entri dari sub-koleksi metrikLatihan terkait
    const snapshotMetrik = await doc.ref.collection("metrikLatihan").get();
    const metrikLatihan = [];

    snapshotMetrik.forEach((doc) => {
      metrikLatihan.push(doc.data());
    });

    const dashboardData = {
      kaloriPerMinggu: user.kaloriPerMinggu,
      durasiPerMinggu: user.durasiPerMinggu,
      lastName: user.lastName,
      metrikLatihan,
    };

    return h.response(dashboardData).code(200);
  } catch (error) {
    console.error("Kesalahan saat mengambil data dashboard:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

const getBodyMetrics = async (request, h) => {
  const { userId } = request.params;

  try {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return h.response({ error: "Pengguna tidak ditemukan" }).code(404);
    }

    const user = doc.data();
    const bodyMetrics = {
      beratBadan: user.weight,
      tinggiBadan: user.height,
    };

    return h.response(bodyMetrics).code(200);
  } catch (error) {
    console.error("Kesalahan saat mendapatkan metrik tubuh:", error);
    return h.response({ error: "Kesalahan server internal" }).code(500);
  }
};

module.exports = {
  login,
  register,
  getAllProfile,
  updateProfile,
  addmetrikBody,
  completeMovement,
  getProfile,
  getDashboard,
  getBodyMetrics,
};
