import type { Pool } from "pg";

import type PasswordHasher from "../tools/PasswordHasher.js";

class User {
    #pool: Pool;
    #passwordHasher: PasswordHasher;

    constructor(pool: Pool, passwordHasher: PasswordHasher) {
        this.#pool = pool;
        this.#passwordHasher = passwordHasher;
    }

    async create(
        name: string,
        password: string
    ): Promise<{
        isCreated: boolean;
        isLoginSuccessful: boolean;
        id: string;
        clientSideId: string;
    }> {
        const client = await this.#pool.connect();

        try {
            await client.query("BEGIN");
            const { rowCount } = await client.query(
                `INSERT INTO users (name) VALUES ($1)
                 ON CONFLICT DO NOTHING`,
                [name]
            );
            const isCreated = rowCount !== 0;

            const {
                rows: [{ id, clientSideId }],
            } = await client.query(
                `SELECT id, client_side_id AS "clientSideId"
                 FROM users
                 WHERE name = $1`,
                [name]
            );
            const {
                rows: [existingPasswordRow],
            } = await client.query(
                `SELECT password_hash AS hash, salt
                 FROM user_passwords
                 WHERE user_id = $1`,
                [id]
            );

            const newSalt = await this.#passwordHasher.getSalt();
            const newSaltString = newSalt.toString("hex");
            const correctSaltString = existingPasswordRow
                ? existingPasswordRow.salt
                : newSaltString;
            const correctSalt = Buffer.from(correctSaltString, "hex");
            const passwordHash = await this.#passwordHasher.hashPassword(
                password,
                correctSalt
            );
            const correctHash = existingPasswordRow
                ? existingPasswordRow.hash
                : passwordHash;
            const { successful } = await this.#passwordHasher.verifyPassword(
                passwordHash,
                correctHash
            );

            await client.query(
                `INSERT INTO user_passwords (user_id, password_hash, salt)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING`,
                [id, correctHash.toString("hex"), correctSaltString]
            );
            await client.query("COMMIT");

            return {
                isCreated,
                isLoginSuccessful: successful,
                id,
                clientSideId,
            };
        } catch (err) {
            await client.query("ROLLBACK");

            throw err;
        } finally {
            client.release();
        }
    }
}

export default User;
