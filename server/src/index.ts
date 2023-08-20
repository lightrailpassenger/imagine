import express from "express";

import config from "config";

import healthCheck from "./apis/health-check.js";
import createUserRoutes from "./apis/user.js";
import createUserImageRoutes from "./apis/user-image.js";

import { pool } from "./daos/PgClient.js";
import UserOperations from "./daos/User.js";
import UserImageOperations from "./daos/UserImage.js";

import JWTHandler from "./tools/JWTHandler.js";
import PasswordHasher from "./tools/PasswordHasher.js";

const app = express();
const port = 3000; // TODO: Move to config

const passwordHasher = new PasswordHasher();
const userOperations = new UserOperations(pool, passwordHasher);
const userImageOperations = new UserImageOperations(pool);
const loginTokenHandler = new JWTHandler(config.get("login.jwtKey"));

const userRoutes = createUserRoutes(userOperations, loginTokenHandler);
const userImageRoutes = createUserImageRoutes(
    userOperations,
    userImageOperations,
    loginTokenHandler
);

if (process.env.NODE_ENV === "development") {
    app.use((req, res, next) => {
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Allow-Origin", "http://localhost:5173");
        next();
    });
}

app.use(express.json({ limit: "1mb" }));
app.use("/users", userRoutes);
app.use("/user-images", userImageRoutes);
app.use("/health-check", healthCheck);

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
