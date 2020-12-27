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
        const { dx, dy } = this.getVectorTo(otherBall);

        // calculate angle, sine, and cosine
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        // For the computation, rotate and translate the two balls, 
        // that this is at (0,0) and otherBall is at (dist,0)
        let pos0 = 0;
        let pos1 = rotateClockwise(dx, dy, sin, cos).x;

        const vel0 = rotateClockwise(this.vx, this.vy, sin, cos);
        const vel1 = rotateClockwise(otherBall.vx, otherBall.vy, sin, cos);

        // Elastic collision along x-axis
        const vxTotal = vel0.x - vel1.x;
        vel0.x =
            ((this.mass - otherBall.mass) * vel0.x + 2 * otherBall.mass * vel1.x) /
            (this.mass + otherBall.mass);
        vel1.x = vxTotal + vel0.x;

        //rotate positions back
        const pos0F = rotateCounterClockwise(pos0, 0, sin, cos);
        const pos1F = rotateCounterClockwise(pos1, 0, sin, cos);

        //adjust positions to actual screen positions
        otherBall.setPosition({
            x: this.x + pos1F.x,
            y: this.y + pos1F.y
        })
        this.setPosition({
            x: this.x + pos0F.x,
            y: this.y + pos0F.y
        })

        //rotate velocities back
        const vel0F = rotateCounterClockwise(vel0.x, vel0.y, sin, cos);
        const vel1F = rotateCounterClockwise(vel1.x, vel1.y, sin, cos);

        this.setVelocity({
            vx: vel0F.x,
            vy: vel0F.y
        })
        otherBall.setVelocity({
            vx: vel1F.x,
            vy: vel1F.y
        })
    }
}
