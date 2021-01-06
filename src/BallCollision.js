import _ from "lodash"

export default class BallCollision {
    constructor([ball1, ball2], coefficientOfRestitution = 1) {
        Object.assign(this, { ball1, ball2, coefficientOfRestitution })
    }

    /**
     * We chose not to rewind to the last contact time, 
     * since we're simulating multiple collisions after another per frame.  
     * Therefore the velocity vector could have turned around,
     * which would set the last collision into the future.
     */
    collide() {
        if (!this.isCollision()) return

        const dt = this.getNearestContactTime()
        this.moveBallsByTime(dt)
        this._collide()
        this.moveBallsByTime(-dt)
    }

    isCollision() {
        const { dx, dy } = this.ball1.getVectorTo(this.ball2)
        const distanceSquared = dx * dx + dy * dy
        const collisionDistanceSquared = (this.ball1.radius + this.ball2.radius) ** 2
        return distanceSquared <= collisionDistanceSquared
    }

    getNearestContactTime() {
        const collisionTimes = this.getContactTimes()
        return _.minBy(collisionTimes, Math.abs)
    }

    getContactTimes() {
        const { dx, dy } = this.ball1.getVectorTo(this.ball2)
        const { dvx, dvy } = this.ball1.getVelocityDifferenceTo(this.ball2)
        const touchingDistanceSquared = (this.ball1.radius + this.ball2.radius) ** 2

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

    moveBallsByTime(dt) {
        [this.ball1, this.ball2].forEach(ball => ball.move(dt))
    }

    /** 
     * Inelastic collision with coefficient of restitution.  
     * See https://en.wikipedia.org/wiki/Inelastic_collision#Formula
     */
    _collide() {
        const { mass: m1 } = this.ball1
        const { mass: m2 } = this.ball2

        const { dx, dy } = this.ball1.getVectorTo(this.ball2)
        const distanceSquared = dx ** 2 + dy ** 2

        const v1NormalFraction = (dx * this.ball1.vx + dy * this.ball1.vy) / distanceSquared
        const v1Normal = { vx: v1NormalFraction * dx, vy: v1NormalFraction * dy }
        const v2NormalFraction = (dx * this.ball2.vx + dy * this.ball2.vy) / distanceSquared
        const v2Normal = { vx: v2NormalFraction * dx, vy: v2NormalFraction * dy }

        const normalImpulseFraction = m1 * m2 / (m1 + m2) * (1 + this.coefficientOfRestitution)
        const normalImpulseX = normalImpulseFraction * (v2Normal.vx - v1Normal.vx)
        const normalImpulseY = normalImpulseFraction * (v2Normal.vy - v1Normal.vy)

        this.ball1.vx += normalImpulseX / m1
        this.ball1.vy += normalImpulseY / m1
        this.ball2.vx -= normalImpulseX / m2
        this.ball2.vy -= normalImpulseY / m2
    }
}

export class ElasticBallCollision extends BallCollision {
    constructor([ball1, ball2]) {
        const coefficientOfRestitution = 1
        super([ball1, ball2], coefficientOfRestitution)
    }
}

export class InElasticBallCollision extends BallCollision {
    constructor([ball1, ball2]) {
        const coefficientOfRestitution = 0
        super([ball1, ball2], coefficientOfRestitution)
    }
}