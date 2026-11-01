// ==========================================
// 全域變數宣告：台北市立動物園非洲區 19 種動物名稱
// ==========================================
let animals = [
  '黑猩猩', '東非劍羚', '伊蘭羚羊', '環尾狐猴', '白頸狐猴',
  '查普曼斑馬', '河馬', '侏儒河馬', '白犀牛', '非洲獅',
  '非洲象', '網紋長頸鹿', '山地斑哥條紋羚', '西部低地大猩猩', '北非髯羊',
  '東非狒狒', '紅猴', '褐狐猴', '斑點鬣狗'
];

let animalImages = {}; // 儲存預載入動物圖片的物件
let testQuestions = []; // 10 道隨機測驗題目
let currentQuestionIndex = 0; // 目前題號索引
let score = 0;          // 玩家得分

// 遊戲狀態與按鈕控制變數
let gameState = 'MENU'; // 'MENU' 代表首頁, 'QUIZ' 代表測驗中, 'RESULT' 代表結算畫面
let startButton;        // 開始測驗按鈕
let nextButton;         // 下一題按鈕

// 答題互動狀態變數
let answered = false;     // 記錄當前題目是否已作答
let selectedOption = -1;  // 記錄玩家點擊的選項索引
let isCorrect = false;    // 記錄玩家答題是否正確
let answerTime = 0;       // 記錄點擊作答時的時間戳記 (ms)

// 首頁動態動畫物件（獅子、河馬、長頸鹿）
let roamingAnimals = [];
let clouds = [];

// ==========================================
// 預載入資源函數 (Preload)
// ==========================================
function preload() {
  // 迴圈預載入 19 種動物圖片
  for (let name of animals) {
    let pathJpg = '動物圖片2/' + encodeURIComponent(name) + '.jpg';
    let pathJPG = '動物圖片2/' + encodeURIComponent(name) + '.JPG';
    let pathPng = '動物圖片2/' + encodeURIComponent(name) + '.png';
    let pathRaw = '動物圖片2/' + name + '.jpg';

    animalImages[name] = loadImage(
      pathJpg,
      function() {},
      function() {
        animalImages[name] = loadImage(
          pathJPG,
          function() {},
          function() {
            animalImages[name] = loadImage(
              pathPng,
              function() {},
              function() {
                animalImages[name] = loadImage(
                  pathRaw,
                  function() {},
                  function() {
                    animalImages[name] = null; // 讀取失敗時改用向量備用圖
                  }
                );
              }
            );
          }
        );
      }
    );
  }
}

// ==========================================
// 初始化設定 (Setup)
// ==========================================
function setup() {
  createCanvas(windowWidth, windowHeight); // 建立全螢幕畫布
  rectMode(CENTER);  // 矩形以中心點對齊
  textAlign(CENTER, CENTER); // 文字置中對齊

  initMenuScene();      // 初始化首頁動物與雲朵動畫
  createStartButton();  // 建立首頁開始按鈕
  createNextButton();   // 建立遊戲中下一題按鈕
}

// ==========================================
// 初始化首頁背景漫遊動畫
// ==========================================
function initMenuScene() {
  roamingAnimals = [];
  clouds = [];

  let specificTypes = ['lion', 'hippo', 'giraffe']; // 指定獅子、河馬、長頸鹿三種動物

  // 初始化 6 隻動物，從畫面左側外隨機位置出發，由左向右移動
  for (let i = 0; i < 6; i++) {
    roamingAnimals.push({
      type: specificTypes[i % specificTypes.length],
      x: random(-400, width * 0.7),
      y: random(height * 0.65, height * 0.85),
      speed: random(1.5, 2.8), // 移動速度
      size: random(100, 140),  // 動物大小
      floatOffset: random(1000)
    });
  }

  // 初始化天空雲朵
  for (let i = 0; i < 4; i++) {
    clouds.push({
      x: random(width),
      y: random(40, 150),
      speed: random(0.3, 0.8),
      scale: random(0.8, 1.4)
    });
  }
}

