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

// Rotate (x,y) counter-clockwise around (0,0) with `sin` and `cos` precomputed from the same angle
export const rotateCounterClockwise = (x, y, sin, cos) => ({
    x: x * cos - y * sin,
    y: y * cos + x * sin
});

// Rotate (x,y) clockwise around (0,0) with `sin` and `cos` precomputed from the same angle
export const rotateClockwise = (x, y, sin, cos) => ({
    x: x * cos + y * sin,
    y: y * cos - x * sin
});
