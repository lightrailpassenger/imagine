import pg from "pg";

import config from "../../schemas/config/config.json" assert { type: "json" };

const environment = (process.env.NODE_ENV ?? "development") as "development";
const dbConfig = config[environment];
const { username, password, database, host, port } = dbConfig;

const pool = new pg.Pool({
    user: username,
    password: password ?? undefined,
    database,
    host,
    port,
});

export { pool };