// 建立首頁「開始測驗」按鈕
function createStartButton() {
  startButton = createButton('開始測驗');
  startButton.style('font-size', '22px');
  startButton.style('font-weight', 'bold');
  startButton.style('padding', '14px 40px');
  startButton.style('background-color', '#e76f51');
  startButton.style('color', '#ffffff');
  startButton.style('border', 'none');
  startButton.style('border-radius', '30px');
  startButton.style('cursor', 'pointer');
  startButton.style('box-shadow', '0 6px 12px rgba(0,0,0,0.15)');
  startButton.mousePressed(startQuiz);
}

// 建立「下一題」按鈕
function createNextButton() {
  nextButton = createButton('下一題');
  nextButton.style('font-size', '18px');
  nextButton.style('padding', '10px 28px');
  nextButton.style('background-color', '#2a9d8f');
  nextButton.style('color', '#ffffff');
  nextButton.style('border', 'none');
  nextButton.style('border-radius', '8px');
  nextButton.style('cursor', 'pointer');
  nextButton.style('box-shadow', '0 4px 6px rgba(0,0,0,0.1)');
  nextButton.mousePressed(goToNextQuestion);
  nextButton.hide();
}

// 點擊「開始測驗」時觸發：進入測驗畫面
function startQuiz() {
  gameState = 'QUIZ';
  startButton.hide();
  initQuiz();
}

// 初始化 10 道隨機測驗題目
function initQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  answered = false;
  testQuestions = [];

  let shuffledAnimals = shuffle([...animals]);
  let selectedTargets = shuffledAnimals.slice(0, 10); // 隨機抽 10 個題目目標

  for (let i = 0; i < selectedTargets.length; i++) {
    let target = selectedTargets[i];
    let distractorCandidates = animals.filter(a => a !== target);
    distractorCandidates = shuffle(distractorCandidates);
    let distractors = distractorCandidates.slice(0, 4); // 4 個干擾選項

    let options = shuffle([target, ...distractors]); // 5 個選項洗牌
    let correctIndex = options.indexOf(target);

    testQuestions.push({
      target: target,
      options: options,
      correctIndex: correctIndex
    });
  }
}

// ==========================================
// 主迴圈繪製函數 (Draw)
// ==========================================
function draw() {
  if (gameState === 'MENU') {
    drawMenuScreen();   // 繪製首頁畫面
  } else if (gameState === 'QUIZ') {
    drawQuizScreen();   // 繪製測驗畫面
  } else if (gameState === 'RESULT') {
    drawResultScreen(); // 繪製結算畫面
  }
}

