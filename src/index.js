import './styles.css'
import _ from 'lodash'
import { iteratePairs, randomFloat, randomColor } from './utils'
import { updateChart } from './chart'
import Ball from './Ball'
import BallCollision from './BallCollision'

/** @todo make these a option (constructor) */
const randomMass = () => Math.exp(randomFloat(0, 3)) * 50
const radiusFromMass = Math.sqrt

const gravityAcceleration = 200 // in px/s^2
const numberOfCollisionIterations = 10
const dt = 1 / 60 // in seconds
const numberOfBalls = 50
const initialMaxVelocity = 500
const coefficientOfRestitution = 0.8

/**
 * @todo Uses the same options, could be a class like `Game`
 * @todo Maybe split rendering and computing things (aka MVC)
 * @todo Walls could be just another object with infinite mass
 */
function updateFrame (ts) {
  clearCanvas()

  applyForces()
  moveBalls()
  simulateCollisions()

  renderBalls()
  updateEnergyChart(ts)

  window.requestAnimationFrame(updateFrame)
}

function clearCanvas () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function applyForces () {
  for (const ball of balls) {
    ball.vy += gravityAcceleration * dt
  }
}

function moveBalls () {
  for (const ball of balls) {
    ball.move(dt)
  }
}

function simulateCollisions () {
  _.times(numberOfCollisionIterations, () => {
    collideWithWalls()
    collideBalls()
  })
}

function collideBalls () {
  iteratePairs(balls, (ball1, ball2) => {
    const collision = new BallCollision([ball1, ball2], coefficientOfRestitution)
    collision.collide()
  })
}

function collideWithWalls () {
  for (const ball of balls) {
    ball.collideWithWall({
      top: -Infinity,
      right: canvas.width,
      bottom: canvas.height,
      left: 0,
      bounceFactor: coefficientOfRestitution
    })
  }
}

function renderBalls () {
  for (const ball of balls) {
    ball.render(ctx)
  }
}

function updateEnergyChart (timestamp) {
  const kineticEnergy = balls.reduce((energy, ball) => energy + ball.kineticEnergy, 0)
  const totalEnergy = balls.reduce((energy, ball) => energy + ball.potentialEnergy(canvas.height, gravityAcceleration), kineticEnergy)
  updateChart({ t: timestamp, kineticEnergy, totalEnergy })
}

function init () {
  const { canvas, ctx } = createCanvas()
  const balls = createBalls()

  window.requestAnimationFrame(updateFrame)

  return { canvas, ctx, balls }
}

function createCanvas () {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  return { canvas, ctx }
}

function createBalls () {
  return new Array(numberOfBalls).fill().map(() => {
    const mass = randomMass()
    return new Ball({
      x: randomFloat(window.innerWidth),
      y: randomFloat(window.innerHeight),
      vx: randomFloat(-initialMaxVelocity, initialMaxVelocity),
      vy: randomFloat(-initialMaxVelocity, initialMaxVelocity),
      radius: radiusFromMass(mass),
      mass,
      color: randomColor({ r: [128, 255], g: [0, 0], b: [0, 64] })
    })
  })
}

const { canvas, ctx, balls } = init()
