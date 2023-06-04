import * as jose from "jose";

const expiration = "15m" as const;
const alg = "HS256" as const;
const issuer = "imagine:login:server";
const audience = "imagine:login:user";

class JWTHandler {
    #key: Uint8Array;

    constructor(key: string) {
        this.#key = new TextEncoder().encode(key);
    }

    async issue(obj: { [key: string]: unknown }): Promise<string> {
        const jwt = await new jose.SignJWT(obj)
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setIssuer(issuer)
            .setAudience(audience)
            .setExpirationTime(expiration)
            .sign(this.#key);

        return jwt;
    }

    async verify(
        jwt: string
    ): Promise<
        { ok: false } | { ok: true; content: { [key: string]: unknown } }
    > {
        try {
            const { payload, protectedHeader } = await jose.jwtVerify(
                jwt,
                this.#key,
                { issuer, audience }
            );
            const isProtectedHeaderAlgorithmMatch = protectedHeader.alg === alg;

            return { ok: isProtectedHeaderAlgorithmMatch, content: payload };
        } catch (err) {
            return { ok: false };
        }
    }
}

export default JWTHandler;
