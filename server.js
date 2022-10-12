const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser')
const colors = require("colors");
const morgan = require("morgan");

const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./database/connection");

const PORT = process.env.PORT || 8080;

// Connect to database
connectDB();

/* This is a middleware that allows the server to accept requests from a different origin. */
const corsOptions = {
    origin: "*"
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

/* Listening to the port that is set in the environment. */
app.listen(PORT, () => console.log(`listening to ${PORT}`));

// HTTP request logger
app.use(morgan("dev"));

// Routes
require('./routes')(app);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Team Psyduck API." });
});



app.use(errorHandler);