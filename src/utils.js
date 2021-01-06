// Iterate all possible (unordered) pairs in array
export function iteratePairs(array, callback) {
    for (let i = 0; i < array.length; i++) {
        const el1 = array[i]
        for (let j = i + 1; j < array.length; j++) {
            const el2 = array[j]
            callback(el1, el2)
        }
    }
}

export const rotate = (x, y, angle) => ({
    x: x * Math.cos(angle) - y * Math.sin(angle),
    y: y * Math.cos(angle) + x * Math.sin(angle)
})
