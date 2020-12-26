import "./styles.css";
import { iteratePairs, rotateCounterClockwise, rotateClockwise } from "./utils"
import { updateChart } from "./chart";
import Ball from "./Ball";

const collideTwoBalls = (ball0, ball1, dt) => {
    // 1. Rewind to moment of collision

    // 2. Collide 

    // 3. Fast-forward to actual time

    // (4. Calculate intersections once again?)

    if (!ball0.isColliding(ball1)) return

    const { dx, dy } = ball0.getVectorTo(ball1);

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
            ball.collideWithWall({
                top: 0,
                right: canvas.width,
                bottom: canvas.height,
                left: 0
            })
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

    const numberOfBalls = 20
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
