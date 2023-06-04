import type * as express from "express";

import type JWTHandler from "../tools/JWTHandler.js";

const createLoginMiddleware = (
    loginTokenHandler: JWTHandler
): express.RequestHandler => {
    return async (req, res, next) => {
        try {
            const authHeader = req.get("Authorization");
            const jwt = authHeader?.startsWith("Bearer ")
                ? authHeader.substring(7)
                : null;

            if (jwt) {
                const result = await loginTokenHandler.verify(jwt);

                if (result.ok) {
                    const clientSideId = result.content.clientSideId;

                    if (typeof clientSideId === "string") {
                        Object.assign(req, {
                            isLoginSuccessful: true,
                            clientSideId,
                        });

                        return next();
                    }
                }
            }

            Object.assign(res, { isLoginSuccessful: false });

            return next();
        } catch (err) {
            console.error(err);

            return res.status(500).send({
                err: "Internal Server Error",
            });
        }
    };
};

type ReqType = {
    isLoginSuccessful: boolean;
    clientSideId: string;
};
export type { ReqType };
export default createLoginMiddleware;
