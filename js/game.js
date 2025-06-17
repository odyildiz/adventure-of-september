import characters from './characters.js';
import Player from './player.js';
import Platform from './platform.js';
import Coin from './coin.js';

export default class Game {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        
        // Check if canvas exists
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Get score element
        this.scoreElement = document.getElementById('score');
        if (!this.scoreElement) {
            console.error('Score element not found!');
        }
        
        // Get startup and character selection screens
        this.startupScreen = document.getElementById('startupScreen');
        this.characterSelection = document.getElementById('characterSelection');
        
        // Check if startup screen exists
        if (!this.startupScreen) {
            console.error('Startup screen not found!');
        }
        
        // Initialize empty game objects
        this.platforms = [];
        this.coins = [];
        this.player = null;
        this.gameStarted = false;
        
        // Set default dimensions for scaling calculations
        this.defaultWidth = 800;
        this.defaultHeight = 600;
        
        // Initialize with default character
        this.selectedCharacter = characters.find(char => char.isDefault) || characters[0];
        
        // Available characters from configuration
        this.availableCharacters = characters;
        
        // Set canvas size based on device
        this.setResponsiveCanvas();
        
        this.setupStartupScreen();
        this.setupCharacterSelection();
        
        console.log('Game initialized successfully');
    }

    addCustomCharacter(name, imagePath) {
        this.availableCharacters.push({
            color: '#ffffff',  // Default color as fallback
            name: name,
            image: imagePath
        });
        this.updateCharacterSelectionUI();
    }

    setupCharacterSelection() {
        const characterButton = document.getElementById('characterButton');
        const characterSelection = document.getElementById('characterSelection');
        
        if (characterButton && characterSelection) {
            // Add click event to character button
            characterButton.addEventListener('click', () => {
                this.toggleCharacterSelection();
            });
            
            // Add click handlers to character options
            const options = characterSelection.getElementsByClassName('character-option');
            
            Array.from(options).forEach(option => {
                option.addEventListener('click', () => {
                    const characterName = option.getAttribute('data-name');
                    
                    // Find the character in our characters array
                    console.log('Looking for character:', characterName);
                    console.log('Available characters:', this.availableCharacters);
                    
                    // Find the character by name, case-insensitive comparison
                    const selectedChar = this.availableCharacters.find(char => 
                        char.characterName && char.characterName.toLowerCase() === characterName.toLowerCase());
                    
                    if (selectedChar) {
                        console.log('Character found:', selectedChar);
                        // Update the selected character
                        this.selectedCharacter = selectedChar;
                        
                        if (this.player) {
                            this.player.characterName = selectedChar.characterName;
                            this.player.characterImage = selectedChar.characterImage;
                            
                            // Reload the image
                            this.player.image = new Image();
                            this.player.image.src = `images/${selectedChar.characterImage}`;
                        }
                        
                        // Start the game with the selected character
                        this.startGame();
                    } else {
                        console.error('Character not found:', characterName);
                        // Try to find by direct name match as fallback
                        const fallbackChar = this.availableCharacters.find(char => 
                            char.characterName === characterName);
                        
                        if (fallbackChar) {
                            console.log('Character found by direct match:', fallbackChar);
                            this.selectedCharacter = fallbackChar;
                            this.startGame();
                        } else {
                            // Use the first character as a last resort
                            console.log('Using default character as fallback');
                            this.startGame();
                        }
                    }
                    
                    characterSelection.style.display = 'none';
                });
            });
        }
    }
    

    setupStartupScreen() {
        const startButton = document.getElementById('startButton');

        startButton.addEventListener('click', () => {
            this.startGame();
        });
    }

    toggleCharacterSelection() {
        console.log('Toggling character selection');
        const isHidden = this.characterSelection.style.display === 'none' || this.characterSelection.style.display === '';
        console.log('Is hidden:', isHidden);
        this.characterSelection.style.display = isHidden ? 'block' : 'none';
        console.log('New display:', this.characterSelection.style.display);
    }

    startGame() {
        console.log('Starting game...');
        
        // Hide startup screen
        if (this.startupScreen) {
            this.startupScreen.style.display = 'none';
        }
        
        // Show game area
        const gameArea = document.getElementById('gameArea');
        if (gameArea) {
            gameArea.style.display = 'block';
            console.log('Game area displayed');
        } else {
            console.error('Game area element not found!');
        }
        
        // Create player with selected character
        this.player = new Player(
            this.canvas.width / 2, 
            this.canvas.height / 2,
            this.selectedCharacter
        );
        console.log('Player created with character:', this.selectedCharacter?.characterName || 'Default');

        // Initialize game objects with positions relative to canvas size
        const widthRatio = this.canvas.width / this.defaultWidth;
        const heightRatio = this.canvas.height / this.defaultHeight;
        
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('Scale factors:', widthRatio, 'x', heightRatio);
        
        this.platforms = [
            new Platform(300 * widthRatio, 400 * heightRatio, 200 * widthRatio, 20 * heightRatio),
            new Platform(100 * widthRatio, 300 * heightRatio, 200 * widthRatio, 20 * heightRatio),
            new Platform(500 * widthRatio, 200 * heightRatio, 200 * widthRatio, 20 * heightRatio)
        ];

        this.coins = [
            new Coin(350 * widthRatio, 350 * heightRatio),
            new Coin(150 * widthRatio, 250 * heightRatio),
            new Coin(550 * widthRatio, 150 * heightRatio)
        ];

        this.gameStarted = true;
        console.log('Game started flag set to true');
        
        this.setupControls();
        this.setupMobileControls();
        console.log('Controls set up');
        
        this.gameLoop();
        console.log('Game loop started');
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.player.moveLeft();
                    break;
                case 'ArrowRight':
                    this.player.moveRight();
                    break;
                case 'ArrowUp':
                case ' ':
                    this.player.jump();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' && this.player.velocityX < 0 ||
                e.key === 'ArrowRight' && this.player.velocityX > 0) {
                this.player.stop();
            }
        });
        
        // Touch controls
        let touchStartX = 0;
        let touchIdentifier = null;
        
        // Touch start event
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            touchStartX = touch.clientX;
            touchIdentifier = touch.identifier;
            
            // Check if touch is in the top half of the screen (for jump)
            if (touch.clientY < this.canvas.height / 2) {
                this.player.jump();
            }
        });
        
        // Touch move event for left/right movement
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            // Find the touch that started the gesture
            let touch = null;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchIdentifier) {
                    touch = e.changedTouches[i];
                    break;
                }
            }
            
            if (!touch) return;
            
            const touchCurrentX = touch.clientX;
            const touchDiffX = touchCurrentX - touchStartX;
            
            // Determine movement based on swipe direction
            if (touchDiffX < -20) { // Left swipe
                this.player.moveLeft();
            } else if (touchDiffX > 20) { // Right swipe
                this.player.moveRight();
            }
        });
        
        // Touch end event
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            // Find the touch that ended
            let touchEnded = false;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchIdentifier) {
                    touchEnded = true;
                    break;
                }
            }
            
            if (touchEnded) {
                this.player.stop();
                touchIdentifier = null;
            }
        });
        
        // Touch cancel event
        this.canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.player.stop();
            touchIdentifier = null;
        });
    }

    update() {
        if (!this.gameStarted) return;
        
        // Update player
        this.player.update();

        // Check platform collisions
        this.platforms.forEach(platform => {
            if (this.player.intersects(platform) && 
                this.player.y + this.player.height > platform.y &&
                this.player.y < platform.y) {
                this.player.y = platform.y - this.player.height;
                this.player.velocityY = 0;
                this.player.isJumping = false;
            }
        });

        // Check coin collisions
        this.coins.forEach(coin => {
            if (!coin.collected && this.player.intersects(coin)) {
                coin.collected = true;
                this.player.score += 10;
                this.scoreElement.textContent = `Score: ${this.player.score}`;
            }
        });

        // Update coins
        this.coins.forEach(coin => coin.update());

        // Screen boundaries
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        
        // If player falls down, restart the game
        if (this.player.y > this.canvas.height) {
            this.restartGame();
        }
        
        // Check if all coins are collected to advance to next level
        const allCoinsCollected = this.coins.every(coin => coin.collected);
        if (allCoinsCollected && this.coins.length > 0) {
            this.nextLevel();
        }
    }

    draw() {
        if (!this.gameStarted) return;
        
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#282a36');
        gradient.addColorStop(1, '#44475a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars in background
        for (let i = 0; i < 50; i++) {
            const x = Math.sin(Date.now() / 1000 + i) * 400 + 400;
            const y = Math.cos(Date.now() / 1000 + i) * 300 + 300;
            this.ctx.fillStyle = '#6272a4';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 1, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw game objects
        this.platforms.forEach(platform => platform.draw(this.ctx));
        this.coins.forEach(coin => coin.draw(this.ctx));
        this.player.draw(this.ctx);
    }

    gameLoop() {
        if (this.gameStarted) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    setupMobileControls() {
        const jumpButton = document.getElementById('jumpButton');
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');
        
        if (!jumpButton || !leftButton || !rightButton) return;
        
        // Jump button events
        jumpButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.player) this.player.jump();
        });
        
        // Left button events
        leftButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.player) this.player.moveLeft();
        });
        
        leftButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.player) this.player.stop();
        });
        
        // Right button events
        rightButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.player) this.player.moveRight();
        });
        
        rightButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (this.player) this.player.stop();
        });
    }
    
    restartGame() {
        console.log('Player fell down, restarting game...');
        
        // Reset player position
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.velocityY = 0;
        this.player.velocityX = 0;
        
        // Reset coins
        this.coins.forEach(coin => {
            coin.collected = false;
        });
        
        // Reset score
        this.player.score = 0;
        this.scoreElement.textContent = `Score: ${this.player.score}`;
    }
    
    nextLevel() {
        console.log('All coins collected, advancing to next level...');
        
        // Increase score for completing level
        this.player.score += 50;
        this.scoreElement.textContent = `Score: ${this.player.score}`;
        
        // Reset player position
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.velocityY = 0;
        this.player.velocityX = 0;
        
        // Create new platforms with different positions
        const widthRatio = this.canvas.width / this.defaultWidth;
        const heightRatio = this.canvas.height / this.defaultHeight;
        
        // Generate new platform layout
        this.platforms = [
            new Platform(200 * widthRatio, 450 * heightRatio, 250 * widthRatio, 20 * heightRatio),
            new Platform(50 * widthRatio, 350 * heightRatio, 150 * widthRatio, 20 * heightRatio),
            new Platform(400 * widthRatio, 250 * heightRatio, 200 * widthRatio, 20 * heightRatio),
            new Platform(600 * widthRatio, 350 * heightRatio, 150 * widthRatio, 20 * heightRatio),
            new Platform(300 * widthRatio, 150 * heightRatio, 150 * widthRatio, 20 * heightRatio)
        ];

        // Create new coins
        this.coins = [
            new Coin(250 * widthRatio, 400 * heightRatio),
            new Coin(100 * widthRatio, 300 * heightRatio),
            new Coin(450 * widthRatio, 200 * heightRatio),
            new Coin(650 * widthRatio, 300 * heightRatio),
            new Coin(350 * widthRatio, 100 * heightRatio)
        ];
    }
    
    setResponsiveCanvas() {
        // Get the container dimensions
        const container = document.getElementById('gameContainer');
        if (!container) {
            console.error('Game container not found!');
            return;
        }
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        console.log('Container dimensions:', containerWidth, 'x', containerHeight);
        
        // Calculate the aspect ratio
        const aspectRatio = this.defaultWidth / this.defaultHeight;
        
        // Set canvas size while maintaining aspect ratio
        let newWidth, newHeight;
        
        if (containerWidth / containerHeight > aspectRatio) {
            // Container is wider than needed
            newHeight = Math.min(containerHeight, this.defaultHeight);
            newWidth = newHeight * aspectRatio;
        } else {
            // Container is taller than needed
            newWidth = Math.min(containerWidth, this.defaultWidth);
            newHeight = newWidth / aspectRatio;
        }
        
        // Apply new dimensions
        this.canvas.width = newWidth || this.defaultWidth;
        this.canvas.height = newHeight || this.defaultHeight;
        
        console.log('Canvas resized to:', this.canvas.width, 'x', this.canvas.height);
        
        // Make sure canvas is visible
        this.canvas.style.display = 'block';
        
        // Scale game elements if the game has started
        if (this.gameStarted && this.player) {
            const scaleX = newWidth / this.defaultWidth;
            const scaleY = newHeight / this.defaultHeight;
            
            // Scale player
            this.player.x = this.player.x * scaleX;
            this.player.y = this.player.y * scaleY;
            
            // Scale platforms
            this.platforms.forEach(platform => {
                platform.x = platform.x * scaleX;
                platform.y = platform.y * scaleY;
                platform.width = platform.width * scaleX;
                platform.height = platform.height * scaleY;
            });
            
            // Scale coins
            this.coins.forEach(coin => {
                coin.x = coin.x * scaleX;
                coin.y = coin.y * scaleY;
                coin.width = coin.width * scaleX;
                coin.height = coin.height * scaleY;
            });
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game...');
    const game = new Game();
});

// Fallback initialization in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM already loaded, initializing game...');
    setTimeout(() => {
        const game = new Game();
    }, 100);
}
