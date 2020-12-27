import "./styles.css";
import { iteratePairs } from "./utils"
import { updateChart } from "./chart";
import Ball from "./Ball";

function updateFrame(ts) {
    const dt = updateTimestep();
    clearCanvas();

    moveBalls();
    collideBalls();
    collideWithWalls();

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
        }
    }

    function collideBalls() {
        iteratePairs(balls, (ball1, ball2) => ball1.collideWith(ball2));
    }

    function collideWithWalls() {
        for (const ball of balls) {
            ball.collideWithWall({
                top: 0,
                right: canvas.width,
                bottom: canvas.height,
                left: 0
            })
        }
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
            vx: (Math.random() * 2 - 1) * 0.2,
            vy: (Math.random() * 2 - 1) * 0.2,
            radius: 20
        })
    );

    requestAnimationFrame(updateFrame);

    return { canvas, oldTime, ctx, balls };
}

let { canvas, oldTime, ctx, balls } = init();
