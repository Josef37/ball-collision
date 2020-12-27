import _ from "lodash"
import { rotateCounterClockwise, rotateClockwise } from "./utils"

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

    setPosition({ x, y }) {
        this.x = x;
        this.y = y;
    }

    setVelocity({ vx, vy }) {
        this.vx = vx;
        this.vy = vy;
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

    collideWith(otherBall) {
        if (!this.isOverlapping(otherBall)) return

        const dt = this.getLastCollisionTimeWith(otherBall)
        moveBalls.bind(this)(dt)
        this._collideWith(otherBall)
        moveBalls.bind(this)(-dt)

        function moveBalls(dt) {
            this.move(dt)
            otherBall.move(dt)
        }
    }

    /**
     * [Two dimensional elastic collision](https://en.wikipedia.org/wiki/Elastic_collision#Two-dimensional_collision_with_two_moving_objects)
     */
    _collideWith(other) {
        const { mass: m1, vx: v1x, vy: v1y, x: x1, y: y1 } = this
        const { mass: m2, vx: v2x, vy: v2y, x: x2, y: y2 } = other

        const c = 2 / (m1 + m2) * ((v1x - v2x) * (x1 - x2) + (v1y - v2y) * (y1 - y2)) / ((x1 - x2) ** 2 + (y1 - y2) ** 2)
        this.vx = v1x - m2 * c * (x1 - x2)
        this.vy = v1y - m2 * c * (y1 - y2)
        other.vx = v2x - m1 * c * (x2 - x1)
        other.vy = v2y - m1 * c * (y2 - y1)
    }
}
