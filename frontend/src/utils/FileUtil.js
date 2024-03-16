const getNameWithoutExtension = (name) => {
    const index = name.indexOf(".");

    if (index <= 0) {
        return name;
    } else {
        return name.substring(0, index);
    }
};

export { getNameWithoutExtension };
