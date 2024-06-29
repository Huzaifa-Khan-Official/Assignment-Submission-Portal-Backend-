import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

// utiles
import connectDB from "./config/dbConfig.js";
import serverConfig from "./config/serverConfig.js";
import userRoutes from "./routes/userRoutes.js"


const port = serverConfig.PORT || 5000;

connectDB()
    .then(res => console.log("succesfully connected to database"))
    .catch(err => console.log("Error connecting to database"))

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.send("Hello World!");
})

app.listen(port, () => console.log(`Server listening on ${port}`));

export default app;