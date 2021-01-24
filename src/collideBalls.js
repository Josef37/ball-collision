import _ from 'lodash'

export function collideBallsElastic ([ball1, ball2]) {
  const coefficientOfRestitution = 1
  collideBalls([ball1, ball2], coefficientOfRestitution)
}

export function collideBallsInelastic ([ball1, ball2]) {
  const coefficientOfRestitution = 0
  collideBalls([ball1, ball2], coefficientOfRestitution)
}

/**
 * We chose not to rewind to the last contact time,
 * since we're simulating multiple collisions after another per frame.
 * Therefore the velocity vector could have turned around,
 * which would set the last collision into the future.
 *
 * Using classes for only calling `collide` once,
 * degregaded performance badly.
 */
export default function collideBalls ([ball1, ball2], coefficientOfRestitution = 1) {
  if (!isCollision([ball1, ball2])) return

  const dt = getNearestContactTime([ball1, ball2])
  moveBallsByTime(dt)
  collide([ball1, ball2], coefficientOfRestitution)
  moveBallsByTime(-dt)

  function moveBallsByTime (dt) {
    [ball1, ball2].forEach(ball => ball.move(dt))
  }
}

function isCollision ([ball1, ball2]) {
  const { dx, dy } = ball1.getVectorTo(ball2)
  const distanceSquared = dx * dx + dy * dy
  const collisionDistanceSquared = (ball1.radius + ball2.radius) ** 2
  return distanceSquared <= collisionDistanceSquared
}

function getNearestContactTime ([ball1, ball2]) {
  const collisionTimes = getContactTimes([ball1, ball2])
  return _.minBy(collisionTimes, Math.abs)
}

function getContactTimes ([ball1, ball2]) {
  const { dx, dy } = ball1.getVectorTo(ball2)
  const { dvx, dvy } = ball1.getVelocityDifferenceTo(ball2)
  const touchingDistanceSquared = (ball1.radius + ball2.radius) ** 2

  const relativeVelocitySquared = dvx ** 2 + dvy ** 2
  const distanceSquared = dx ** 2 + dy ** 2
  const velocityScalarDistance = dvx * dx + dvy * dy

  // Solve quadratic equation derived from `|dt*ΔV + ΔP| = r1+r2`
  const a = relativeVelocitySquared
  const b = 2 * velocityScalarDistance
  const c = distanceSquared - touchingDistanceSquared
  const determinantSqrt = Math.sqrt(b ** 2 - 4 * a * c)
  const collisionTimes = [
    (-b - determinantSqrt) / (2 * a),
    (-b + determinantSqrt) / (2 * a)
  ].filter(isFinite)
  return collisionTimes
}

/**
 * Inelastic collision with coefficient of restitution.
 * See https://en.wikipedia.org/wiki/Inelastic_collision#Formula
 */
function collide ([ball1, ball2], coefficientOfRestitution) {
  const { mass: m1 } = ball1
  const { mass: m2 } = ball2

  const { dx, dy } = ball1.getVectorTo(ball2)
  const distanceSquared = dx ** 2 + dy ** 2

  const v1NormalFraction = (dx * ball1.vx + dy * ball1.vy) / distanceSquared
  const v1Normal = { vx: v1NormalFraction * dx, vy: v1NormalFraction * dy }
  const v2NormalFraction = (dx * ball2.vx + dy * ball2.vy) / distanceSquared
  const v2Normal = { vx: v2NormalFraction * dx, vy: v2NormalFraction * dy }

  const normalImpulseFraction = m1 * m2 / (m1 + m2) * (1 + coefficientOfRestitution)
  const normalImpulseX = normalImpulseFraction * (v2Normal.vx - v1Normal.vx)
  const normalImpulseY = normalImpulseFraction * (v2Normal.vy - v1Normal.vy)

  ball1.vx += normalImpulseX / m1
  ball1.vy += normalImpulseY / m1
  ball2.vx -= normalImpulseX / m2
  ball2.vy -= normalImpulseY / m2
}

export const testables = {
  isCollision,
  getNearestContactTime,
  collide
}
