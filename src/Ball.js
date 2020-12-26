export default class Ball {
    constructor({ x, y, vx, vy, radius, color = "red", mass = 1 }) {
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

    // Reset the balls position to inside the canvas coordinate system
    // and multiply the wallwards velocity with factor.
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
}
