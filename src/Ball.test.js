import { expect } from 'chai'
import Ball from './Ball'

describe('Ball', () => {
  const ballParams = {
    x: 1,
    y: -2,
    vx: 3,
    vy: -1,
    radius: 3,
    mass: 1
  }
  let ball = new Ball(ballParams)

  beforeEach(() => {
    ball = new Ball(ballParams)
  })

  describe('move', () => {
    it('moves by veloctiy vector', () => {
      ball.move(2)
      expectBallPosition({ x: 7, y: -4 })
    })
  })

  describe('translate', () => {
    it('adds translation vector', () => {
      ball.translate({ x: 10, y: 10 })
      expectBallPosition({ x: 11, y: 8 })
    })
  })

  describe('setPosition', () => {
    it('sets position', () => {
      ball.setPosition({ x: 10, y: 10 })
      expectBallPosition({ x: 10, y: 10 })
    })
  })

  describe('setVelocity', () => {
    it('sets velocity', () => {
      ball.setVelocity({ vx: 10, vy: 10 })
      expectBallVelocity({ vx: 10, vy: 10 })
    })
  })

  describe('kineticEnergy', () => {
    it('works for simple numbers', () => {
      ball.mass = 2
      ball.vx = 3
      ball.vy = 4
      expect(ball.kineticEnergy).to.be.equal(25)
    })

    it('is linear in mass', () => {
      const initialKineticEnergy = ball.kineticEnergy
      ball.mass *= 7
      expect(ball.kineticEnergy).to.be.equal(7 * initialKineticEnergy)
    })

    it('is quadratic in velocity', () => {
      const initialKineticEnergy = ball.kineticEnergy
      ball.vx *= 3
      ball.vy *= 3
      expect(ball.kineticEnergy).to.be.equal(9 * initialKineticEnergy)
    })
  })

  describe('collideWall', () => {
    const wall = {
      top: -10,
      right: 10,
      bottom: 10,
      left: -10,
      bounceFactor: 0.5
    }

    beforeEach(() => {
      ball.x = 0
      ball.y = 0
      ball.radius = 5
    })

    it('does not collide when inside', () => {
      ball.collideWithWall(wall)
      expectBallPosition({ x: 0, y: 0 })
    })

    it('does collide with left wall', () => {
      ball.x = -8
      ball.vx = 1
      ball.collideWithWall(wall)
      expectBallPosition({ x: -3.5, y: 0 })
    })

    it('does collide with right wall', () => {
      ball.x = 8
      ball.collideWithWall(wall)
      expectBallPosition({ x: 3.5, y: 0 })
    })

    it('does collide with top wall', () => {
      ball.y = -8
      ball.collideWithWall(wall)
      expectBallPosition({ x: 0, y: -3.5 })
    })

    it('does collide with bottom wall', () => {
      ball.y = 8
      ball.collideWithWall(wall)
      expectBallPosition({ x: 0, y: 3.5 })
    })

    it('collides with corner wall', () => {
      ball.x = 8
      ball.y = 8
      ball.collideWithWall(wall)
      expectBallPosition({ x: 3.5, y: 3.5 })
    })
  })

  function expectBallPosition ({ x, y }) {
    expect(ball.x).to.equal(x)
    expect(ball.y).to.equal(y)
  }

  function expectBallVelocity ({ vx, vy }) {
    expect(ball.vx).to.equal(vx)
    expect(ball.vy).to.equal(vy)
  }
})
