require("dotenv").config();
const express = require("express");
const studentRoutes = require("./src/routes/studentRoutes");
const connectDB = require("./src/connection/conn");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/", studentRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
