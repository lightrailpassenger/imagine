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

const allowedMimeTypes = ["image/png", "image/jpeg"] as const;

type AllowedMimeType = (typeof allowedMimeTypes)[number];

function getContentTypeFromName(name: string): AllowedMimeType {
    if (name.endsWith(".png")) {
        return "image/png";
    } else if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
        return "image/jpeg";
    }

    throw new Error(`Unsupported name: ${name}`);
}

function createRouter(
    userOperations: UserOperations,
    userImageOperations: UserImageOperations,
    loginTokenHandler: JWTHandler
): Router {
    const router = Router();
    const upload = multer();

    router.get(
        "/",
        createLoginMiddleware(loginTokenHandler),
        async (req, res) => {
            try {
                const { isLoginSuccessful, clientSideId } = req as typeof req &
                    ReqType;

                if (!isLoginSuccessful) {
                    return res.status(401).send({
                        err: "Login Required",
                    });
                }

                const userId = await userOperations.getUserIdFromClientSideId(
                    clientSideId
                );

                if (!userId) {
                    return res.status(401).send({
                        err: "Login Required",
                    });
                }

                const images = await userImageOperations.getImageByUserId(
                    userId
                );

                return res.status(200).send({
                    images,
                });
            } catch (err) {
                console.error(err);

                return res.status(500).send({
                    err: "Internal Server Error",
                });
            }
        }
    );

    router.get(
        "/:id",
        createLoginMiddleware(loginTokenHandler),
        async (req, res) => {
            try {
                const { isLoginSuccessful, clientSideId } = req as typeof req &
                    ReqType;

                if (!isLoginSuccessful) {
                    return res.status(401).send({
                        err: "Login Required",
                    });
                }

                const { id } = req.params;

                if (!id || typeof id !== "string") {
                    return res.status(400).send({
                        err: "Bad Request",
                    });
                }

                const userId = await userOperations.getUserIdFromClientSideId(
                    clientSideId
                );

                if (!userId) {
                    return res.status(401).send({
                        err: "Login Required",
                    });
                }

                const imageInfo = await userImageOperations.getImageById(id);

                if (!imageInfo || imageInfo.userId !== userId) {
                    return res.status(404).send({
                        err: "Not Found",
                    });
                }

                const { name, image } = imageInfo;

                res.set({
                    "Content-Type": getContentTypeFromName(name),
                });

                return res.send(image);
            } catch (err) {
                console.error(err);

                return res.status(500).send({
                    err: "Internal Server Error",
                });
            }
        }
    );

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

                if (
                    !fileType ||
                    !(
                        allowedMimeTypes satisfies readonly string[] as readonly string[]
                    ).includes(fileType.mime)
                ) {
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
