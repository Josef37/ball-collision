import minBy from "lodash/minBy"
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
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return this;
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

    /**
     * Reset the balls position to inside the canvas coordinate system
     * and multiply the wallwards velocity with factor.
     */
    collideWithWall({ top, right, bottom, left, bounceFactor = 1 }) {
        if (this.x + this.radius > right) {
            this.x = right - this.radius;
            this.vx *= -bounceFactor;
        }
        if (this.x - this.radius < left) {
            this.x = left + this.radius;
            this.vx *= -bounceFactor;
        }
        if (this.y + this.radius > bottom) {
            this.y = bottom - this.radius;
            this.vy *= -bounceFactor;
        }
        if (this.y - this.radius < top) {
            this.y = top + this.radius;
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
        const dt = minBy(solutions, Math.abs)
        return dt
    }

    collideWith(otherBall) {
        const moveBalls = (dt) => {
            this.move(dt)
            otherBall.move(dt)
        }

        if (!this.isOverlapping(otherBall)) return

        const dt = this.getLastCollisionTimeWith(otherBall)
        moveBalls(dt)
        this._collideWith(otherBall)
        moveBalls(-dt)
    }

    // Assumes both balls to be touching (being at the moment of first contact)
    _collideWith(otherBall) {
        // 1. Transform coordinate system, s.t. ball2 has v=0 and ball1 has v₂=0
        const vTranslation = {
            vx: -otherBall.vx,
            vy: -otherBall.vy
        }

        this.vx += vTranslation.vx
        otherBall.vx += vTranslation.vx
        this.vy += vTranslation.vy
        otherBall.vy += vTranslation.vy

        const angle = Math.atan2(this.vy, this.vx)
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)

        this.vx = rotateCounterClockwise(this.vx, this.vy, sin, cos).x
        this.vy = 0

        const { dx, dy } = this.getVectorTo(otherBall)

        // 3. Compute new velocities according to elastic collision
        const v1x = this.vx
        const { x: px, y: py } = rotateCounterClockwise(dx, dy, sin, cos)
        const m1 = this.mass
        const m2 = otherBall.mass

        const lambda = (2 * v1x * px) / ((m2 / m1 + 1) * (px ** 2 + py ** 2))
        const v1x_ = 1 / m1 * (m1 * v1x - m2 * px * lambda)
        const v1y_ = 1 / m1 * (- m2 * py * lambda)
        const v2x_ = lambda * px
        const v2y_ = lambda * py

        this.vx = v1x_
        this.vy = v1y_
        otherBall.vx = v2x_
        otherBall.vy = v2y_

        // 4. Undo transformations form before
        const rot1 = rotateClockwise(this.vx, this.vy, sin, cos)
        this.vx = rot1.x
        this.vy = rot1.y

        const rot2 = rotateClockwise(otherBall.vx, otherBall.vy, sin, cos)
        otherBall.vx = rot2.x
        otherBall.vy = rot2.y

        this.vx -= vTranslation.vx
        otherBall.vx -= vTranslation.vx
        this.vy -= vTranslation.vy
        otherBall.vy -= vTranslation.vy
    }
}
