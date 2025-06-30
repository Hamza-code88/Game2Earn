document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.getElementById('score');
  const levelElement = document.getElementById('level');
  const playBtn = document.getElementById('play-btn');
  const gameUI = document.getElementById('game-ui');
  const stopBtn = document.getElementById('stop-btn');
  const resetBtn = document.getElementById('reset-btn');
  const levelModal = document.getElementById('level-modal');
  const modalLevel = document.getElementById('modal-level');
  const continueBtn = document.getElementById('continue-btn');
  const countdownOverlay = document.getElementById('countdown-overlay');
  
  // Mobile controls
  const upBtn = document.getElementById('up-btn');
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  const downBtn = document.getElementById('down-btn');

  // Page navigation elements
  const aboutLink = document.getElementById('about-link');
  const privacyLink = document.getElementById('privacy-link');
  const termsLink = document.getElementById('terms-link');
  const homeLink = document.getElementById('home-link');
  const footerAbout = document.getElementById('footer-about');
  const footerPrivacy = document.getElementById('footer-privacy');
  const footerTerms = document.getElementById('footer-terms');
  const footerHome = document.getElementById('footer-home');
  const aboutModal = document.getElementById('about-modal');
  const privacyModal = document.getElementById('privacy-modal');
  const termsModal = document.getElementById('terms-modal');
  const closeAbout = document.getElementById('close-about');
  const closePrivacy = document.getElementById('close-privacy');
  const closeTerms = document.getElementById('close-terms');

  // Game variables
  const gridSize = 20;
  let snake = [];
  let food = {};
  let dx = 0;
  let dy = 0;
  let score = 0;
  let level = 1;
  let foodEaten = 0;
  let gameSpeed = 150;
  let gameLoop;
  let changingDirection = false;
  let gameStarted = false;
  let isPaused = false;
  let snakeLength = 1;

  // Initialize game
  resetGame();

  // Event listeners
  playBtn.addEventListener('click', startGame);
  stopBtn.addEventListener('click', togglePause);
  resetBtn.addEventListener('click', resetGame);
  continueBtn.addEventListener('click', continueGame);
  document.addEventListener('keydown', changeDirection);
  
  // Mobile control event listeners with touch support
  upBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 38 });
  });
  leftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 37 });
  });
  rightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 39 });
  });
  downBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 40 });
  });

  // Also keep click events for devices with both touch and mouse
  upBtn.addEventListener('click', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 38 });
  });
  leftBtn.addEventListener('click', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 37 });
  });
  rightBtn.addEventListener('click', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 39 });
  });
  downBtn.addEventListener('click', (e) => {
    e.preventDefault();
    changeDirection({ keyCode: 40 });
  });

  // Page navigation event listeners
  aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.style.display = 'flex';
  });
  
  privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.style.display = 'flex';
  });
  
  termsLink.addEventListener('click', (e) => {
    e.preventDefault();
    termsModal.style.display = 'flex';
  });
  
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Already on home page
  });
  
  footerAbout.addEventListener('click', (e) => {
    e.preventDefault();
    aboutModal.style.display = 'flex';
  });
  
  footerPrivacy.addEventListener('click', (e) => {
    e.preventDefault();
    privacyModal.style.display = 'flex';
  });
  
  footerTerms.addEventListener('click', (e) => {
    e.preventDefault();
    termsModal.style.display = 'flex';
  });
  
  footerHome.addEventListener('click', (e) => {
    e.preventDefault();
    // Already on home page
  });
  
  closeAbout.addEventListener('click', () => {
    aboutModal.style.display = 'none';
  });
  
  closePrivacy.addEventListener('click', () => {
    privacyModal.style.display = 'none';
  });
  
  closeTerms.addEventListener('click', () => {
    termsModal.style.display = 'none';
  });

  // Start game function
  function startGame() {
    gameUI.style.display = 'flex';
    startWithCountdown();
  }
  
  // Toggle pause function
  function togglePause() {
    if (!gameStarted) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
      clearInterval(gameLoop);
      stopBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    } else {
      stopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
      gameLoop = setInterval(main, gameSpeed);
    }
  }

  // Start game with countdown
  function startWithCountdown() {
    levelModal.classList.remove('active');
    
    // Show countdown
    countdownOverlay.style.display = 'flex';
    let count = 3;
    countdownOverlay.textContent = count;
    
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownOverlay.textContent = count;
      } else {
        clearInterval(countdownInterval);
        countdownOverlay.style.display = 'none';
        actuallyStartGame();
      }
    }, 1000);
  }

  // New function to handle the actual game start
  function actuallyStartGame() {
    gameStarted = true;
    isPaused = false;
    stopBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    
    // Initial direction
    if (dx === 0 && dy === 0) {
      dx = gridSize;
      dy = 0;
    }
    
    gameLoop = setInterval(main, gameSpeed);
  }

  // Continue game after pause
  function continueGame() {
    levelModal.classList.remove('active');
    startWithCountdown();
  }

  // Main game function
  function main() {
    if (didGameEnd()) {
      clearInterval(gameLoop);
      gameStarted = false;
      showGameOver();
      return;
    }

    if (isPaused) return;

    changingDirection = false;
    setTimeout(() => {
      moveSnake();
      drawGame();

      if (didEatFood()) {
        increaseScore();
        createFood();
      }
    }, 0);
  }

  // Draw game elements
  function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(food.x + gridSize/2, food.y + gridSize/2, gridSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c0392b';
    ctx.stroke();
    
    // Draw snake
    snake.forEach((part, index) => {
      // Gradient effect for snake head
      if (index === 0) {
        const gradient = ctx.createLinearGradient(
          part.x, part.y, 
          part.x + gridSize, part.y + gridSize
        );
        gradient.addColorStop(0, '#00b894');
        gradient.addColorStop(1, '#55efc4');
        ctx.fillStyle = gradient;
      } else {
        // Body gets darker towards the tail
        const darkness = Math.min(0.7, index / snakeLength * 0.7);
        ctx.fillStyle = `rgba(0, 184, 148, ${1 - darkness})`;
      }
      
      ctx.fillRect(part.x, part.y, gridSize, gridSize);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.strokeRect(part.x, part.y, gridSize, gridSize);
      
      // Eyes for the head
      if (index === 0) {
        ctx.fillStyle = 'white';
        // Left eye
        ctx.beginPath();
        const leftEyeX = dx > 0 ? part.x + gridSize - 5 : 
                          dx < 0 ? part.x + 5 : 
                          part.x + gridSize/2 - 3;
        const leftEyeY = dy > 0 ? part.y + 5 : 
                        dy < 0 ? part.y + gridSize - 5 : 
                        part.y + gridSize/2 - 3;
        ctx.arc(leftEyeX, leftEyeY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        const rightEyeX = dx > 0 ? part.x + gridSize - 5 : 
                           dx < 0 ? part.x + 5 : 
                           part.x + gridSize/2 + 3;
        const rightEyeY = dy > 0 ? part.y + 5 : 
                         dy < 0 ? part.y + gridSize - 5 : 
                         part.y + gridSize/2 + 3;
        ctx.arc(rightEyeX, rightEyeY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, 1, 0, Math.PI * 2);
        ctx.arc(rightEyeX, rightEyeY, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Move snake
  function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    snakeLength++;

    if (!didEatFood()) {
      snake.pop();
      snakeLength--;
    }
  }

  // Change direction
  function changeDirection(event) {
    if (!gameStarted || changingDirection || isPaused) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    const LEFT = 37;
    const RIGHT = 39;
    const UP = 38;
    const DOWN = 40;

    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if (keyPressed === LEFT && !goingRight) {
      dx = -gridSize;
      dy = 0;
    }

    if (keyPressed === UP && !goingDown) {
      dx = 0;
      dy = -gridSize;
    }

    if (keyPressed === RIGHT && !goingLeft) {
      dx = gridSize;
      dy = 0;
    }

    if (keyPressed === DOWN && !goingUp) {
      dx = 0;
      dy = gridSize;
    }
  }

  // Check if game ended
  function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
      if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > canvas.width - gridSize;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > canvas.height - gridSize;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
  }

  // Create food
  function createFood() {
    food = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
    };

    // Check if food is created on snake
    snake.forEach(part => {
      const foodOnSnake = part.x === food.x && part.y === food.y;
      if (foodOnSnake) createFood();
    });
  }

  // Check if snake ate food
  function didEatFood() {
    return snake[0].x === food.x && snake[0].y === food.y;
  }

  // Increase score
  function increaseScore() {
    score += 10;
    foodEaten++;
    scoreElement.textContent = score;

    if (foodEaten >= 10) {
      levelUp();
    }
  }

  // Level up
  function levelUp() {
    level++;
    foodEaten = 0;
    levelElement.textContent = level;
    modalLevel.textContent = level - 1;
    
    // Increase game speed (cap at minimum 50ms)
    if (gameSpeed > 50) {
      gameSpeed -= 10;
      clearInterval(gameLoop);
    }
    
    // Pause game and show modal
    isPaused = true;
    clearInterval(gameLoop);
    
    // Check if we need to show the special code modal (after level 2)
    if (level === 3) {
       setTimeout(() => {
        window.open("https://www.profitableratecpm.com/xqq0jqpqd?key=87fe9b1aec8f8deeb0771dd72edde06b", "_blank");
      }, 500);
      showSpecialCodeModal();
    } else {
      // Show normal level complete modal
      levelModal.classList.add('active');
      
      // Open reward window
      setTimeout(() => {
        window.open("https://www.profitableratecpm.com/xqq0jqpqd?key=87fe9b1aec8f8deeb0771dd72edde06b", "_blank");
      }, 500);
    }
  }

  // Show special code modal (for level 2 completion)
  function showSpecialCodeModal() {
    // Create a new modal element
    const specialModal = document.createElement('div');
    specialModal.className = 'modal-overlay active';
    specialModal.innerHTML = `
      <div class="modal">
        <h2>Special Reward Code!</h2>
        <p>Congratulations on reaching level 3!</p>
        <p>Here's your special code:</p>
        <div class="code-container" style="
          background: #f1f1f1;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <span style="
            font-size: 24px;
            font-weight: bold;
            color: #2ecc71;
            letter-spacing: 2px;
          ">143329662</span>
          <button id="copy-code-btn" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
          ">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
        <p>Use this code to claim special rewards!</p>
        <button class="modal-btn" id="continue-from-special-btn">
          Continue Playing
        </button>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(specialModal);
    
    // Add copy functionality
    document.getElementById('copy-code-btn').addEventListener('click', () => {
      navigator.clipboard.writeText('143329662').then(() => {
        const copyBtn = document.getElementById('copy-code-btn');
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
      });
    });
    
    // Continue button functionality
    document.getElementById('continue-from-special-btn').addEventListener('click', () => {
      specialModal.remove();
      
      // Also show the normal level complete modal with reward
      levelModal.classList.add('active');
      
      // Open reward window
      setTimeout(() => {
        window.open("https://www.profitableratecpm.com/xqq0jqpqd?key=87fe9b1aec8f8deeb0771dd72edde06b", "_blank");
      }, 500);
    });
  }

  // Show game over message
  function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 30px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', canvas.width/2, canvas.height/2 - 30);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Poppins';
    ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText(`Level Reached: ${level}`, canvas.width/2, canvas.height/2 + 50);
    
    ctx.fillStyle = '#3498db';
    ctx.fillRect(canvas.width/2 - 100, canvas.height/2 + 90, 200, 40);
    ctx.fillStyle = 'white';
    ctx.font = '16px Poppins';
    ctx.fillText('Click to Restart', canvas.width/2, canvas.height/2 + 115);
    
    canvas.addEventListener('click', resetGame, { once: true });
  }

  // Reset game
  function resetGame() {
    clearInterval(gameLoop);
    score = 0;
    level = 1;
    foodEaten = 0;
    gameSpeed = 150;
    dx = 0;
    dy = 0;
    snake = [{ x: 200, y: 200 }];
    snakeLength = 1;
    gameStarted = false;
    isPaused = false;
    
    scoreElement.textContent = score;
    levelElement.textContent = level;
    
    createFood();
    drawGame();
    
    if (gameUI.style.display === 'flex') {
      startWithCountdown();
    }
  }
});