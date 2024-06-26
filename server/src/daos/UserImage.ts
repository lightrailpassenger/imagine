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

        try {
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
        } finally {
            client.release();
        }
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

        try {
            const { rows } = await client.query(
                `SELECT id, name
                 FROM user_images
                 WHERE user_id = $1`,
                [userId]
            );

            return rows.map(({ id, name }) => {
                const ext = extname(name);

                if (name.endsWith(ext)) {
                    return {
                        name: name.substring(0, name.length - ext.length),
                        id,
                    };
                }

                return { id, name };
            });
        } finally {
            client.release();
        }
    }

    async getImageById(id: string): Promise<{
        image: Buffer;
        name: string;
        userId: string;
    } | null> {
        const client = await this.#pool.connect();

        try {
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
        } finally {
            client.release();
        }
    }

    async deleteImage(
        id: string,
        userId: string
    ): Promise<{ existed: boolean }> {
        const client = await this.#pool.connect();

        try {
            const { rowCount } = await client.query(
                `DELETE FROM user_images
                 WHERE id = $1 AND user_id = $2`,
                [id, userId]
            );

            return { existed: rowCount > 0 }; // normally 0 or 1
        } finally {
            client.release();
        }
    }

    async shareImage(id: string, limit: number): Promise<{ token: string }> {
        const client = await this.#pool.connect();

        try {
            const { rows } = await client.query(
                `INSERT INTO image_share_links (
                     token,
                     total_limit,
                     image_id
                 ) VALUES ($1, $2, $3)
                 RETURNING token`,
                [
                    Buffer.from(randomBytes(512 / 8)).toString("base64"),
                    limit,
                    id,
                ]
            );
            const [{ token }] = rows;

            return { token };
        } finally {
            client.release();
        }
    }

    async getSharedLinksByImageId(imageId: string): Promise<
        {
            token: string;
            used: number;
            total: number;
        }[]
    > {
        const { rows } = await this.#pool.query(
            `SELECT
                token,
                used_limit AS used,
                total_limit AS total
            FROM user_images
            INNER JOIN image_share_links
            ON user_images.id = image_share_links.image_id
            WHERE
                user_images.id = $1 AND
                used_limit < total_limit
            ORDER BY image_share_links.created_at`,
            [imageId]
        );

        return rows;
    }

    async getVisitRecordsByImageShareLinkToken(
        token: string
    ): Promise<{ userAgent: string; visitedAt: Date }[]> {
        const { rows } = await this.#pool.query(
            `SELECT
                 user_agent AS "userAgent",
                 accessed_at AS "visitedAt"
             FROM visit_records
             WHERE link_token = $1
             ORDER BY accessed_at`,
            [token]
        );

        return rows;
    }

    async getImageOwnerUserIdByShareLinkToken(
        token: string | null
    ): Promise<string> {
        const {
            rows: [row],
        } = await this.#pool.query(
            `SELECT
                 user_id AS "userId"
             FROM user_images
             INNER JOIN image_share_links
             ON user_images.id = image_share_links.image_id
             WHERE image_share_links.token = $1`,
            [token]
        );

        return row?.userId ?? null;
    }

    async deleteShareLink(
        token: string,
        userId: string
    ): Promise<{ existed: boolean }> {
        const client = await this.#pool.connect();

        try {
            const { rowCount } = await client.query(
                `DELETE FROM image_share_links
                 USING user_images
                 WHERE
                     user_images.user_id = $1 AND
                     image_share_links.token = $2 AND
                     user_images.id = image_share_links.image_id`,
                [userId, token]
            );

            return { existed: rowCount > 0 };
        } finally {
            client.release();
        }
    }

    async getSharedImage(
        token: string,
        userAgent?: string
    ): Promise<{
        name: string;
        image: Buffer;
    } | null> {
        const client = await this.#pool.connect();

        try {
            await client.query("BEGIN");
            const { rows } = await client.query(
                `UPDATE image_share_links
                 SET used_limit = used_limit + 1
                 WHERE total_limit > used_limit AND token = $1
                 RETURNING image_id AS "imageId"`,
                [token]
            );
            const row = rows[0];

            if (!row) {
                await client.query("ROLLBACK");
                return null;
            }

            await client.query(
                `INSERT INTO visit_records (link_token, user_agent)
                VALUES ($1, $2)`,
                [token, userAgent ?? ""]
            );

            const { imageId } = row;
            const {
                rows: [imageRow],
            } = await client.query(
                `SELECT image, name
                 FROM user_images
                 WHERE id = $1 AND (expire_at IS NULL OR expire_at > NOW())`,
                [imageId]
            );

            if (imageRow) {
                await client.query("COMMIT");

                const { image, name } = imageRow;

                return { image, name };
            }

            await client.query("ROLLBACK");
            return null;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO
    async markVirusChecked(id: string): Promise<void> {
        // TODO
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO
    async markVirusCheckPending(id: string, pendingId: string): Promise<void> {
        // TODO
    }
}

export default UserImage;