// ------------------------------------------
// 1. 首頁畫面與動畫繪製
// ------------------------------------------
function drawMenuScreen() {
  background(170, 220, 245); // 天空背景藍

  // 繪製太陽
  noStroke();
  fill(255, 204, 0, 220);
  ellipse(width - 90, 80, 100, 100);

  // 繪製移動的雲朵
  fill(255, 245);
  for (let cloud of clouds) {
    cloud.x += cloud.speed;
    if (cloud.x > width + 100) cloud.x = -100;
    push();
    translate(cloud.x, cloud.y);
    scale(cloud.scale);
    ellipse(0, 0, 60, 40);
    ellipse(20, -10, 50, 40);
    ellipse(-20, -5, 45, 35);
    pop();
  }

  // 綠地草皮背景
  fill(138, 198, 104);
  rect(width / 2, height * 0.8, width, height * 0.4);

  // 園區圍欄裝飾
  stroke(120, 75, 45);
  strokeWeight(4);
  line(0, height * 0.62, width, height * 0.62);
  line(0, height * 0.66, width, height * 0.66);
  for (let x = 30; x < width; x += 70) {
    line(x, height * 0.6, x, height * 0.7);
  }

  // 繪製由左向右移動的動物動畫 (獅子、河馬、長頸鹿)
  for (let animal of roamingAnimals) {
    animal.x += animal.speed; // 向右移動
    if (animal.x > width + 150) { // 走到右側外面後重置到左側
      animal.x = -150;
      animal.y = random(height * 0.65, height * 0.85);
      animal.type = random(['lion', 'hippo', 'giraffe']);
    }

    let bounceY = sin(frameCount * 0.12 + animal.floatOffset) * 5; // 上下浮動感
    let legAngle = sin(frameCount * 0.25 + animal.floatOffset) * 0.3; // 走路四肢擺動

    push();
    translate(animal.x, animal.y + bounceY);
    drawSpecificAnimal(animal.type, animal.size, legAngle);
    pop();
  }

  // 主標題看板
  push();
  fill(255, 250, 235);
  stroke(120, 75, 45);
  strokeWeight(5);
  rect(width / 2, height * 0.25, min(width * 0.85, 600), 120, 20);

  noStroke();
  fill(60, 30, 10);
  textSize(min(width * 0.05, 30));
  textStyle(BOLD);
  text('臺北市立動物園', width / 2, height * 0.22);

  textSize(min(width * 0.038, 22));
  fill(200, 60, 40);
  text('非洲動物區圖鑑簡易測驗', width / 2, height * 0.28);
  pop();

  // 顯示開始按鈕
  startButton.show();
  startButton.position(width / 2 - 80, height * 0.42);
}

// 繪製特定動物向量動畫 (獅子、河馬、長頸鹿)
function drawSpecificAnimal(type, size, legAngle) {
  push();
  scale(size / 100);
  stroke(40);
  strokeWeight(2.5);

  if (type === 'lion') {
    fill(225, 155, 55);
    push(); translate(-22, 22); rotate(-legAngle); rect(-5, 0, 10, 24, 5); pop();
    push(); translate(-10, 22); rotate(legAngle); rect(-5, 0, 10, 24, 5); pop();
    push(); translate(12, 22); rotate(-legAngle); rect(-5, 0, 10, 24, 5); pop();
    push(); translate(24, 22); rotate(legAngle); rect(-5, 0, 10, 24, 5); pop();
    
    rect(0, 10, 56, 32, 10);
    fill(170, 80, 20);
    ellipse(22, -12, 54, 54);
    fill(225, 155, 55);
    ellipse(22, -12, 38, 38);
    ellipse(10, -26, 12, 12);
    ellipse(34, -26, 12, 12);
    
    fill(30); noStroke();
    ellipse(16, -16, 5, 6); ellipse(30, -16, 5, 6);
    fill(255); ellipse(17, -17, 2, 2); ellipse(31, -17, 2, 2);
    fill(160, 60, 30); ellipse(23, -10, 8, 6);
    noFill(); stroke(40); strokeWeight(2);
    arc(20, -5, 7, 6, 0, HALF_PI);
    arc(26, -5, 7, 6, HALF_PI, PI);

  } else if (type === 'hippo') {
    fill(180, 160, 190);
    push(); translate(-20, 18); rotate(-legAngle); rect(-6, 0, 12, 20, 5); pop();
    push(); translate(-6, 18); rotate(legAngle); rect(-6, 0, 12, 20, 5); pop();
    push(); translate(8, 18); rotate(-legAngle); rect(-6, 0, 12, 20, 5); pop();
    push(); translate(22, 18); rotate(legAngle); rect(-6, 0, 12, 20, 5); pop();
    
    rect(0, 6, 56, 34, 12);
    ellipse(22, -6, 36, 30);
    ellipse(32, -2, 26, 22);
    
    fill(30); noStroke();
    ellipse(20, -12, 4, 5);
    fill(255); ellipse(21, -13, 1.5, 1.5);
    fill(120, 100, 130); ellipse(38, -5, 4, 4); ellipse(32, -5, 4, 4);
    noFill(); stroke(40); strokeWeight(2);
    arc(32, 2, 12, 8, 0, PI);

  } else if (type === 'giraffe') {
    fill(245, 180, 50);
    push(); translate(-18, 25); rotate(-legAngle); rect(-3, 0, 7, 32, 3); pop();
    push(); translate(-8, 25); rotate(legAngle); rect(-3, 0, 7, 32, 3); pop();
    push(); translate(8, 25); rotate(-legAngle); rect(-3, 0, 7, 32, 3); pop();
    push(); translate(18, 25); rotate(legAngle); rect(-3, 0, 7, 32, 3); pop();
    
    rect(0, 12, 48, 28, 8);
    rect(16, -20, 14, 48, 6);
    
    fill(160, 85, 20); noStroke();
    ellipse(14, -28, 8, 6); ellipse(18, -12, 9, 7); ellipse(-4, 12, 10, 8);
    stroke(40); strokeWeight(2.5);
    
    fill(245, 180, 50);
    ellipse(24, -42, 26, 20);
    line(20, -50, 18, -56); line(26, -50, 26, -56);
    fill(160, 85, 20); ellipse(18, -56, 5, 5); ellipse(26, -56, 5, 5);
    
    fill(30); noStroke();
    ellipse(26, -44, 4, 5);
    fill(255); ellipse(27, -45, 1.5, 1.5);
    fill(160, 85, 20); ellipse(32, -41, 4, 3);
    noFill(); stroke(40); strokeWeight(1.8);
    arc(29, -38, 6, 5, 0, PI);
  }

  pop();
}

