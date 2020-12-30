import { expect } from "chai";
import _ from "lodash"
import Ball from "./Ball"
import { iteratePairs } from "./utils";

const roundingError = 1e-8

describe("Ball", () => {
    const ballParams = {
        x: 1,
        y: -2,
        vx: 3,
        vy: -1,
        radius: 3,
        mass: 1
    }
    let ball = new Ball(ballParams);

    beforeEach(() => {
        ball = new Ball(ballParams)
    })

    describe("move", () => {
        it("moves by veloctiy vector", () => {
            ball.move(2)
            expectBallPosition({ x: 7, y: -4 })
        })
    })

    describe("translate", () => {
        it("adds translation vector", () => {
            ball.translate({ x: 10, y: 10 })
            expectBallPosition({ x: 11, y: 8 })
        })
    })

    describe("setPosition", () => {
        it("sets position", () => {
            ball.setPosition({ x: 10, y: 10 })
            expectBallPosition({ x: 10, y: 10 })
        })
    })

    describe("setVelocity", () => {
        it("sets velocity", () => {
            ball.setVelocity({ vx: 10, vy: 10 })
            expectBallVelocity({ vx: 10, vy: 10 })
        })
    })

    describe("kineticEnergy", () => {
        it("works for simple numbers", () => {
            ball.mass = 2
            ball.vx = 3
            ball.vy = 4
            expect(ball.kineticEnergy).to.be.equal(25)
        })

        it("is linear in mass", () => {
            const initialKineticEnergy = ball.kineticEnergy
            ball.mass *= 7
            expect(ball.kineticEnergy).to.be.equal(7 * initialKineticEnergy)
        })

        it("is quadratic in velocity", () => {
            const initialKineticEnergy = ball.kineticEnergy
            ball.vx *= 3
            ball.vy *= 3
            expect(ball.kineticEnergy).to.be.equal(9 * initialKineticEnergy)
        })
    })

    describe("collideWall", () => {
        const wall = {
            top: -10,
            right: 10,
            bottom: 10,
            left: -10,
            bounceFactor: 0.5
        }

        beforeEach(() => {
            ball.x = 0
            ball.y = 0
            ball.radius = 5
        })

        it("does not collide when inside", () => {
            ball.collideWithWall(wall)
            expectBallPosition({ x: 0, y: 0 })
        })

        it("does collide with left wall", () => {
            ball.x = -8
            ball.vx = 1
            ball.collideWithWall(wall)
            expectBallPosition({ x: -3.5, y: 0 })
        })

        it("does collide with right wall", () => {
            ball.x = 8
            ball.collideWithWall(wall)
            expectBallPosition({ x: 3.5, y: 0 })
        })

        it("does collide with top wall", () => {
            ball.y = -8
            ball.collideWithWall(wall)
            expectBallPosition({ x: 0, y: -3.5 })
        })

        it("does collide with bottom wall", () => {
            ball.y = 8
            ball.collideWithWall(wall)
            expectBallPosition({ x: 0, y: 3.5 })
        })

        it("collides with corner wall", () => {
            ball.x = 8
            ball.y = 8
            ball.collideWithWall(wall)
            expectBallPosition({ x: 3.5, y: 3.5 })
        })
    })

    describe("isOverlapping", () => {
        it("collides with itself", () => {
            expect(ball.isOverlapping(ball)).to.be.true
        })

        it("does not collide outside radius", () => {
            const ball1 = new Ball({ x: 0, y: 0, radius: 1 })
            const ball2 = new Ball({ x: 3, y: 0, radius: 1 })
            expect(ball1.isOverlapping(ball2)).to.be.false
        })

        it("does collide when touching slightly", () => {
            const ball1 = new Ball({ x: 0, y: 0, radius: 1 })
            const ball2 = new Ball({ x: 1.999, y: 0, radius: 1 })
            expect(ball1.isOverlapping(ball2)).to.be.true
        })

        it("does not collide when sperated slightly", () => {
            const ball1 = new Ball({ x: 0, y: 0, radius: 1 })
            const ball2 = new Ball({ x: 2.001, y: 0, radius: 1 })
            expect(ball1.isOverlapping(ball2)).to.be.false
        })
    })

    describe("getNearestContactTimeWith", () => {
        it("returns 0 for touching balls", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 2, vx: 0, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.equal(0)
        })

        it("finds last collision for movement in x-dimension with equal velocity", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.equal(-0.5)
        })

        it("finds last collision for movement in x-dimension", () => {
            const ball1 = new Ball({ x: 0, vx: 3, radius: 1 })
            const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.equal(-0.25)
        })

        it("finds last collision for movement in y-dimension", () => {
            const ball1 = new Ball({ y: 0, vy: 3, radius: 1 })
            const ball2 = new Ball({ y: 1, vy: -1, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.equal(-0.25)
        })

        it("finds last collision for movement in both dimensions", () => {
            const ball1 = new Ball({ x: 0, y: 0, vx: 1, vy: 1, radius: 1 })
            const ball2 = new Ball({ x: 1, y: 1, vx: -1, vy: -1, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.be.closeTo(-0.207106781, roundingError)
        })

        it("even finds next collision, when balls are sperated and going to collide", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 3, vx: -1, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.equal(0.5)
        })

        it("picks last collision, when balls are seperated (and seperating)", () => {
            const ball1 = new Ball({ x: 0, vx: -1, radius: 1 })
            const ball2 = new Ball({ x: 3, vx: 1, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.equal(-0.5)
        })

        it("picks upcoming touch, when upcoming touch is nearer", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: -0.5, vx: 0, radius: 1 })
            const dt = ball1.getNearestContactTimeWith(ball2)

            expect(dt).to.equal(1.5)
        })
    })

    describe("touching collision", () => {
        it("works for one-dimensional collision with equal velocities", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 2, vx: -1, radius: 1 })
            ball1.collideElasticWith(ball2)
            expect(ball1.vx).to.equal(-1)
            expect(ball2.vx).to.equal(1)
        })

        it("works for one-dimensional collision with different velocities", () => {
            const ball1 = new Ball({ x: 0, vx: 2, radius: 1 })
            const ball2 = new Ball({ x: 2, vx: -1, radius: 1 })
            ball1.collideElasticWith(ball2)
            expect(ball1.vx).to.equal(-1)
            expect(ball2.vx).to.equal(2)
        })

        it("works for one-dimensional collision with different masses", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1, mass: 2 })
            const ball2 = new Ball({ x: 2, vx: -1, radius: 1, mass: 1 })
            ball1.collideElasticWith(ball2)
            expect(ball1.vx).to.be.closeTo(-1 / 3, roundingError)
            expect(ball2.vx).to.be.closeTo(5 / 3, roundingError)
        })

        it("works in y-direction", () => {
            const ball1 = new Ball({ y: 0, vy: 2, radius: 1 })
            const ball2 = new Ball({ y: 2, vy: -1, radius: 1 })
            ball1.collideElasticWith(ball2)
            expect(ball1.vy).to.equal(-1)
            expect(ball2.vy).to.equal(2)
        })

        it("works for non-center collisions", () => {
            const ball1 = new Ball({ vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 1.2, y: 1.6, radius: 1 })
            ball1.collideElasticWith(ball2)
            expect(ball2.vy / ball2.vx).to.be.closeTo(ball2.y / ball2.x, roundingError, "ball2 direction")
            expect(ball1.vy / ball1.vx).to.be.closeTo(- ball2.x / ball2.y, roundingError, "ball1 direction")
        })

        it("preserves kinetic energy", () => {
            const numberOfTests = 10
            testRandomCollisions(numberOfTests, (ball1, ball2) => {
                const kineticEnergyBefore = ball1.kineticEnergy + ball2.kineticEnergy

                ball1.collideElasticWith(ball2)

                const kineticEnergyAfter = ball1.kineticEnergy + ball2.kineticEnergy
                expect(kineticEnergyBefore).to.be.closeTo(kineticEnergyAfter, roundingError)
            })
        })

        it("preserves momentum", () => {
            const numberOfTests = 10
            testRandomCollisions(numberOfTests, (ball1, ball2) => {
                const momentumXBefore = ball1.mass * ball1.vx + ball2.mass * ball2.vx
                const momentumYBefore = ball1.mass * ball1.vy + ball2.mass * ball2.vy
                ball1.collideElasticWith(ball2)
                const momentumXAfter = ball1.mass * ball1.vx + ball2.mass * ball2.vx
                const momentumYAfter = ball1.mass * ball1.vy + ball2.mass * ball2.vy
                expect(momentumXBefore).to.be.closeTo(momentumXAfter, roundingError)
                expect(momentumYBefore).to.be.closeTo(momentumYAfter, roundingError)
            })
        })
    })

    describe("overlapping collision", () => {
        it("works for one-dimensional collision with equal velocities", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
            ball1.collideElasticWith(ball2)
            expect(ball1.vx).to.equal(-1)
            expect(ball2.vx).to.equal(1)
            expect(ball1.x).to.equal(-1)
            expect(ball2.x).to.equal(2)
        })
    })

    describe("inelastic collision", () => {
        it("collides totally inelastic in x-direction", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 2, vx: -1, radius: 1 })
            ball1.collideInelasticWith(ball2)
            expect(ball1.vx).to.equal(ball2.vx).to.equal(0)
        })

        it("collides totally inelastic in y-direction", () => {
            const ball1 = new Ball({ y: 0, vy: 1, radius: 1 })
            const ball2 = new Ball({ y: 2, vy: -1, radius: 1 })
            ball1.collideInelasticWith(ball2)
            expect(ball1.vy).to.equal(ball2.vy).to.equal(0)
        })

        it("collides totally inelastic in two dimensions", () => {
            const ball1 = new Ball({ x: 0, y: 0, vx: 1, vy: 1, radius: 1 })
            const ball2 = new Ball({ x: Math.SQRT2 - 0.01, y: Math.SQRT2 - 0.01, vx: -1, vy: -1, radius: 1 })
            ball1.collideInelasticWith(ball2)
            expect(ball1.vx).to.be.closeTo(ball2.vx, roundingError)
            expect(ball1.vy).to.be.closeTo(ball2.vy, roundingError)
            expect(ball1.vx).to.be.closeTo(0, roundingError)
            expect(ball1.vy).to.be.closeTo(0, roundingError)
        })

        it("preserves momentum", () => {
            const numberOfTests = 10
            testRandomCollisions(numberOfTests, (ball1, ball2) => {
                const momentumXBefore = ball1.mass * ball1.vx + ball2.mass * ball2.vx
                const momentumYBefore = ball1.mass * ball1.vy + ball2.mass * ball2.vy
                ball1.collideInelasticWith(ball2)
                const momentumXAfter = ball1.mass * ball1.vx + ball2.mass * ball2.vx
                const momentumYAfter = ball1.mass * ball1.vy + ball2.mass * ball2.vy
                expect(momentumXBefore).to.be.closeTo(momentumXAfter, roundingError)
                expect(momentumYBefore).to.be.closeTo(momentumYAfter, roundingError)
            })
        })
    })

    describe("partial inelastic collision", () => {
        it("loses kinetic energy according to coefficient of restitution", () => {
            const minEnergy = getKinteticEnergy(0)
            const maxEnergy = getKinteticEnergy(1)

            const halfEnergy = getKinteticEnergy(Math.SQRT1_2)
            expect(halfEnergy).to.equal(0.5 * minEnergy + 0.5 * maxEnergy)
            const quarterEnergy = getKinteticEnergy(0.5)
            expect(quarterEnergy).to.equal(0.75 * minEnergy + 0.25 * maxEnergy)

            function getKinteticEnergy(coefficientOfRestitution) {
                const ball1 = new Ball({ vx: 1, vy: 1 })
                const ball2 = new Ball({ x: 2, vx: -1 })
                ball1.collideWith(ball2, coefficientOfRestitution)
                return ball1.kineticEnergy + ball2.kineticEnergy
            }
        })
    })

    describe("record all collisions before updating", () => {
        it("records two collisions before updating", () => {
            const centerBall = new Ball({ y: roundingError })
            const ball1 = new Ball({ x: Math.SQRT2, y: Math.SQRT2, vx: -1, vy: -1 })
            const ball2 = new Ball({ x: -Math.SQRT2, y: Math.SQRT2, vx: 1, vy: -1 })

            centerBall.recordCollision(ball1)
            centerBall.recordCollision(ball2)
            centerBall.applyCollisions()

            expect(centerBall.vx).to.equal(0)
            expect(centerBall.vy).to.be.closeTo(-2, roundingError)
        })

        it("reverts to contact for overlapping collisions", () => {
            const centerBall = new Ball({})
            const ball1 = new Ball({ x: Math.SQRT2 - 1, y: Math.SQRT2, vx: -1 })
            const ball2 = new Ball({ x: -(Math.SQRT2 - 1), y: Math.SQRT2, vx: 1 })

            centerBall.recordCollision(ball1)
            centerBall.recordCollision(ball2)
            centerBall.applyCollisions()

            expect(centerBall.vx).to.equal(0)
            expect(centerBall.vy).to.equal(-0.5)
            expect(centerBall.x).to.equal(0)
            expect(centerBall.y).to.be.closeTo(-0.5, roundingError)
        })

        it("averages positions for multiple collisions", () => {
            const centerBall = new Ball({})
            const ball1 = new Ball({ x: 1, vx: -1 })
            const ball2 = new Ball({ x: -1, vx: 1 })

            centerBall.recordCollision(ball1)
            centerBall.recordCollision(ball2)
            centerBall.applyCollisions()

            expect(centerBall.vx).to.equal(0)
            expect(centerBall.vy).to.equal(0)
            expect(centerBall.x).to.equal(0)
            expect(centerBall.y).to.equal(0)
        })

        it("records collisions for collision partner", () => {
            const ball1 = new Ball({ x: 0.5, vx: -1 })
            const ball2 = new Ball({ x: -0.5, vx: 1 })

            ball1.recordCollision(ball2)
            ball1.applyCollisions()
            ball2.applyCollisions()

            expect(ball1.vx).to.equal(1)
            expect(ball2.vx).to.equal(-1)
            expect(ball1.x).to.equal(1.5)
            expect(ball2.x).to.equal(-1.5)
        })

        it("does not change the balls state", () => {
            const initialState = { x: 0.5, y: 0, vx: -1, vy: 0 }
            const ball1 = new Ball(initialState)
            const ball2 = new Ball({ x: -0.5, vx: 1 })

            ball1.recordCollision(ball2)

            expect(ball1).to.contain(initialState)
        })

        it.only("preserves kinetic energy", () => {
            const balls = [
                new Ball({ y: 0, vy: 1 }),
                new Ball({ x: 0, y: 2 }),
                new Ball({ x: Math.sqrt(3), y: 1 }),
                new Ball({ x: -Math.sqrt(3), y: 1 })
            ]

            const kineticEnergyBefore = _.sum(balls.map(ball => ball.kineticEnergy))

            iteratePairs(balls, (ball1, ball2) => ball1.recordCollision(ball2))
            console.log(JSON.stringify(balls, null, 4))
            balls.forEach(ball => ball.applyCollisions())

            const kineticEnergyAfter = _.sum(balls.map(ball => ball.kineticEnergy))
            console.log(balls)
            expect(kineticEnergyBefore).to.equal(kineticEnergyAfter)
        })
    })

    function testRandomCollisions(numberOfTests, testCallback) {
        const maxVelocity = 5
        const randomVelocity = () => _.random(-maxVelocity, maxVelocity, true)
        for (const i of Array(numberOfTests)) {
            const ball1 = new Ball({ vx: randomVelocity(), vy: randomVelocity() })
            const x = _.random(2, true)
            const y = Math.sqrt(2 ** 2 - x ** 2)
            const ball2 = new Ball({ x, y, vx: randomVelocity(), vy: randomVelocity() })

            testCallback(ball1, ball2)
        }
    }

    function expectBallPosition({ x, y }) {
        expect(ball.x).to.equal(x)
        expect(ball.y).to.equal(y)
    }

    function expectBallVelocity({ vx, vy }) {
        expect(ball.vx).to.equal(vx)
        expect(ball.vy).to.equal(vy)
    }
})