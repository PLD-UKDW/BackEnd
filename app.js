const express = require('express')
const ENV = require('dotenv').config()
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes =[
    require("./src/routes/statsFilteringRoutes"),
    require("./src/routes/beritaRoutes"),
    require("./src/routes/mahasiswaRoutes"),
    require("./src/routes/loginRoutes"),
    require("./src/routes/testRoutes"),
];

routes.forEach(route => app.use(route));

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

module.exports = app