// ------------------------------------------
// 2. 測驗遊戲畫面繪製 (背景顏色要求：#bde0fe)
// ------------------------------------------
function drawQuizScreen() {
  background(189, 224, 254); // 設定為 #bde0fe 藍色背景

  if (currentQuestionIndex >= testQuestions.length) {
    gameState = 'RESULT';
    if (nextButton) nextButton.hide();
    return;
  }

  let q = testQuestions[currentQuestionIndex];

  drawHeader();          // 繪製頂部進度標題
  drawQuestionBox(q.target); // 繪製題目名稱提示框
  drawOptionCards(q);    // 繪製 5 個選項卡片與互動動畫

  if (answered) {
    drawFeedback(q);     // 繪製答題結果文字提示
    positionNextButton(); // 顯示下一題按鈕
  } else {
    nextButton.hide();
  }
}

// 繪製頂部標題與題號
function drawHeader() {
  fill(40);
  noStroke();
  textSize(26);
  textStyle(BOLD);
  text('臺北市立動物園－非洲動物區圖鑑測驗', width / 2, 35);

  textSize(16);
  textStyle(NORMAL);
  fill(80);
  text(`第 ${currentQuestionIndex + 1} / ${testQuestions.length} 題`, width / 2, 68);
}

// 繪製題目要求名稱框
function drawQuestionBox(targetName) {
  fill(255);
  stroke(220);
  strokeWeight(2);
  rect(width / 2, 115, min(width * 0.75, 450), 45, 10);

  fill(230, 57, 70);
  noStroke();
  textSize(22);
  textStyle(BOLD);
  text(`請點擊：【 ${targetName} 】`, width / 2, 115);
}

