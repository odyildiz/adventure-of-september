import Sprite from './sprite.js';

export default class Platform extends Sprite {
    constructor(x, y, width) {
        super(x, y, width, 20, '#50fa7b');
    }

    draw(ctx) {
        // Create gradient for platform
        const gradient = ctx.createLinearGradient(
            this.x, this.y, 
            this.x, this.y + this.height
        );
        gradient.addColorStop(0, '#50fa7b');
        gradient.addColorStop(1, '#3ae66f');

        ctx.fillStyle = gradient;
        
        // Draw platform with rounded corners
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 5);
        ctx.fill();

        // Add some decoration
        ctx.fillStyle = '#2c8c4f';
        for (let i = 0; i < this.width; i += 30) {
            ctx.beginPath();
            ctx.roundRect(this.x + i, this.y + 5, 20, 3, 2);
            ctx.fill();
        }
    }
}
