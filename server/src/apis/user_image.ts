import joi from "joi";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";

import { Router } from "express";

import createLoginMiddleware from "../middlewares/createLoginMiddleware.js";

import { isValidInput } from "../tools/Validator.js";

import type { ObjectSchema } from "joi";

import type UserOperations from "../daos/User.js";
import type UserImageOperations from "../daos/UserImage.js";
import type { ReqType } from "../middlewares/createLoginMiddleware.js";
import type JWTHandler from "../tools/JWTHandler.js";

const allowedMimeTypes = ["image/png", "image/jpeg"];

function createRouter(
    userOperations: UserOperations,
    userImageOperations: UserImageOperations,
    loginTokenHandler: JWTHandler
): Router {
    const router = Router();
    const upload = multer();

    router.post(
        "/",
        createLoginMiddleware(loginTokenHandler),
        upload.single("image"),
        async (req, res) => {
            try {
                const { isLoginSuccessful, clientSideId } = req as typeof req &
                    ReqType;

                if (!isLoginSuccessful) {
                    return res.status(401).send({
                        err: "Login Required",
                    });
                }

                const reqSchema: ObjectSchema<{
                    name?: string;
                }> = joi.object({
                    name: joi.string(),
                });
                const { value, error } = reqSchema.validate(req.body);

                if (error) {
                    return res.status(400).send({
                        err: "Bad Request",
                    });
                }

                const { name } = value;
                const image = req.file?.buffer;

                if (!image || (name && !isValidInput(name))) {
                    return res.status(400).send({
                        err: "Bad Request",
                    });
                }

                const fileType = await fileTypeFromBuffer(image);

                if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
                    return res.status(400).send({
                        err: "Bad Request",
                    });
                }

                const extension = `.${fileType.ext}`;
                const userId = await userOperations.getUserIdFromClientSideId(
                    clientSideId
                );

                if (!userId) {
                    return res.status(404).send({
                        err: "Not Found",
                    });
                }

                const { id: userImageId } = await userImageOperations.create(
                    userId,
                    image,
                    name ? `${name}${extension}` : undefined
                );

                return res.status(201).send({
                    id: userImageId,
                });
            } catch (err) {
                console.error(err);

                return res.status(500).send({
                    err: "Internal Server Error",
                });
            }
        }
    );

    return router;
}

export default createRouter;
