import joi from "joi";

const isUUID = (input: unknown): boolean => {
    const schema = joi.string().uuid();
    const { error } = schema.validate(input);

    return !error;
};

const isValidInput = (input: string, minLength = 8): boolean => {
    const normalized = input.normalize();
    const regex = new RegExp(`^[\\x20-\\x7E]{${minLength},512}$`, "g");

    return normalized === input && Boolean(input.match(regex));
};

export { isUUID, isValidInput };
