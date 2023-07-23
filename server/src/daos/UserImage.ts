import { randomBytes } from "node:crypto";
import { extname } from "node:path";

import type { Pool } from "pg";

class UserImage {
    #pool: Pool;

    constructor(pool: Pool) {
        this.#pool = pool;
    }

    async create(
        userId: string,
        image: Buffer,
        name = "Untitled",
        expireAt?: Date
    ): Promise<{ id: string }> {
        const client = await this.#pool.connect();
        const { rows } = await client.query(
            `INSERT INTO user_images (
                user_id,
                image,
                name,
                expire_at
            ) VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [userId, image, name, expireAt]
        );

        return { id: rows[0].id };
    }

    async renameImage(
        id: string,
        options: {
            userId: string;
            newName: string;
        }
    ): Promise<{ oldName: string } | null> {
        const client = await this.#pool.connect();

        try {
            await client.query("BEGIN");

            const { userId } = options;
            const { rows } = await client.query(
                `SELECT name
                 FROM user_images
                 WHERE user_id = $1 AND id = $2
                 FOR UPDATE`,
                [userId, id]
            );

            if (!rows[0]) {
                await client.query("ROLLBACK");

                return null;
            }

            const { name } = rows[0];
            const extension = extname(name);
            const newName = `${options.newName}${extension}`;

            await client.query(
                `UPDATE user_images
                 SET name = $1
                 WHERE user_id = $2 AND id = $3`,
                [newName, userId, id]
            );
            await client.query("COMMIT");

            return { oldName: name };
        } catch (err) {
            await client.query("ROLLBACK");

            throw err;
        } finally {
            client.release();
        }
    }

    async getImageByUserId(userId: string): Promise<
        {
            id: string;
            name: string;
        }[]
    > {
        const client = await this.#pool.connect();
        const { rows } = await client.query(
            `SELECT id, name
             FROM user_images
             WHERE user_id = $1`,
            [userId]
        );

        return rows.map(({ id, name }) => ({ id, name }));
    }

    async getImageById(id: string): Promise<{
        image: Buffer;
        name: string;
        userId: string;
    } | null> {
        const client = await this.#pool.connect();
        const { rows } = await client.query(
            `SELECT user_id AS "userId", image, name
            FROM user_images
            WHERE id = $1`,
            [id]
        );

        return rows[0]
            ? {
                  image: rows[0].image,
                  name: rows[0].name,
                  userId: rows[0].userId,
              }
            : null;
    }

    async deleteImage(
        id: string,
        userId: string
    ): Promise<{ existed: boolean }> {
        const client = await this.#pool.connect();
        const { rowCount } = await client.query(
            `DELETE FROM user_images
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        return { existed: rowCount > 0 }; // normally 0 or 1
    }

    async shareImage(id: string, limit: number): Promise<{ token: string }> {
        const client = await this.#pool.connect();
        const { rows } = await client.query(
            `INSERT INTO image_share_links (
                 token,
                 total_limit,
                 image_id
             ) VALUES ($1, $2, $3)
             RETURNING token`,
            [Buffer.from(randomBytes(512 / 8)).toString("base64"), limit, id]
        );
        const [{ token }] = rows;

        return { token };
    }
}

export default UserImage;