// 繪製選項卡片與互動回饋機制
function drawOptionCards(q) {
  let areaTop = 150;
  let areaBottom = height - 90;
  let availableHeight = areaBottom - areaTop;

  let row1Y = areaTop + availableHeight * 0.28;
  let row2Y = areaTop + availableHeight * 0.72;

  let maxImgSize = min(width * 0.26, availableHeight * 0.42, 240);

  let gapX1 = min(width * 0.36, 400);
  let gapX2 = min(width * 0.30, 320);

  let elapsedTime = millis() - answerTime;
  let isWithin15Sec = answered && (elapsedTime < 1500); // 1.5 秒內

  for (let i = 0; i < 5; i++) {
    let x, y;

    if (i < 2) {
      let offset = (i - 0.5) * gapX1;
      x = width / 2 + offset;
      y = row1Y;
    } else {
      let offset = (i - 3) * gapX2;
      x = width / 2 + offset;
      y = row2Y;
    }

    let offsetX = 0;
    let offsetY = 0;
    let showBg = false;
    let bgColor = color(255);

    if (answered) {
      if (i === q.correctIndex) {
        if (isCorrect) {
          showBg = true;
          bgColor = color(167, 201, 87); // 答對背景 #a7c957
          offsetY = sin(frameCount * 0.15) * 12;
        } else {
          if (!isWithin15Sec) {
            showBg = true;
            bgColor = color(58, 134, 255); // 滿1.5秒後顯示正確答案 #3a86ff
            offsetY = sin(frameCount * 0.15) * 12;
          }
        }
      } else if (i === selectedOption && !isCorrect) {
        if (isWithin15Sec) {
          showBg = true;
          bgColor = color(221, 45, 74); // 答錯背景 #dd2d4a
          offsetX = sin(frameCount * 0.4) * 10;
        } else {
          showBg = false; // 1.5秒後背景消失
        }
      }
    }

    push();
    translate(x + offsetX, y + offsetY);

    if (showBg) {
      noStroke();
      fill(bgColor);
      rect(0, 0, maxImgSize + 16, maxImgSize + 16, 16);
    }

    let animalName = q.options[i];
    drawOptionImage(animalName, 0, 0, maxImgSize, maxImgSize);

    pop();
  }
}

