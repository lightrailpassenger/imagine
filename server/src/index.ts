import express from "express";
import noop from "lodash/fp/noop.js";

import healthCheck from "./apis/healthCheck.js";
import createUserRoutes from "./apis/user.js";

import { pool } from "./daos/PgClient.js";
import UserOperations from "./daos/User.js";

import PasswordHasher from "./tools/PasswordHasher.js";

const app = express();
const port = 3000; // TODO: Move to config

const passwordHasher = new PasswordHasher();
const userOperations = new UserOperations(pool, passwordHasher);

const userRoutes = createUserRoutes(userOperations);

app.use(express.json({ limit: "1mb" }));
app.use("/users", userRoutes);
app.use("/health-check", healthCheck);

app.listen(port, noop);
