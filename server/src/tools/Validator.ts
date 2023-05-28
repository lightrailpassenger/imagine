const isValidInput = (input: string): boolean => {
    const normalized = input.normalize();

    return normalized === input && Boolean(input.match(/^[\x20-\x7E]{8,512}$/));
};

export { isValidInput };
