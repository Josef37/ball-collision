import "./styles.css";

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
        ctx.strokeRect(
            -this.radius,
            -this.radius,
            this.radius * 2,
            this.radius * 2
        );
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
}

const intersects = (rectA, rectB) => {
    return !(
        rectA.x + rectA.width < rectB.x ||
        rectB.x + rectB.width < rectA.x ||
        rectA.y + rectA.height < rectB.y ||
        rectB.y + rectB.height < rectA.y
    );
};

const collideWall = (ball) => {
    const wallBounceFactor = 0.5;
    const floorBounceFactor = 0.5;
    const ceilingBounceFactor = 1;

    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -wallBounceFactor;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -wallBounceFactor;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -ceilingBounceFactor;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -floorBounceFactor;
    }
};

const rotate = (x, y, sin, cos, reverse) => {
    return {
        x: reverse ? x * cos + y * sin : x * cos - y * sin,
        y: reverse ? y * cos - x * sin : y * cos + x * sin
    };
};

const collideBalls = (ball0, ball1, dt) => {
    const dx = ball1.x - ball0.x;
    const dy = ball1.y - ball0.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball0.radius + ball1.radius;
    if (dist < minDist) {
        //calculate angle, sine, and cosine
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        //rotate ball0's position
        const pos0 = { x: 0, y: 0 };

        //rotate ball1's position
        const pos1 = rotate(dx, dy, sin, cos, true);

        //rotate ball0's velocity
        const vel0 = rotate(ball0.vx, ball0.vy, sin, cos, true);

        //rotate ball1's velocity
        const vel1 = rotate(ball1.vx, ball1.vy, sin, cos, true);

        //collision reaction
        const vxTotal = vel0.x - vel1.x;
        vel0.x =
            ((ball0.mass - ball1.mass) * vel0.x + 2 * ball1.mass * vel1.x) /
            (ball0.mass + ball1.mass);
        vel1.x = vxTotal + vel0.x;

        const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
        const overlap = ball0.radius + ball1.radius - Math.abs(pos0.x - pos1.x);
        pos0.x += (vel0.x / absV) * overlap;
        pos1.x += (vel1.x / absV) * overlap;

        //rotate positions back
        const pos0F = rotate(pos0.x, pos0.y, sin, cos, false);
        const pos1F = rotate(pos1.x, pos1.y, sin, cos, false);

        //adjust positions to actual screen positions
        ball1.x = ball0.x + pos1F.x;
        ball1.y = ball0.y + pos1F.y;
        ball0.x = ball0.x + pos0F.x;
        ball0.y = ball0.y + pos0F.y;

        //rotate velocities back
        const vel0F = rotate(vel0.x, vel0.y, sin, cos, false);
        const vel1F = rotate(vel1.x, vel1.y, sin, cos, false);

        ball0.vx = vel0F.x;
        ball0.vy = vel0F.y;
        ball1.vx = vel1F.x;
        ball1.vy = vel1F.y;
    }
};

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

let oldTime = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const balls = new Array(36).fill(null).map(
    () =>
        new Ball({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() * 2 - 1) * 5,
            vy: (Math.random() * 2 - 1) * 5,
            radius: 20
        })
);

console.log(balls);

requestAnimationFrame(updateFrame);

function updateFrame(ts) {
    const dt = ts - oldTime;
    oldTime = ts;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const ball of balls) {
        // ADD GRAVITY HERE
        ball.vy += 2;
        ball.move(dt * 0.005);
        collideWall(ball);
    }

    iteratePairs(balls, (ball1, ball2) => collideBalls(ball1, ball2, dt));

    for (const ball of balls) {
        ball.render(ctx);
    }

    // const dist = ball2.x - ball1.x
    //   if (Math.abs(dist) < ball1.radius + ball2.radius) {
    //     const vxTotal = ball1.vx - ball2.vx
    //     ball1.vx = ((ball1.mass - ball2.mass) * ball1.vx + 2 * ball2.mass * ball2.vx) / (ball1.mass + ball2.mass)
    //     ball2.vx = vxTotal + ball1.vx

    //     ball1.x += ball1.vx
    //     ball2.x += ball2.vx
    //   }

    //     ball.vy += 0.5
    //     ball.x += ball.vx
    //     ball.y += ball.vy

    //

    //     ball.render(ctx)

    requestAnimationFrame(updateFrame);
}

// Iterate all possible (unordered) pairs in array
function iteratePairs(array, callback) {
    for (let i = 0; i < array.length; i++) {
        const el1 = array[i];
        for (let j = i + 1; j < array.length; j++) {
            const el2 = array[j];
            callback(el1, el2);
        }
    }
}
