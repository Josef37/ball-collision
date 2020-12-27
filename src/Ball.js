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

    getLastCollisionTimeWith(otherBall) {
        const { dx, dy } = this.getVectorTo(otherBall)
        const { dvx, dvy } = this.getVelocityDifferenceTo(otherBall)
        const touchingDistance = this.radius + otherBall.radius

        // Solve quadratic equation
        const a = dvx ** 2 + dvy ** 2
        const b = 2 * (dvx * dx + dvy * dy)
        const c = dx ** 2 + dy ** 2 - touchingDistance ** 2
        const detSqrt = Math.sqrt(b ** 2 - 4 * a * c)
        const solutions = [(-b - detSqrt) / (2 * a), (-b + detSqrt) / (2 * a)]
        const dt = _.minBy(solutions, Math.abs)
        return dt
    }

    collideElasticWith(other) {
        this.collideWith(other, Ball.collideElastic)
    }

    collideInelasticWith(other) {
        this.collideWith(other, Ball.collideInelastic)
    }

    collideWith(otherBall, collisionFunc) {
        if (!this.isOverlapping(otherBall)) return

        const dt = this.getLastCollisionTimeWith(otherBall)
        Ball.moveBalls([this, otherBall], dt)
        collisionFunc(this, otherBall)
        Ball.moveBalls([this, otherBall], -dt)
    }

    static moveBalls(balls, dt) {
        balls.forEach(ball => ball.move(dt))
    }

    /**
     * [Two dimensional elastic collision](https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects)
     */
    static collideElastic(ball1, ball2) {
        const { mass: m1, vx: v1x, vy: v1y, x: x1, y: y1 } = ball1
        const { mass: m2, vx: v2x, vy: v2y, x: x2, y: y2 } = ball2

        const c = 2 / (m1 + m2) * ((v1x - v2x) * (x1 - x2) + (v1y - v2y) * (y1 - y2)) / ((x1 - x2) ** 2 + (y1 - y2) ** 2)
        ball1.vx = v1x - m2 * c * (x1 - x2)
        ball1.vy = v1y - m2 * c * (y1 - y2)
        ball2.vx = v2x - m1 * c * (x2 - x1)
        ball2.vy = v2y - m1 * c * (y2 - y1)
    }

    static collideInelastic(ball1, ball2) {
        const { angle, vTranslation } = Ball.transformForCollision(ball1, ball2);

        const { dx, dy } = ball1.getVectorTo(ball2)
        const distanceSquared = dx ** 2 + dy ** 2
        const alpha = ball2.mass / ball1.mass

        const lambda = ball1.vx * dx / ((alpha + 1) * distanceSquared)

        ball2.vx = lambda * dx
        ball2.vy = lambda * dy

        ball1.vx = ball1.vx - alpha * ball2.vx
        ball1.vy = ball1.vy - alpha * ball2.vy

        Ball.undoCollisionTransform(ball1, ball2, angle, vTranslation);
    }

    /**
     * Changes reference frame to stationary `ball2` (v2x = v2y = 0).
     * Rotates reference frame to `ball1` moving in x-direction (v1y = 0).
     */
    static transformForCollision(ball1, ball2) {
        const vTranslation = {
            vx: -ball2.vx,
            vy: -ball2.vy
        };
        ball1.translateVelocity(vTranslation)
        ball2.translateVelocity(vTranslation)

        const angle = Math.atan2(ball1.vy, ball1.vx)
        ball1.rotate(-angle)
        ball2.rotate(-angle)

        return { angle, vTranslation }
    }

    /**
     * Undos `transformForCollision()`.
     */
    static undoCollisionTransform(ball1, ball2, angle, vTranslation) {
        ball1.rotate(angle)
        ball2.rotate(angle)

        const reverseVTranslation = _.mapValues(vTranslation, v => -v)
        ball1.translateVelocity(reverseVTranslation)
        ball2.translateVelocity(reverseVTranslation)
    }
}
