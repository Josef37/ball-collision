import { expect } from "chai";
import Ball from "./Ball"

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
            left: -10
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
            ball.collideWithWall(wall)
            expectBallPosition({ x: ball.radius + wall.left, y: 0 })
        })

        it("does collide with right wall", () => {
            ball.x = 8
            ball.collideWithWall(wall)
            expectBallPosition({ x: - ball.radius + wall.right, y: 0 })
        })

        it("does collide with top wall", () => {
            ball.y = -8
            ball.collideWithWall(wall)
            expectBallPosition({ x: 0, y: ball.radius + wall.top })
        })

        it("does collide with bottom wall", () => {
            ball.y = 8
            ball.collideWithWall(wall)
            expectBallPosition({ x: 0, y: - ball.radius + wall.bottom })
        })

        it("changes velocity magintude and direction", () => {
            ball.x = 8
            ball.vx = 10
            ball.collideWithWall({ ...wall, bounceFactor: 0.5 })
            expect(ball.vx).to.equal(-5)
        })

        it("collides with corner wall", () => {
            ball.x = 8
            ball.y = 8
            ball.collideWithWall(wall)
            expectBallPosition({ x: wall.right - ball.radius, y: wall.bottom - ball.radius })
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

    describe("getLastCollisionWith", () => {
        it("returns 0 for touching balls", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 2, vx: 0, radius: 1 })
            const dt = ball1.getLastCollisionTimeWith(ball2)

            expect(dt).to.equal(0)
        })

        it("finds last collision for movement in x-dimension with equal velocity", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
            const dt = ball1.getLastCollisionTimeWith(ball2)

            expect(dt).to.equal(-0.5)
        })

        it("finds last collision for movement in x-dimension", () => {
            const ball1 = new Ball({ x: 0, vx: 3, radius: 1 })
            const ball2 = new Ball({ x: 1, vx: -1, radius: 1 })
            const dt = ball1.getLastCollisionTimeWith(ball2)

            expect(dt).to.equal(-0.25)
        })

        it("finds last collision for movement in y-dimension", () => {
            const ball1 = new Ball({ y: 0, vy: 3, radius: 1 })
            const ball2 = new Ball({ y: 1, vy: -1, radius: 1 })
            const dt = ball1.getLastCollisionTimeWith(ball2)

            expect(dt).to.equal(-0.25)
        })

        it("finds last collision for movement in both dimensions", () => {
            const ball1 = new Ball({ x: 0, y: 0, vx: 1, vy: 1, radius: 1 })
            const ball2 = new Ball({ x: 1, y: 1, vx: -1, vy: -1, radius: 1 })
            const dt = ball1.getLastCollisionTimeWith(ball2)

            const roundingError = 1e-8
            expect(dt).to.be.closeTo(-0.207106781, roundingError)
        })

        it("even finds next collision, when balls are sperated and going to collide", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 3, vx: -1, radius: 1 })
            const dt = ball1.getLastCollisionTimeWith(ball2)

            expect(dt).to.equal(0.5)
        })

        it("picks last collision, when balls are seperated (and seperating)", () => {
            const ball1 = new Ball({ x: 0, vx: -1, radius: 1 })
            const ball2 = new Ball({ x: 3, vx: 1, radius: 1 })
            const dt = ball1.getLastCollisionTimeWith(ball2)

            expect(dt).to.equal(-0.5)
        })
    })

    describe.only("collision (touching)", () => {
        it("works for one-dimensional collision (equal velocity)", () => {
            const ball1 = new Ball({ x: 0, vx: 1, radius: 1 })
            const ball2 = new Ball({ x: 2, vx: -1, radius: 1 })
            ball1._collideWith(ball2)
            expect(ball1.vx).to.equal(-1)
            expect(ball2.vx).to.equal(1)
        })
    })

    function expectBallPosition({ x, y }) {
        expect(ball.x).to.equal(x)
        expect(ball.y).to.equal(y)
    }

    function expectBallVelocity({ vx, vy }) {
        expect(ball.vx).to.equal(vx)
        expect(ball.vy).to.equal(vy)
    }
})