import "./styles.css";
import { iteratePairs } from "./utils"
import { updateChart } from "./chart";

class Ball {
    constructor({ x, y, vx, vy, radius, color = "red" }) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;

        this.mass = 1;
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
    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
    move(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }
    translate({ x, y }) {
        this.x += x
        this.y += y
    }
    setPosition({ x, y }) {
        this.x = x
        this.y = y
    }
    setVelocity({ vx, vy }) {
        this.vx = vx
        this.vy = vy
    }
    get kineticEnergy() {
        return 1 / 2 * this.mass * this.velocity
    }
    get velocity() {
        return Math.sqrt(this.vx ** 2 + this.vy ** 2)
    }
}

// Reset the balls position to inside the canvas
// and multiply the wallwards velocity with factor.
const collideWall = (ball) => {
    const bounceFactor = 1

    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -bounceFactor;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -bounceFactor;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -bounceFactor;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -bounceFactor;
    }
};

// Rotate (x,y) counter-clockwise around (0,0) with `sin` and `cos` precomputed from the same angle
const rotateCounterClockwise = (x, y, sin, cos) => ({
    x: x * cos - y * sin,
    y: y * cos + x * sin
});

// Rotate (x,y) clockwise around (0,0) with `sin` and `cos` precomputed from the same angle
const rotateClockwise = (x, y, sin, cos) => ({
    x: x * cos + y * sin,
    y: y * cos - x * sin
});

const collideTwoBalls = (ball0, ball1, dt) => {
    if (isNoCollision(ball0, ball1)) return

    const { dx, dy } = getDistanceVector(ball0, ball1);



    // calculate angle, sine, and cosine
    const angle = Math.atan2(dy, dx);
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    // For the computation, rotate and translate the two balls, 
    // that ball0 is at (0,0) and ball1 is at (dist,0)
    let pos0 = 0;
    let pos1 = rotateClockwise(dx, dy, sin, cos).x;

    const vel0 = rotateClockwise(ball0.vx, ball0.vy, sin, cos);
    const vel1 = rotateClockwise(ball1.vx, ball1.vy, sin, cos);

    // Elastic collision along x-axis
    const vxTotal = vel0.x - vel1.x;
    vel0.x =
        ((ball0.mass - ball1.mass) * vel0.x + 2 * ball1.mass * vel1.x) /
        (ball0.mass + ball1.mass);
    vel1.x = vxTotal + vel0.x;

    // Undo overlap according to new velocities
    const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
    const overlap = ball0.radius + ball1.radius - Math.abs(pos0 - pos1);
    pos0 += (vel0.x / absV) * overlap;
    pos1 += (vel1.x / absV) * overlap;

    //rotate positions back
    const pos0F = rotateCounterClockwise(pos0, 0, sin, cos);
    const pos1F = rotateCounterClockwise(pos1, 0, sin, cos);

    //adjust positions to actual screen positions
    ball1.setPosition({
        x: ball0.x + pos1F.x,
        y: ball0.y + pos1F.y
    })
    ball0.setPosition({
        x: ball0.x + pos0F.x,
        y: ball0.y + pos0F.y
    })

    //rotate velocities back
    const vel0F = rotateCounterClockwise(vel0.x, vel0.y, sin, cos);
    const vel1F = rotateCounterClockwise(vel1.x, vel1.y, sin, cos);

    ball0.setVelocity({
        vx: vel0F.x,
        vy: vel0F.y
    })
    ball1.setVelocity({
        vx: vel1F.x,
        vy: vel1F.y
    })
};

function isNoCollision(ball0, ball1) {
    const { dx, dy } = getDistanceVector(ball0, ball1);
    const distanceSquared = dx * dx + dy * dy;
    const collisionDistanceSquared = (ball0.radius + ball1.radius) ** 2;
    return distanceSquared > collisionDistanceSquared;
}

function getDistanceVector(ball0, ball1) {
    return {
        dx: ball1.x - ball0.x,
        dy: ball1.y - ball0.y
    }
}

function updateFrame(ts) {
    const dt = updateTimestep();
    clearCanvas();

    moveBalls();
    collideBalls();
    renderBalls();

    updateEnergyChart();

    requestAnimationFrame(updateFrame);

    function updateTimestep() {
        const dt = ts - oldTime;
        oldTime = ts;
        return dt;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function moveBalls() {
        for (const ball of balls) {
            // ADD GRAVITY HERE
            // ball.vy += 0.01;
            ball.move(dt);
            collideWall(ball);
        }
    }

    function collideBalls() {
        iteratePairs(balls, (ball1, ball2) => collideTwoBalls(ball1, ball2, dt));
    }

    function renderBalls() {
        for (const ball of balls) {
            ball.render(ctx);
        }
    }

    function updateEnergyChart() {
        const energy = balls.reduce((energy, ball) => energy + ball.kineticEnergy, 0)
        updateChart({ x: ts, y: energy })
    }
}

function init() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    let oldTime = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const numberOfBalls = 36
    const balls = new Array(numberOfBalls).fill(null).map(
        () => new Ball({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() * 2 - 1),
            vy: (Math.random() * 2 - 1),
            radius: 20
        })
    );

    requestAnimationFrame(updateFrame);

    return { canvas, oldTime, ctx, balls };
}

let { canvas, oldTime, ctx, balls } = init();
