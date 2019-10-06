/*Funkcja ustawiająca nowe nazwy właściwości */
exports.renameProperties = (
    oldProp1,
    newProp1,
    oldProp2,
    newProp2,
    { [oldProp1]: old1, [oldProp2]: old2 }
) => {
    return {
        [newProp1]: old1.toLowerCase(),
        [newProp2]: old2
    };
};