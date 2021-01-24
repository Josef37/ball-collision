import { expect } from 'chai'
import _ from 'lodash'
import Ball from './Ball'
import collideBalls, { collideBallsElastic, collideBallsInelastic, testables } from './collideBalls'

const roundingError = 1e-8

describe('collideBalls', () => {
  describe('touching collision', () => {
    it('works for one-dimensional collision with equal velocities', () => {
      const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
      const ball2 = new Ball({ x: 2, vx: -1, radius: 1 })
      collideBallsElastic([ball1, ball2])
      expect(ball1.vx).to.equal(-1)
      expect(ball2.vx).to.equal(1)
    })

    it('works for one-dimensional collision with different velocities', () => {
      const ball1 = new Ball({ x: 0, vx: 2, radius: 1 })
      const ball2 = new Ball({ x: 2, vx: -1, radius: 1 })
      collideBallsElastic([ball1, ball2])
      expect(ball1.vx).to.equal(-1)
      expect(ball2.vx).to.equal(2)
    })

    it('works for one-dimensional collision with different masses', () => {
      const ball1 = new Ball({ x: 0, vx: 1, radius: 1, mass: 2 })
      const ball2 = new Ball({ x: 2, vx: -1, radius: 1, mass: 1 })
      collideBallsElastic([ball1, ball2])
      expect(ball1.vx).to.be.closeTo(-1 / 3, roundingError)
      expect(ball2.vx).to.be.closeTo(5 / 3, roundingError)
    })

    it('works in y-direction', () => {
      const ball1 = new Ball({ y: 0, vy: 2, radius: 1 })
      const ball2 = new Ball({ y: 2, vy: -1, radius: 1 })
      collideBallsElastic([ball1, ball2])
      expect(ball1.vy).to.equal(-1)
      expect(ball2.vy).to.equal(2)
    })

    it('works for non-center collisions', () => {
      const ball1 = new Ball({ vx: 1, radius: 1 })
      const ball2 = new Ball({ x: 1.2, y: 1.6, radius: 1 })
      collideBallsElastic([ball1, ball2])
      expect(ball2.vy / ball2.vx).to.be.closeTo(ball2.y / ball2.x, roundingError, 'ball2 direction')
      expect(ball1.vy / ball1.vx).to.be.closeTo(-ball2.x / ball2.y, roundingError, 'ball1 direction')
    })

    it('preserves kinetic energy', () => {
      const numberOfTests = 10
      testRandomCollisions(numberOfTests, (ball1, ball2) => {
        const kineticEnergyBefore = ball1.kineticEnergy + ball2.kineticEnergy

        collideBallsElastic([ball1, ball2])

        const kineticEnergyAfter = ball1.kineticEnergy + ball2.kineticEnergy
        expect(kineticEnergyBefore).to.be.closeTo(kineticEnergyAfter, roundingError)
      })
    })

    it('preserves momentum', () => {
      const numberOfTests = 10
      testRandomCollisions(numberOfTests, (ball1, ball2) => {
        const momentumXBefore = ball1.mass * ball1.vx + ball2.mass * ball2.vx
        const momentumYBefore = ball1.mass * ball1.vy + ball2.mass * ball2.vy
        collideBallsElastic([ball1, ball2])
        const momentumXAfter = ball1.mass * ball1.vx + ball2.mass * ball2.vx
        const momentumYAfter = ball1.mass * ball1.vy + ball2.mass * ball2.vy
        expect(momentumXBefore).to.be.closeTo(momentumXAfter, roundingError)
        expect(momentumYBefore).to.be.closeTo(momentumYAfter, roundingError)
      })
    })
  })

  describe('overlapping collision', () => {
    it('works for one-dimensional collision with equal velocities', () => {
      const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
      const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
      collideBallsElastic([ball1, ball2])
      expect(ball1.vx).to.equal(-1)
      expect(ball2.vx).to.equal(1)
      expect(ball1.x).to.equal(-1)
      expect(ball2.x).to.equal(2)
    })
  })

  describe('inelastic collision', () => {
    it('collides totally inelastic in x-direction', () => {
      const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
      const ball2 = new Ball({ x: 2, vx: -1, radius: 1 })
      collideBallsInelastic([ball1, ball2])
      expect(ball1.vx).to.equal(ball2.vx).to.equal(0)
    })

    it('collides totally inelastic in y-direction', () => {
      const ball1 = new Ball({ y: 0, vy: 1, radius: 1 })
      const ball2 = new Ball({ y: 2, vy: -1, radius: 1 })
      collideBallsInelastic([ball1, ball2])
      expect(ball1.vy).to.equal(ball2.vy).to.equal(0)
    })

    it('collides totally inelastic in two dimensions', () => {
      const ball1 = new Ball({ x: 0, y: 0, vx: 1, vy: 1, radius: 1 })
      const ball2 = new Ball({ x: Math.SQRT2 - 0.01, y: Math.SQRT2 - 0.01, vx: -1, vy: -1, radius: 1 })
      collideBallsInelastic([ball1, ball2])
      expect(ball1.vx).to.be.closeTo(ball2.vx, roundingError)
      expect(ball1.vy).to.be.closeTo(ball2.vy, roundingError)
      expect(ball1.vx).to.be.closeTo(0, roundingError)
      expect(ball1.vy).to.be.closeTo(0, roundingError)
    })

    it('preserves momentum', () => {
      const numberOfTests = 10
      testRandomCollisions(numberOfTests, (ball1, ball2) => {
        const momentumXBefore = ball1.mass * ball1.vx + ball2.mass * ball2.vx
        const momentumYBefore = ball1.mass * ball1.vy + ball2.mass * ball2.vy
        collideBallsInelastic([ball1, ball2])
        const momentumXAfter = ball1.mass * ball1.vx + ball2.mass * ball2.vx
        const momentumYAfter = ball1.mass * ball1.vy + ball2.mass * ball2.vy
        expect(momentumXBefore).to.be.closeTo(momentumXAfter, roundingError)
        expect(momentumYBefore).to.be.closeTo(momentumYAfter, roundingError)
      })
    })
  })

  describe('partial inelastic collision', () => {
    it('loses kinetic energy according to coefficient of restitution', () => {
      const minEnergy = getKinteticEnergy(0)
      const maxEnergy = getKinteticEnergy(1)

      const halfEnergy = getKinteticEnergy(Math.SQRT1_2)
      expect(halfEnergy).to.equal(0.5 * minEnergy + 0.5 * maxEnergy)
      const quarterEnergy = getKinteticEnergy(0.5)
      expect(quarterEnergy).to.equal(0.75 * minEnergy + 0.25 * maxEnergy)

      function getKinteticEnergy (coefficientOfRestitution) {
        const ball1 = new Ball({ vx: 1, vy: 1 })
        const ball2 = new Ball({ x: 2, vx: -1 })
        collideBalls([ball1, ball2], coefficientOfRestitution)
        return ball1.kineticEnergy + ball2.kineticEnergy
      }
    })
  })

  function testRandomCollisions (numberOfTests, testCallback) {
    const maxVelocity = 5
    const randomVelocity = () => _.random(-maxVelocity, maxVelocity, true)
    for (let i = 0; i < numberOfTests; i++) {
      const ball1 = new Ball({ vx: randomVelocity(), vy: randomVelocity() })
      const x = _.random(2, true)
      const y = Math.sqrt(2 ** 2 - x ** 2)
      const ball2 = new Ball({ x, y, vx: randomVelocity(), vy: randomVelocity() })

      testCallback(ball1, ball2)
    }
  }

  describe('private functions', () => {
    const { isCollision, getNearestContactTime } = testables

    describe('isCollision', () => {
      it('collides with itself', () => {
        const ball = new Ball({})
        expect(isCollision([ball, ball])).to.equal(true)
      })

      it('does not collide outside radius', () => {
        const ball1 = new Ball({ x: 0, y: 0, radius: 1 })
        const ball2 = new Ball({ x: 3, y: 0, radius: 1 })
        expect(isCollision([ball1, ball2])).to.equal(false)
      })

      it('does collide when touching slightly', () => {
        const ball1 = new Ball({ x: 0, y: 0, radius: 1 })
        const ball2 = new Ball({ x: 1.999, y: 0, radius: 1 })
        expect(isCollision([ball1, ball2])).to.equal(true)
      })

      it('does not collide when sperated slightly', () => {
        const ball1 = new Ball({ x: 0, y: 0, radius: 1 })
        const ball2 = new Ball({ x: 2.001, y: 0, radius: 1 })
        expect(isCollision([ball1, ball2])).to.equal(false)
      })
    })

    describe('getNearestContactTime', () => {
      it('returns 0 for touching balls', () => {
        const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
        const ball2 = new Ball({ x: 2, vx: 0, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.equal(0)
      })

      it('finds last collision for movement in x-dimension with equal velocity', () => {
        const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
        const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.equal(-0.5)
      })

      it('finds last collision for movement in x-dimension', () => {
        const ball1 = new Ball({ x: 0, vx: 3, radius: 1 })
        const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.equal(-0.25)
      })

      it('finds last collision for movement in y-dimension', () => {
        const ball1 = new Ball({ y: 0, vy: 3, radius: 1 })
        const ball2 = new Ball({ y: 1, vy: -1, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.equal(-0.25)
      })

      it('finds last collision for movement in both dimensions', () => {
        const ball1 = new Ball({ x: 0, y: 0, vx: 1, vy: 1, radius: 1 })
        const ball2 = new Ball({ x: 1, y: 1, vx: -1, vy: -1, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.be.closeTo(-0.207106781, roundingError)
      })

      it('even finds next collision, when balls are sperated and going to collide', () => {
        const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
        const ball2 = new Ball({ x: 3, vx: -1, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.equal(0.5)
      })

      it('picks last collision, when balls are seperated (and seperating)', () => {
        const ball1 = new Ball({ x: 0, vx: -1, radius: 1 })
        const ball2 = new Ball({ x: 3, vx: 1, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.equal(-0.5)
      })

      it('picks upcoming touch, when upcoming touch is nearer', () => {
        const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
        const ball2 = new Ball({ x: -0.5, vx: 0, radius: 1 })
        const dt = getNearestContactTime([ball1, ball2])

        expect(dt).to.equal(1.5)
      })
    })
  })
})
