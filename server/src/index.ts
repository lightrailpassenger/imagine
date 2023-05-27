import express from "express";
import noop from "lodash/fp/noop.js";

import healthCheck from "./apis/healthCheck.js";

const app = express();
const port = 3000; // TODO: Move to config

app.use("/health-check", healthCheck);
app.listen(port, noop);
