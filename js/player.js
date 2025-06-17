import Sprite from './sprite.js';

export default class Player extends Sprite {
    constructor(x, y, characterConfig) {
        super(x, y, 40, 40);
        this.jumpForce = -15;
        this.gravity = 0.8;
        this.speed = 5;
        this.isJumping = false;
        this.score = 0;
        
        // Character configuration
        this.characterName = characterConfig.characterName;
        this.characterImage = characterConfig.characterImage;
        
        // Animation properties
        this.jumpEffect = 0;
        this.moveEffect = 0;

        // Define gradient colors for fallback rendering
        this.gradientColors = {
            'Pink Hero': ['#ff79c6', '#bd93f9'],
            'Moana': ['#8be9fd', '#6272a4'],
            'Default': ['#50fa7b', '#34d058']
        };

        // Load character image
        if (this.characterImage) {
            this.image = new Image();
            this.image.src = `images/${this.characterImage}`;
        }
    }

    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Update position
        super.update();

        // Animation effects
        if (this.isJumping) {
            this.jumpEffect = Math.sin(Date.now() / 100) * 5;
        } else {
            this.jumpEffect = 0;
        }

        if (Math.abs(this.velocityX) > 0) {
            this.moveEffect = Math.sin(Date.now() / 150) * 3;
        } else {
            this.moveEffect = 0;
        }
    }

    draw(ctx) {
        if (this.image && this.image.complete) {
            // Draw character using image
            ctx.drawImage(
                this.image,
                this.x + this.moveEffect,
                this.y + this.jumpEffect,
                this.width,
                this.height
            );
        } else {
            // Create gradient for the player (fallback to original gradient-based drawing)
            const gradient = ctx.createLinearGradient(
                this.x, this.y, 
                this.x + this.width, this.y + this.height
            );
            const colors = this.gradientColors[this.characterName] || this.gradientColors['Default'];
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            ctx.fillStyle = gradient;

            // Draw player with animation effects
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(
                    this.x, 
                    this.y + this.jumpEffect, 
                    this.width, 
                    this.height + this.moveEffect,
                    10
                );
            } else {
                ctx.rect(
                    this.x, 
                    this.y + this.jumpEffect, 
                    this.width, 
                    this.height + this.moveEffect
                );
            }
            ctx.fill();

            // Draw eyes
            ctx.fillStyle = '#282a36';
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y + 15 + this.jumpEffect, 5, 0, Math.PI * 2);
            ctx.arc(this.x + 30, this.y + 15 + this.jumpEffect, 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw smile
            ctx.beginPath();
            ctx.arc(this.x + 20, this.y + 25 + this.jumpEffect, 8, 0, Math.PI);
            ctx.stroke();
        }
    }

    jump() {
        if (!this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }
    }

    moveLeft() {
        this.velocityX = -this.speed;
    }

    moveRight() {
        this.velocityX = this.speed;
    }

    stop() {
        this.velocityX = 0;
    }
}
