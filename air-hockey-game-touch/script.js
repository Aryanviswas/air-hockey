const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const goalSound = new Audio("sounds/goal.wav");
const hitSound = new Audio("sounds/paddle_hit.wav");

const winningScore = 5;
let gameOver = false;

const puck = {
  x: 400,
  y: 200,
  radius: 10,
  dx: 4,
  dy: 3,
  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.dx = -this.dx;
    this.dy = Math.random() * 4 - 2;
  }
};

const paddle1 = {
  x: 30,
  y: 170,
  width: 10,
  height: 60,
  dy: 0,
  score: 0
};

const paddle2 = {
  x: 760,
  y: 170,
  width: 10,
  height: 60,
  dy: 0,
  score: 0
};

document.addEventListener("keydown", (e) => {
  if (e.key === "w") paddle1.dy = -5;
  if (e.key === "s") paddle1.dy = 5;
  if (e.key === "ArrowUp") paddle2.dy = -5;
  if (e.key === "ArrowDown") paddle2.dy = 5;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") paddle1.dy = 0;
  if (e.key === "ArrowUp" || e.key === "ArrowDown") paddle2.dy = 0;
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText(`Player 1: ${paddle1.score}`, 50, 30);
  ctx.fillText(`Player 2: ${paddle2.score}`, canvas.width - 180, 30);
}

function update() {
  if (gameOver) return;

  puck.x += puck.dx;
  puck.y += puck.dy;

  if (puck.y < puck.radius || puck.y > canvas.height - puck.radius)
    puck.dy *= -1;

  paddle1.y += paddle1.dy;
  paddle2.y += paddle2.dy;

  paddle1.y = Math.max(0, Math.min(canvas.height - paddle1.height, paddle1.y));
  paddle2.y = Math.max(0, Math.min(canvas.height - paddle2.height, paddle2.y));

  if (
    puck.x - puck.radius < paddle1.x + paddle1.width &&
    puck.y > paddle1.y &&
    puck.y < paddle1.y + paddle1.height
  ) {
    puck.dx *= -1;
    puck.x = paddle1.x + paddle1.width + puck.radius;
    hitSound.play();
  }

  if (
    puck.x + puck.radius > paddle2.x &&
    puck.y > paddle2.y &&
    puck.y < paddle2.y + paddle2.height
  ) {
    puck.dx *= -1;
    puck.x = paddle2.x - puck.radius;
    hitSound.play();
  }

  if (puck.x < 0) {
    paddle2.score++;
    goalSound.play();
    puck.reset();
  }

  if (puck.x > canvas.width) {
    paddle1.score++;
    goalSound.play();
    puck.reset();
  }

  if (paddle1.score >= 5 || paddle2.score >= 5) {
    gameOver = true;
    const winner = paddle1.score > paddle2.score ? "Player 1" : "Player 2";
    document.getElementById("winnerText").textContent = `${winner} Wins!`;
    document.getElementById("gameOver").style.display = "block";
    return; // Stop further updates
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height, "#fff");
  drawRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height, "#fff");
  drawCircle(puck.x, puck.y, puck.radius, "#0f0");
  drawScore();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function restartGame() {
  paddle1.score = 0;
  paddle2.score = 0;
  puck.reset();
  gameOver = false;
  document.getElementById("gameOver").style.display = "none";
}

loop();

// Touch and mouse support
canvas.addEventListener("touchmove", handleTouch);
canvas.addEventListener("mousemove", handleTouch);

function handleTouch(e) {
  const rect = canvas.getBoundingClientRect();
  const touches = e.touches ? e.touches : [e];

  for (let t of touches) {
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;

    if (x < canvas.width / 2) {
      // Control paddle1
      paddle1.y = y - paddle1.height / 2;
    } else {
      // Control paddle2
      paddle2.y = y - paddle2.height / 2;
    }
  }

  e.preventDefault();
}
