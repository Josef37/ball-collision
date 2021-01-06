import _ from "lodash"
import { rotate } from "./utils"

/**
 * @todo add math.js for vector computation (position, velocity, rotation)
 */
export default class Ball {
    constructor({ x = 0, y = 0, vx = 0, vy = 0, radius = 1, mass = 1, color = "red" }) {
        Object.assign(this, { x, y, vx, vy, radius, mass, color })
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

    translateVelocity({ vx, vy }) {
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
}
