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

        return rows;
    }
}

export default UserImage;
