import _ from "lodash"
import { rotate } from "./utils"

export default class Ball {
    constructor({ x = 0, y = 0, vx = 0, vy = 0, radius = 1, mass = 1, color = "red" }) {
        Object.assign(this, { x, y, vx, vy, radius, mass, color })
        this.collisionDeltaVs = []
        this.collisionPositions = []
    }

    render(ctx) {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.x + this.radius, this.y)
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false)
        ctx.fill()
    }

    move(dt) {
        this.x += this.vx * dt
        this.y += this.vy * dt
    }

    translate({ x, y }) {
        this.x += x
        this.y += y
    }

    addVelocity({ vx, vy }) {
        this.vx += vx
        this.vy += vy
    }

    setPosition({ x, y }) {
        this.x = x
        this.y = y
    }

    setVelocity({ vx, vy }) {
        this.vx = vx
        this.vy = vy
    }

    rotate(angle) {
        const { x, y } = rotate(this.x, this.y, angle)
        const { x: vx, y: vy } = rotate(this.vx, this.vy, angle)
        Object.assign(this, { x, y, vx, vy })
    }

    get kineticEnergy() {
        const vSquared = this.vx ** 2 + this.vy ** 2
        return 1 / 2 * this.mass * vSquared
    }

    potentialEnergy(bottomWall, gravityAcceleration) {
        const height = bottomWall - this.y
        return this.mass * gravityAcceleration * height
    }

    collideWithWall({ top, right, bottom, left, bounceFactor = 1 }) {
        const overlapRight = this.x + this.radius - right
        if (overlapRight > 0) {
            this.x -= overlapRight * (1 + bounceFactor)
            this.vx *= -bounceFactor
        }
        const overlapLeft = -this.x + this.radius + left
        if (overlapLeft > 0) {
            this.x += overlapLeft * (1 + bounceFactor)
            this.vx *= -bounceFactor
        }
        const overlapBottom = this.y + this.radius - bottom
        if (overlapBottom > 0) {
            this.y -= overlapBottom * (1 + bounceFactor)
            this.vy *= -bounceFactor
        }
        const overlapTop = -this.y + this.radius + top
        if (overlapTop > 0) {
            this.y += overlapTop * (1 + bounceFactor)
            this.vy *= -bounceFactor
        }
    }

    isOverlapping(otherBall) {
        const { dx, dy } = this.getVectorTo(otherBall)
        const distanceSquared = dx * dx + dy * dy
        const collisionDistanceSquared = (this.radius + otherBall.radius) ** 2
        return distanceSquared <= collisionDistanceSquared
    }

    getVectorTo(targetBall) {
        return {
            dx: targetBall.x - this.x,
            dy: targetBall.y - this.y
        }
    }

    getVelocityDifferenceTo(targetBall) {
        return {
            dvx: targetBall.vx - this.vx,
            dvy: targetBall.vy - this.vy,
        }
    }

    getNearestContactTimeWith(otherBall) {
        const collisionTimes = this.getContactTimesWith(otherBall)
        return _.minBy(collisionTimes, Math.abs)
    }

    getContactTimesWith(otherBall) {
        const { dx, dy } = this.getVectorTo(otherBall)
        const { dvx, dvy } = this.getVelocityDifferenceTo(otherBall)
        const touchingDistanceSquared = (this.radius + otherBall.radius) ** 2

        const relativeVelocitySquared = dvx ** 2 + dvy ** 2
        const distanceSquared = dx ** 2 + dy ** 2
        const velocityScalarDistance = dvx * dx + dvy * dy

        // Solve quadratic equation derived from `|dt*ΔV + ΔP| = r1+r2`
        const a = relativeVelocitySquared
        const b = 2 * velocityScalarDistance
        const c = distanceSquared - touchingDistanceSquared
        const determinantSqrt = Math.sqrt(b ** 2 - 4 * a * c)
        const collisionTimes = [(-b - determinantSqrt) / (2 * a), (-b + determinantSqrt) / (2 * a)].filter(isFinite)
        return collisionTimes
    }

    recordCollision(otherBall, coefficientOfRestitution = 1) {
        if (!this.isOverlapping(otherBall)) return

        const dt = this.getNearestContactTimeWith(otherBall)
        if (!isFinite(dt)) return
        moveToNearestContact([this, otherBall])
        const deltaVs = Ball.computeCollisionDeltaVs([this, otherBall], coefficientOfRestitution)
        recordDeltaVs([this, otherBall], deltaVs)
        recordNewPositions([this, otherBall], deltaVs, -dt)
        moveBackToCurrentMoment([this, otherBall])

        function recordDeltaVs(balls, deltaVs) {
            _.zip(balls, deltaVs).forEach(([ball, deltaV]) => {
                ball.collisionDeltaVs.push(deltaV)
            })
        }

        function recordNewPositions(balls, deltaVs, dt) {
            applyDeltaVs(balls, deltaVs)
            balls.forEach(ball => ball.move(dt))
            balls.forEach(ball => ball.collisionPositions.push({ x: ball.x, y: ball.y }))
            balls.forEach(ball => ball.move(-dt))
            unapplyDeltaVs(balls, deltaVs)

            function applyDeltaVs(balls, deltaVs) {
                _.zip(balls, deltaVs).forEach(([ball, deltaV]) => ball.addVelocity(deltaV))
            }
            function unapplyDeltaVs(balls, deltaVs) {
                _.zip(balls, deltaVs).forEach(([ball, deltaV]) => ball.addVelocity(_.mapValues(deltaV, v => -v)))
            }
        }

        function moveToNearestContact(balls) { balls.forEach(ball => ball.move(dt)) }
        function moveBackToCurrentMoment(balls) { balls.forEach(ball => ball.move(-dt)) }
    }

    applyCollisions() {
        const vx = _.meanBy(this.collisionDeltaVs, 'vx') || 0
        const vy = _.meanBy(this.collisionDeltaVs, 'vy') || 0
        this.addVelocity({ vx, vy })
        this.collisionDeltaVs = []

        const x = _.meanBy(this.collisionPositions, 'x')
        if (isFinite(x)) this.x = x
        const y = _.meanBy(this.collisionPositions, 'y')
        if (isFinite(y)) this.y = y
        this.collisionPositions = []
    }

    collideElasticWith(otherBall) {
        const coefficientOfRestitution = 1
        this.collideWith(otherBall, coefficientOfRestitution)
    }

    collideInelasticWith(otherBall) {
        const coefficientOfRestitution = 0
        this.collideWith(otherBall, coefficientOfRestitution)
    }

    /**
     * We chose not to rewind to the last contact time, 
     * since we're simulating multiple collisions after another per frame.  
     * Therefore the velocity vector could have turned around,
     * which would set the last collision into the future.
     */
    collideWith(otherBall, coefficientOfRestitution) {
        this.recordCollision(otherBall, coefficientOfRestitution)

        this.applyCollisions()
        otherBall.applyCollisions()
    }

    static collide([ball1, ball2], coefficientOfRestitution) {
        const deltaVs = Ball.computeCollisionDeltaVs([ball1, ball2], coefficientOfRestitution)
        applyDeltaVs([ball1, ball2], deltaVs)

        function applyDeltaVs(balls, deltaVs) {
            _.zip(balls, deltaVs).forEach(([ball, deltaV]) => ball.addVelocity(deltaV))
        }
    }

    /** 
     * Inelastic collision with coefficient of restitution.  
     * See https://en.wikipedia.org/wiki/Inelastic_collision#Formula
     */
    static computeCollisionDeltaVs([ball1, ball2], coefficientOfRestitution) {
        const { normalImpulseX, normalImpulseY } = Ball.computeNormalImpulse(ball1, ball2, coefficientOfRestitution)

        return [{
            vx: normalImpulseX / ball1.mass,
            vy: normalImpulseY / ball1.mass,
        }, {
            vx: - normalImpulseX / ball2.mass,
            vy: - normalImpulseY / ball2.mass,
        }]
    }

    static computeNormalImpulse(ball1, ball2, coefficientOfRestitution) {
        const { dx, dy } = ball1.getVectorTo(ball2)
        const distanceSquared = dx ** 2 + dy ** 2

        const v1NormalFraction = (dx * ball1.vx + dy * ball1.vy) / distanceSquared
        const v1Normal = { vx: v1NormalFraction * dx, vy: v1NormalFraction * dy }
        const v2NormalFraction = (dx * ball2.vx + dy * ball2.vy) / distanceSquared
        const v2Normal = { vx: v2NormalFraction * dx, vy: v2NormalFraction * dy }

        const normalImpulseFraction =
            ball1.mass * ball2.mass / (ball1.mass + ball2.mass) * (1 + coefficientOfRestitution)
        return {
            normalImpulseX: normalImpulseFraction * (v2Normal.vx - v1Normal.vx),
            normalImpulseY: normalImpulseFraction * (v2Normal.vy - v1Normal.vy)
        }
    }
}
