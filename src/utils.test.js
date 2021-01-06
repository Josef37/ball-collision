import { expect } from 'chai'
import { iteratePairs, rotate } from './utils'
import sinon from 'sinon'

const roundingError = 1e-8

describe('iteratePairs', () => {
  const callback = sinon.fake()

  afterEach(() => {
    sinon.reset()
  })

  it('does no call for an empty array', () => {
    iteratePairs([], callback)
    expect(callback.callCount).to.equal(0)
  })

  it('does no call for an one-element array', () => {
    iteratePairs([1], callback)
    expect(callback.callCount).to.equal(0)
  })

  it('does one call for an two-element array', () => {
    iteratePairs([1, 2], callback)
    expect(callback.calledWithExactly(1, 2)).to.equal(true)
  })

  it('does the right amount of calls for an n-element array', () => {
    for (const length of [5, 10, 30]) {
      const expectedCallCount = length * (length - 1) / 2
      iteratePairs(Array(length).fill(0), callback)
      expect(callback.callCount).to.equal(expectedCallCount)
      callback.resetHistory()
    }
  })
})

describe('rotate', () => {
  it('does not rotate for 0 degrees', () => {
    expectRotation({
      pos: { x: 1, y: 2 },
      angle: 0,
      expected: { x: 1, y: 2 }
    })
  })

  it('does rotate correctly 90 degrees', () => {
    expectRotation({
      pos: { x: 1, y: 0 },
      angle: Math.PI / 2,
      expected: { x: 0, y: 1 }
    })
  })

  it('does rotate correctly 45 degrees', () => {
    expectRotation({
      pos: { x: 1, y: 0 },
      angle: Math.PI / 4,
      expected: { x: Math.SQRT1_2, y: Math.SQRT1_2 }
    })
  })

  it('does rotate correctly 360 degrees', () => {
    expectRotation({
      pos: { x: 1, y: 2 },
      angle: Math.PI * 2,
      expected: { x: 1, y: 2 }
    })
  })

  it('does rotate correctly -45 degrees', () => {
    expectRotation({
      pos: { x: 1, y: 0 },
      angle: -Math.PI / 4,
      expected: { x: Math.SQRT1_2, y: -1 * Math.SQRT1_2 }
    })
  })

  function expectRotation ({ pos: { x, y }, angle, expected }) {
    ({ x, y } = rotate(x, y, angle))
    expect(x).to.be.closeTo(expected.x, roundingError)
    expect(y).to.be.closeTo(expected.y, roundingError)
  }
})
