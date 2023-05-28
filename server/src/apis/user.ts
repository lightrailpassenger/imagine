import joi from "joi";

import { Router } from "express";

import { isValidInput } from "../tools/Validator.js";

import type { ObjectSchema } from "joi";

import type UserOperations from "../daos/User.js";

function createRouter(userOperations: UserOperations): Router {
    const router = Router();

    router.post("/", async (req, res) => {
        try {
            const reqSchema: ObjectSchema<{
                username: string;
                password: string;
            }> = joi.object({
                username: joi.string().required(),
                password: joi.string().required(),
            });
            const { value, error } = reqSchema.validate(req.body);

            if (error) {
                return res.status(400).send({
                    err: "Bad Request",
                });
            }

            const { username, password } = value;

            if (!isValidInput(username) || !isValidInput(password)) {
                return res.status(400).send({
                    err: "Bad Request",
                });
            }

            const { isCreated, isLoginSuccessful, clientSideId } =
                await userOperations.create(username, password);

            console.info({
                isCreated,
                isLoginSuccessful,
            });

            return res.status(200).send({
                id: clientSideId,
            });
        } catch (err) {
            console.error(err);

            return res.status(500).send({
                err: "Internal Server Error",
            });
        }
    });

    return router;
}

export default createRouter;
