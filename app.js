const express = require('express')
const ENV = require('dotenv').config()
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (images) statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const routes =[
    require("./src/routes/statsFilteringRoutes"),
    require("./src/routes/beritaRoutes"),
    require("./src/routes/mahasiswaRoutes"),
    require("./src/routes/loginRoutes"),
    require("./src/routes/testRoutes"),
    require("./src/routes/adminRoutes"),
];

routes.forEach(route => app.use(route));

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

module.exports = app

// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// // ROUTES
// const loginRoute = require("./routes/login");
// const testRoute = require("./routes/test");
// const questionRoutes = require("./routes/question");
// const adminRoutes = require("./routes/admin");
// const publicRoutes = require("./routes/public");

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// app.use("/api/public", publicRoutes);
// app.use("/api/login", loginRoute);
// app.use("/api/test", testRoute);
// app.use("/api/questions", questionRoutes);
// app.use("/api/admin", adminRoutes);

// // Health check
// app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));



// const express = require("express");
// const dotenv = require("dotenv").config();
// const cors = require("cors");
// const bodyParser = require("body-parser");

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));

// // PREFIX ROUTES
// app.use("/api", require("./routes/loginRoutes"));
// app.use("/api/test", require("./routes/testRoutes"));

// // ➕ TAMBAHKAN INI
// // app.use("/api/admin", require("./routes/adminRoutes"));

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// module.exports = app;

