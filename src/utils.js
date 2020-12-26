// Iterate all possible (unordered) pairs in array
export function iteratePairs(array, callback) {
    for (let i = 0; i < array.length; i++) {
        const el1 = array[i];
        for (let j = i + 1; j < array.length; j++) {
            const el2 = array[j];
            callback(el1, el2);
        }
    }
}

export const intersects = (rectA, rectB) => {
    return !(
        rectA.x + rectA.width < rectB.x ||
        rectB.x + rectB.width < rectA.x ||
        rectA.y + rectA.height < rectB.y ||
        rectB.y + rectB.height < rectA.y
    );
};
