import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const scryptConfig = {
    cost: 2 ** 14,
    blockSize: 8,
    parallelization: 5,
} as const;
const scryptKeyLength = 64 as const;
const saltLength = 64 as const;

class PasswordHasher {
    async getSalt(): Promise<Buffer> {
        return new Promise((res, rej) => {
            randomBytes(saltLength, (err, buf) => {
                if (buf) {
                    res(buf);
                } else {
                    rej(err);
                }
            });
        });
    }

    async hashPassword(password: string, salt: Buffer): Promise<Buffer> {
        return await new Promise((res, rej) => {
            scrypt(
                password,
                salt,
                scryptKeyLength,
                scryptConfig,
                (err, key) => {
                    if (key) {
                        res(key);
                    } else {
                        rej(err);
                    }
                }
            );
        });
    }

    async verifyPassword(
        inputHash: Buffer,
        hash: string
    ): Promise<{
        successful: boolean;
    }> {
        const comparingHashBuffer = Buffer.from(hash, "hex");
        const same = timingSafeEqual(inputHash, comparingHashBuffer);

        return { successful: same };
    }
}

export default PasswordHasher;
