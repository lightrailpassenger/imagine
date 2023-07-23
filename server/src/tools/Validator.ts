import joi from "joi";

const isUUID = (input: unknown): boolean => {
    const schema = joi.string().uuid();
    const { error } = schema.validate(input);

    return !error;
};

const isValidInput = (input: string): boolean => {
    const normalized = input.normalize();

    return normalized === input && Boolean(input.match(/^[\x20-\x7E]{8,512}$/));
};

export { isUUID, isValidInput };
