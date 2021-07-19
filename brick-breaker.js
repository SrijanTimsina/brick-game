const rulesBtn = document.getElementById("rules-btn");
const rules = document.getElementById("rules");
const closeBtn = document.getElementById("close-btn");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start");
const settingsBtn = document.getElementById("settings");
const timer = document.getElementById("timer");
const mainMenu = document.getElementById("main-menu");
const settingsMenu = document.getElementById("settings-menu");
const goBack = document.getElementById("go-back");
const currentScore = document.getElementById("current-score");
const highestScore = document.getElementById("highest-score");
const batHittingBall = document.getElementById("bat-hitting-ball");
const ballHitWall = document.getElementById("ball-hit-wall");
const brickBreak = document.getElementById("brick-break");
const allCheckBox = document.querySelectorAll("input[type=radio]");
const ctx = canvas.getContext("2d");
let soundStatus = true;
let score = 0;
let theme = "dark";
const brickRowCount = 9;
const brickColumnCount = 5;
const localArrayScores = JSON.parse(localStorage.getItem("scores-array"));
let scoresArray = [];
if (localStorage.getItem("scores-array") !== null) {
  scoresArray = localArrayScores;
  checkHighScore();
} else {
  scoresArray = [];
}
let active;
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 10,
  speed: 4,
  dx: 4,
  dy: -4,
};
let paddle = {
  x: canvas.width / 2 - 40,
  y: canvas.height - 20,
  w: 80,
  h: 10,
  speed: 8,
  dx: 0,
};
const brickInfo = {
  w: 70,
  h: 20,
  p: 10, //padding
  offsetX: 45,
  offsetY: 60,
  visible: true,
};

const bricks = [];
for (let i = 0; i < brickRowCount; i++) {
  bricks[i] = [];
  for (let j = 0; j < brickColumnCount; j++) {
    const x = i * (brickInfo.w + brickInfo.p) + brickInfo.offsetX;
    const y = j * (brickInfo.h + brickInfo.p) + brickInfo.offsetY;
    bricks[i][j] = { x, y, ...brickInfo };
  }
}
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
  ctx.fillStyle = "rgb(0,255,0)";
  ctx.fill();
  ctx.closePath();
}
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
  ctx.fillStyle = theme === "dark" ? "#f0f0f0" : "#000";
  ctx.fill();
  ctx.closePath();
}
function drawScore() {
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}
function drawBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      ctx.beginPath();
      ctx.rect(brick.x, brick.y, brickInfo.w, brickInfo.h);
      ctx.fillStyle = brick.visible ? "#0095dd" : "transparent";
      ctx.fill();
      ctx.closePath();
    });
  });
}
function movePaddle() {
  paddle.x += paddle.dx;

  if (paddle.x + paddle.w > canvas.width) {
    paddle.x = canvas.width - paddle.w;
  }
  if (paddle.x < 0) {
    paddle.x = 0;
  }
}
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
  if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0) {
    ball.dx *= -1;
    if (soundStatus) {
      ballHitWall.play();
    }
  }
  if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0) {
    ball.dy *= -1;
    if (soundStatus) {
      ballHitWall.play();
    }
  }
  if (
    ball.x - ball.size > paddle.x &&
    ball.x + ball.size < paddle.x + paddle.w &&
    ball.y + ball.size > paddle.y
  ) {
    ball.dy = -ball.speed;
    if (soundStatus) {
      batHittingBall.play();
    }
  }
  bricks.forEach((column) => {
    column.forEach((brick) => {
      if (brick.visible) {
        if (
          ball.x - ball.size > brick.x &&
          ball.x + ball.size < brick.x + brick.w &&
          ball.y + ball.size > brick.y &&
          ball.y - ball.size < brick.y + brick.h
        ) {
          if (soundStatus) {
            brickBreak.play();
          }
          ball.dy *= -1;
          brick.visible = false;
          increaseScore();
        }
      }
    });
  });
  if (ball.y + ball.size > canvas.height) {
    showAllBricks();
    currentScore.innerText = `Your Score :  ${score}`;
    scoresArray.push(score);
    checkHighScore();
    active = false;
    score = 0;
    mainMenu.style.zIndex = "10";
  }
}
function checkHighScore() {
  const highest = Math.max(...scoresArray);
  localStorage.setItem("scores-array", JSON.stringify(scoresArray));
  highestScore.innerText = `Your Best : ${highest}`;
}
function increaseScore() {
  score++;
  if (score % (brickRowCount * brickColumnCount) === 0) {
    showAllBricks();
  }
}
function showAllBricks() {
  bricks.forEach((column) => {
    column.forEach((brick) => {
      brick.visible = true;
    });
  });
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawScore();
  drawBricks();
}
function update() {
  movePaddle();
  moveBall();
  draw();
  if (active) {
    requestAnimationFrame(update);
  }
}
function keyDown(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    paddle.dx = paddle.speed;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    paddle.dx = -paddle.speed;
  }
}
function keyUp(e) {
  if (
    e.key === "Right" ||
    e.key === "ArrowRight" ||
    e.key === "Left" ||
    e.key === "ArrowLeft"
  ) {
    paddle.dx = 0;
  }
}

function toggleRules() {
  rules.classList.toggle("show");
}
rulesBtn.addEventListener("click", toggleRules);
closeBtn.addEventListener("click", toggleRules);
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
startBtn.addEventListener("click", () => {
  mainMenu.style.zIndex = "-10";
  let initialTime = 3;
  active = true;
  ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    speed: 4,
    dx: 4,
    dy: -4,
  };
  paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    w: 80,
    h: 10,
    speed: 8,
    dx: 0,
  };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle();
  drawBricks();
  setInterval(() => {
    timer.innerText = initialTime;
    if (initialTime < 1) {
      timer.innerText = "";
    }
    initialTime--;
    888;
  }, 1000);
  setTimeout(update, 4000);
});
function changeHandler(e) {
  if (this.value === "dark") {
    theme = "dark";
    settingsMenu.classList.remove("light");
    mainMenu.classList.remove("light");
    canvas.style.backgroundColor = "#000";
  } else if (this.value === "light") {
    theme = "light";
    settingsMenu.classList.add("light");
    mainMenu.classList.add("light");
    canvas.style.backgroundColor = "#f0f0f0";
  }
}
allCheckBox.forEach((radio) => {
  radio.addEventListener("change", changeHandler);
});
const soundCheck = document.getElementById("sound-check");
soundCheck.addEventListener("change", () => {
  soundStatus = soundCheck.checked;
});
settingsBtn.addEventListener("click", () => {
  settingsMenu.style.zIndex = "20";
});
goBack.addEventListener("click", () => {
  settingsMenu.style.zIndex = "-100";
});
