import Sprite from './sprite.js';

export default class Coin extends Sprite {
    constructor(x, y) {
        super(x, y, 20, 20, '#f1fa8c');
        this.rotationAngle = 0;
        this.collected = false;
    }

    update() {
        super.update();
        this.rotationAngle += 0.1;
        this.y += Math.sin(Date.now() / 500) * 0.5; // Floating effect
    }

    draw(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotationAngle);

        // Create gradient for coin
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
        gradient.addColorStop(0, '#f1fa8c');
        gradient.addColorStop(1, '#ffb86c');

        // Draw main circle
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const x = Math.cos(angle) * 5;
            const y = Math.sin(angle) * 5;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = '#ffb86c';
        ctx.fill();

        ctx.restore();
    }
}
