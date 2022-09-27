const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 8080;

/* This is a middleware that allows the server to accept requests from a different origin. */
const corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/* Listening to the port that is set in the environment. */
app.listen(PORT, () => console.log(`listening to ${PORT}`));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Team Psyduck API." });
});