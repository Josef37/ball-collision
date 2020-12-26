import { expect } from "chai"
import { iteratePairs, rotateClockwise, rotateCounterClockwise } from "./utils"
import sinon from "sinon"

describe("iteratePairs", () => {
    const callback = sinon.fake()

    afterEach(() => {
        sinon.reset()
    })

    it("does no call for an empty array", () => {
        iteratePairs([], callback)
        expect(callback.callCount).to.equal(0)
    })

    it("does no call for an one-element array", () => {
        iteratePairs([1], callback)
        expect(callback.callCount).to.equal(0)
    })

    it("does one call for an two-element array", () => {
        iteratePairs([1, 2], callback)
        expect(callback.calledWithExactly(1, 2)).to.be.true
    })

    it("does the right amount of calls for an n-element array", () => {
        for (const length of [5, 10, 30]) {
            const expectedCallCount = length * (length - 1) / 2
            iteratePairs(Array(length).fill(0), callback)
            expect(callback.callCount).to.equal(expectedCallCount)
            callback.resetHistory()
        }
    })
})

describe("rotateCounterClockwise", () => {
    it("does not rotate for 0 degrees", () => {
        expectCounterClockwiseRotation({
            pos: { x: 1, y: 2 },
            angle: 0,
            expected: { x: 1, y: 2 }
        })
    })

    it("does rotate correctly 90 degrees", () => {
        expectCounterClockwiseRotation({
            pos: { x: 1, y: 0 },
            angle: Math.PI / 2,
            expected: { x: 0, y: 1 }
        })
    })

    it("does rotate correctly 45 degrees", () => {
        expectCounterClockwiseRotation({
            pos: { x: 1, y: 0 },
            angle: Math.PI / 4,
            expected: { x: Math.SQRT1_2, y: Math.SQRT1_2 }
        })
    })

    it("does rotate correctly 360 degrees", () => {
        expectCounterClockwiseRotation({
            pos: { x: 1, y: 2 },
            angle: Math.PI * 2,
            expected: { x: 1, y: 2 }
        })
    })

    function expectCounterClockwiseRotation({ pos: { x, y }, angle, expected }) {
        ({ x, y } = rotateCounterClockwise(x, y, Math.sin(angle), Math.cos(angle)))
        expect(x).to.be.closeTo(expected.x, 1e-8)
        expect(y).to.be.closeTo(expected.y, 1e-8)
    }
})

describe("rotateClockwise", () => {
    it("does not rotate for 0 degrees", () => {
        expectClockwiseRotation({
            pos: { x: 1, y: 2 },
            angle: 0,
            expected: { x: 1, y: 2 }
        })
    })

    it("does rotate correctly 90 degrees", () => {
        expectClockwiseRotation({
            pos: { x: 1, y: 0 },
            angle: Math.PI / 2,
            expected: { x: 0, y: -1 }
        })
    })

    it("does rotate correctly 45 degrees", () => {
        expectClockwiseRotation({
            pos: { x: 1, y: 0 },
            angle: Math.PI / 4,
            expected: { x: Math.SQRT1_2, y: -1 * Math.SQRT1_2 }
        })
    })

    it("does rotate correctly 360 degrees", () => {
        expectClockwiseRotation({
            pos: { x: 1, y: 2 },
            angle: Math.PI * 2,
            expected: { x: 1, y: 2 }
        })
    })

    function expectClockwiseRotation({ pos: { x, y }, angle, expected }) {
        ({ x, y } = rotateClockwise(x, y, Math.sin(angle), Math.cos(angle)))
        expect(x).to.be.closeTo(expected.x, 1e-8)
        expect(y).to.be.closeTo(expected.y, 1e-8)
    }
})