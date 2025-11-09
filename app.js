const express = require('express')
const env = require('dotenv').config()
const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes =[
    require("./src/routes/statsFilteringRoutes"),
    require("./src/routes/beritaRoutes"),
    require("./src/routes/mahasiswaRoutes"),
];

routes.forEach(route => app.use(route));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

module.exports = app