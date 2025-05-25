let video;
let faceapi;
let detections = [];

let player = {
  x: 200,
  y: 350,
  size: 50,
  speed: 5,
  color: 'lime'
};

let obstacles = [];
let obstacleSpeed = 4;
let spawnRate = 90;

let score = 0;
let gameOver = false;

const faceOptions = { withLandmarks: true, withExpressions: false, withDescriptors: false };

function setup() {
  createCanvas(400, 400);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  faceapi = ml5.faceApi(video, faceOptions, faceReady);
  textAlign(CENTER, CENTER);
}

function faceReady() {
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) {
    console.error(error);
    return;
  }
  detections = result;

  faceapi.detect(gotFaces);
}

function draw() {
  background(34);

  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  if (gameOver) {
    fill('red');
    textSize(36);
    text('Game Over!', width / 2, height / 2 - 20);
    textSize(20);
    text('Score: ' + score, width / 2, height / 2 + 20);
    noLoop();
    return;
  }

  fill(player.color);
  rect(player.x, player.y, player.size, player.size, 10);

  if (detections.length > 0) {
    const mouth = detections[0].parts.mouth;

    let topLip = mouth[13];
    let bottomLip = mouth[19];

    let mouthOpenDist = dist(topLip._x, topLip._y, bottomLip._x, bottomLip._y);

    if (mouthOpenDist > 20) {
      player.y -= player.speed * 3;
    } else {
      player.y += player.speed * 2;
    }

    player.y = constrain(player.y, 200, height - player.size);
  }

  if (frameCount % spawnRate === 0) {
    let obsY = random(200, height - 50);
    obstacles.push({
      x: width,
      y: obsY,
      size: 40,
      color: 'orange'
    });
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    let o = obstacles[i];
    o.x -= obstacleSpeed;

    fill(o.color);
    ellipse(o.x, o.y, o.size);

    if (
      o.x - o.size / 2 < player.x + player.size &&
      o.x + o.size / 2 > player.x &&
      o.y + o.size / 2 > player.y &&
      o.y - o.size / 2 < player.y + player.size
    ) {
      gameOver = true;
    }

    if (o.x + o.size < 0) {
      obstacles.splice(i, 1);
      score++;
    }
  }

  fill(255);
  textSize(18);
  text('Score: ' + score, width / 2, 30);
}
