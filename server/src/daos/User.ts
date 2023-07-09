import { randomUUID } from "crypto";

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
        username: string,
        password: string
    ): Promise<{
        clientSideId: string | null;
    }> {
        const client = await this.#pool.connect();

        try {
            await client.query("BEGIN");
            const { rows, rowCount } = await client.query(
                `INSERT INTO users (name) VALUES ($1)
                 ON CONFLICT DO NOTHING
                 RETURNING id, client_side_id AS "clientSideId"`,
                [username]
            );
            const isCreated = rowCount !== 0;

            if (isCreated) {
                const [{ id, clientSideId }] = rows;
                const newSalt = await this.#passwordHasher.getSalt();
                const newSaltString = newSalt.toString("hex");
                const passwordHash = await this.#passwordHasher.hashPassword(
                    password,
                    newSalt
                );

                await client.query(
                    `INSERT INTO user_passwords (user_id, password_hash, salt)
                    VALUES ($1, $2, $3)
                    ON CONFLICT DO NOTHING`,
                    [id, passwordHash.toString("hex"), newSaltString]
                );
                await client.query("COMMIT");

                return { clientSideId };
            }

            await client.query("ROLLBACK");

            return { clientSideId: null };
        } catch (err) {
            await client.query("ROLLBACK");

            throw err;
        } finally {
            client.release();
        }
    }

    async getUserIdFromClientSideId(
        clientSideId: string
    ): Promise<string | null> {
        const client = await this.#pool.connect();
        const { rows } = await client.query(
            `SELECT id FROM users WHERE client_side_id = $1`,
            [clientSideId]
        );

        return rows.length > 0 ? rows[0].id : null;
    }

    async login(
        username: string,
        password: string
    ): Promise<{ isLoginSuccessful: boolean; clientSideId: string }> {
        const client = await this.#pool.connect();

        try {
            await client.query("BEGIN");
            const placeHolderId = randomUUID();
            const {
                rowCount,
                rows: [
                    { id, clientSideId } = {
                        id: placeHolderId,
                        clientSideId: placeHolderId,
                    },
                ],
            } = await client.query(
                `SELECT id, client_side_id AS "clientSideId"
                 FROM users
                 WHERE name = $1`,
                [username]
            );
            const hasUser = rowCount === 1;
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
            const correctSaltString =
                hasUser && existingPasswordRow
                    ? existingPasswordRow.salt
                    : newSaltString;
            const correctSalt = Buffer.from(correctSaltString, "hex");
            const passwordHash = await this.#passwordHasher.hashPassword(
                password,
                correctSalt
            );
            const correctHash =
                hasUser && existingPasswordRow
                    ? existingPasswordRow.hash
                    : passwordHash;
            const { successful } = await this.#passwordHasher.verifyPassword(
                passwordHash,
                correctHash
            );

            await client.query("COMMIT");

            return {
                isLoginSuccessful: Boolean(
                    hasUser && existingPasswordRow && successful
                ),
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