// 圖片縮放與完整呈現技術
function drawOptionImage(animalName, cx, cy, maxW, maxH) {
  let img = animalImages[animalName];

  if (img && img.width > 0 && img.height > 0) {
    let scaleX = maxW / img.width;
    let scaleY = maxH / img.height;
    let fitScale = min(scaleX, scaleY);

    let drawW = img.width * fitScale;
    let drawH = img.height * fitScale;

    push();
    imageMode(CORNER);
    image(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
    pop();
  } else {
    drawVectorAnimalFallback(cx, cy, maxW, maxH, animalName);
  }
}

// 備用向量圖案
function drawVectorAnimalFallback(cx, cy, maxW, maxH, name) {
  push();
  noStroke();

  push();
  translate(cx, cy - 6);
  scale(min(maxW, maxH) / 120);

  strokeWeight(2);
  stroke(60);

  if (name.includes('獅')) {
    fill(230, 160, 60);
    ellipse(0, 0, 60, 60);
    fill(180, 90, 30);
    ellipse(0, 0, 45, 45);
  } else if (name.includes('羚')) {
    fill(200, 150, 100);
    ellipse(0, 0, 50, 40);
    stroke(50); strokeWeight(3);
    line(-10, -15, -20, -40); line(10, -15, 20, -40);
  } else {
    fill(210, 180, 140);
    ellipse(0, -5, 50, 45);
  }
  pop();

  fill(100);
  noStroke();
  textSize(14);
  textStyle(BOLD);
  text(name, cx, cy + maxH * 0.38);
  pop();
}

// 繪製作答回饋文字
function drawFeedback(q) {
  let elapsedTime = millis() - answerTime;
  let isWithin15Sec = elapsedTime < 1500;

  push();
  textSize(20);
  textStyle(BOLD);
  noStroke();

  if (isCorrect) {
    fill(40, 167, 69);
    text('🎉 太棒了！答對了！', width / 2, height - 60);
  } else {
    fill(220, 53, 69);
    if (isWithin15Sec) {
      text('❌ 答錯了！思考一下喔...', width / 2, height - 60);
    } else {
      text(`❌ 正確答案是：【 ${q.target} 】`, width / 2, height - 60);
    }
  }
  pop();
}

// 定位下一題按鈕
function positionNextButton() {
  nextButton.show();
  nextButton.position(width / 2 - 45, height - 40);
}

// 滑鼠點擊選項事件
function mousePressed() {
  if (gameState !== 'QUIZ' || answered || currentQuestionIndex >= testQuestions.length) return;

  let q = testQuestions[currentQuestionIndex];

  let areaTop = 150;
  let areaBottom = height - 90;
  let availableHeight = areaBottom - areaTop;

  let row1Y = areaTop + availableHeight * 0.28;
  let row2Y = areaTop + availableHeight * 0.72;

  let maxImgSize = min(width * 0.26, availableHeight * 0.42, 240);

  let gapX1 = min(width * 0.36, 400);
  let gapX2 = min(width * 0.30, 320);

  for (let i = 0; i < 5; i++) {
    let x, y;

    if (i < 2) {
      let offset = (i - 0.5) * gapX1;
      x = width / 2 + offset;
      y = row1Y;
    } else {
      let offset = (i - 3) * gapX2;
      x = width / 2 + offset;
      y = row2Y;
    }

    if (
      mouseX > x - maxImgSize / 2 &&
      mouseX < x + maxImgSize / 2 &&
      mouseY > y - maxImgSize / 2 &&
      mouseY < y + maxImgSize / 2
    ) {
      selectedOption = i;
      answered = true;
      answerTime = millis();

      if (selectedOption === q.correctIndex) {
        isCorrect = true;
        score++;
      } else {
        isCorrect = false;
      }
      break;
    }
  }
}

// 前往下一題
function goToNextQuestion() {
  currentQuestionIndex++;
  answered = false;
  selectedOption = -1;
  isCorrect = false;

  if (currentQuestionIndex >= testQuestions.length) {
    nextButton.html('再測驗一次');
    nextButton.mousePressed(restartQuiz);
  }
}

// 重新開始測驗
function restartQuiz() {
  gameState = 'MENU';
  nextButton.html('下一題');
  nextButton.mousePressed(goToNextQuestion);
  nextButton.hide();
  initMenuScene();
}

// ------------------------------------------
// 3. 結算畫面繪製 (背景顏色要求：#bde0fe)
// ------------------------------------------
function drawResultScreen() {
  background(189, 224, 254); // 設定為 #bde0fe 藍色背景

  fill(255);
  stroke(200);
  strokeWeight(2);
  rect(width / 2, height / 2 - 20, min(width * 0.85, 520), 300, 16);

  noStroke();
  fill(40);
  textSize(30);
  textStyle(BOLD);
  text('🏆 測驗完成！', width / 2, height / 2 - 110);

  textSize(22);
  fill(70);
  text(`您在 10 題中答對了 ${score} 題`, width / 2, height / 2 - 45);

  let percentage = (score / testQuestions.length) * 100;
  let feedbackText = '';
  let feedbackColor = color(0);

  if (percentage === 100) {
    feedbackText = '太神了！您是非洲動物圖鑑大師！ 🦁🦒';
    feedbackColor = color(40, 167, 69);
  } else if (percentage >= 70) {
    feedbackText = '表現優異！對非洲動物相當熟悉呢！ 🐘';
    feedbackColor = color(42, 157, 143);
  } else if (percentage >= 50) {
    feedbackText = '不錯喔！再多逛幾次台北動物園會更棒！ 🦏';
    feedbackColor = color(231, 111, 81);
  } else {
    feedbackText = '加油！不妨多複習幾次動物圖鑑喔！ 🦝';
    feedbackColor = color(224, 122, 95);
  }

  fill(feedbackColor);
  textSize(18);
  textStyle(BOLD);
  text(feedbackText, width / 2, height / 2 + 10);

  nextButton.show();
  nextButton.position(width / 2 - 55, height / 2 + 70);
}

// 視窗尺寸改變時自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}