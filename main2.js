// script.js

// Get references to the DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const restartBtn = document.getElementById('restart-btn');

// Set canvas size
canvas.width = 320;
canvas.height = 480;

// Game variables
let bird, pipes, score, highScore, gameOver, round, pipeGap, pipeSpeed;
const gravity = 0.2; // Reduced gravity to make the bird fall slower
const lift = -5; // Reduced lift to make the bird jump less high
const birdSpeed = 0;
const birdInitialX = 50;
let birdVelocity = birdSpeed;

// Pipe variables
const pipeWidth = 50;
let minPipeGapHeight = 100;  // Minimum gap height between top and bottom pipes
let maxPipeGapHeight = 250;  // Maximum gap height
let minPipeDistance = 150;   // Minimum horizontal distance between consecutive pipes

// Load bird image
const birdImg = new Image();
birdImg.src = 'bird.png'; // Replace with your bird image file path

// Initialize game state
function startGame() {
    bird = {
        x: birdInitialX,
        y: canvas.height / 2,
        width: 30,  // Width of the bird
        height: 20, // Height of the bird
        velocity: birdVelocity
    };
    
    pipes = [];
    score = 0;
    round = 1;
    pipeGap = 150;  // Starting gap
    pipeSpeed = 2;  // Starting pipe speed
    gameOver = false;

    // Show the canvas and restart button
    restartBtn.style.display = 'none';
    scoreEl.textContent = score;

    // Reset bird position and pipe positions
    bird.y = canvas.height / 2;
    bird.velocity = birdSpeed;
    
    // Start the game loop
    gameLoop();
}

// Function to handle the game loop
function gameLoop() {
    if (gameOver) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update bird position
    bird.velocity += gravity;
    bird.y += bird.velocity;
    
    // Prevent bird from going out of bounds
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    } else if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
    
    // Draw the bird (using the bird image)
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Generate pipes
    if (Math.random() < 0.02) {
        createPipe();
    }

    // Move and draw pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
        ctx.fillStyle = '#228B22'; // Dark green color for the pipes
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight); // Top pipe
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipe.width, pipe.bottomHeight); // Bottom pipe

        // Check collision with pipes
        if (
            bird.x + bird.width > pipe.x &&
            bird.x < pipe.x + pipe.width &&
            (bird.y < pipe.topHeight || bird.y + bird.height > canvas.height - pipe.bottomHeight)
        ) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
            }
            highScoreEl.textContent = highScore;
            restartBtn.style.display = 'block';
        }

        // Remove pipes off-screen
        if (pipe.x + pipe.width < 0) {
            pipes = pipes.filter(p => p !== pipe);
            score++;
            scoreEl.textContent = score;
        }
    });

    // If 5 pipes have been passed, advance to next round
    if (score % 5 === 0 && score > 0) {
        round++;
        pipeGap = Math.max(100, pipeGap - 10);  // Narrow the gap slightly with each round, but not less than 100
        pipeSpeed += 0.05;  // Increase pipe speed slightly with each round
        minPipeGapHeight = Math.max(100, minPipeGapHeight - 5); // Narrow the min gap height slightly each round
        maxPipeGapHeight = Math.max(200, maxPipeGapHeight - 10); // Similarly reduce max gap height
        scoreEl.textContent = `Round ${round} - Score: ${score}`;
    }

    // Continue the game loop if not game over
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Function to create a new pipe with valid spacing and legal gap
function createPipe() {
    // Ensure that the vertical gap is within a valid range (minPipeGapHeight, maxPipeGapHeight)
    const pipeTopHeight = Math.floor(Math.random() * (canvas.height - pipeGap - maxPipeGapHeight)) + minPipeGapHeight;
    const pipeBottomHeight = canvas.height - pipeTopHeight - pipeGap;

    // Ensure that pipes are spaced with a minimum horizontal distance from each other
    if (pipes.length > 0) {
        const lastPipe = pipes[pipes.length - 1];
        if (lastPipe.x + pipeWidth + minPipeDistance > canvas.width) {
            return; // Skip creating pipes if the last one is too close to the right edge
        }
    }

    pipes.push({ x: canvas.width, topHeight: pipeTopHeight, bottomHeight: pipeBottomHeight, width: pipeWidth });
}

// Event listener for bird jump
document.addEventListener('keydown', () => {
    if (!gameOver) {
        bird.velocity = lift;
    }
});

// Restart the game
restartBtn.addEventListener('click', () => {
    startGame();
});

// Initialize high score from local storage
highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
highScoreEl.textContent = highScore;

// Save high score to local storage
function saveHighScore() {
    localStorage.setItem('highScore', highScore);
}

// Start the game when page loads
startGame();

// Update high score when the game ends
window.addEventListener('beforeunload', saveHighScore);
