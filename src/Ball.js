import _ from "lodash"
import { rotate } from "./utils"

export default class Ball {
    constructor({ x = 0, y = 0, vx = 0, vy = 0, radius = 1, mass = 1, color = "red" }) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.mass = mass;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.radius, this.y);
        ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        ctx.fill();
    }

    move(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    translate({ x, y }) {
        this.x += x;
        this.y += y;
    }

    translateVelocity({ vx, vy }) {
        this.vx += vx;
        this.vy += vy;
    }

    setPosition({ x, y }) {
        this.x = x;
        this.y = y;
    }

    setVelocity({ vx, vy }) {
        this.vx = vx;
        this.vy = vy;
    }

    rotate(angle) {
        const { x, y } = rotate(this.x, this.y, angle)
        const { x: vx, y: vy } = rotate(this.vx, this.vy, angle)
        Object.assign(this, { x, y, vx, vy })
    }

    get kineticEnergy() {
        const vSquared = this.vx ** 2 + this.vy ** 2
        return 1 / 2 * this.mass * vSquared;
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
            this.vx *= -bounceFactor;
        }
        const overlapBottom = this.y + this.radius - bottom
        if (overlapBottom > 0) {
            this.y -= overlapBottom * (1 + bounceFactor)
            this.vy *= -bounceFactor;
        }
        const overlapTop = -this.y + this.radius + top
        if (overlapTop > 0) {
            this.y += overlapTop * (1 + bounceFactor)
            this.vy *= -bounceFactor;
        }
    }

    isOverlapping(otherBall) {
        const { dx, dy } = this.getVectorTo(otherBall);
        const distanceSquared = dx * dx + dy * dy;
        const collisionDistanceSquared = (this.radius + otherBall.radius) ** 2;
        return distanceSquared <= collisionDistanceSquared;
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
        const collisionTimes = [(-b - determinantSqrt) / (2 * a), (-b + determinantSqrt) / (2 * a)]
        return collisionTimes
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
        if (!this.isOverlapping(otherBall)) return

        const dt = this.getNearestContactTimeWith(otherBall)
        moveToNearestContact([this, otherBall])
        Ball.collide([this, otherBall], coefficientOfRestitution)
        moveBackToCurrentMoment([this, otherBall])

        function moveToNearestContact(balls) { balls.forEach(ball => ball.move(dt)) }
        function moveBackToCurrentMoment(balls) { balls.forEach(ball => ball.move(-dt)) }
    }

    /** 
     * Inelastic collision with coefficient of restitution.  
     * See https://en.wikipedia.org/wiki/Inelastic_collision#Formula
     */
    static collide([ball1, ball2], coefficientOfRestitution) {
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
}
