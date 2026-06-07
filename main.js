let a, b, result;

let score = 0;
let streak = 0;

let globalTimer = 250;
let questionTimer = 10;

let globalInterval;
let questionInterval;

let used = new Set();

let answered = false;

let level = "Easy";

let wrongQuestions = [];
let correctAnswers = 0;

let START_TIME = 250;
let maxNumber = 9;

const LEVELS = {
    Easy: { max: 9, time: 200 },
    Medium: { max: 12, time: 300 },
    Hard: { max: 15, time: 400 },
    ULTRA_Hard: { max: 20, time: 500 }
};

/* START */
function startGame() {

    let settings = LEVELS[level];

    globalTimer = settings.time;
    START_TIME = settings.time;
    maxNumber = settings.max;

    document.getElementById("globalTimer").innerText = globalTimer;

    document.getElementById("menu").style.display = "none";

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }

    startCountdown();
}

/* LEVEL CHANGE */
function changeLevel() {
    level = document.getElementById("levelSelect").value;
}

/* GLOBAL TIMER */
function startGlobalTimer() {
    globalInterval = setInterval(() => {
        globalTimer--;
        document.getElementById("globalTimer").innerText = globalTimer;

        if (globalTimer <= 0) endGame();
    }, 1000);
}

/* GENERATE */
function generate() {

    let max = maxNumber;

    let list = [];

    for (let i = 2; i <= max; i++) {
        for (let j = i; j <= max; j++) {
            list.push([i, j]);
        }
    }

    let available = list.filter(x => !used.has(x.join("*")));

    if (available.length === 0) return endGame();

    let pick = available[Math.floor(Math.random() * available.length)];

    a = pick[0];
    b = pick[1];
    result = a * b;

    used.add(`${a}*${b}`);

    document.getElementById("question").innerText = `${a} × ${b}`;

    startQuestionTimer();
}

/* TIMER */
function startQuestionTimer() {
    clearInterval(questionInterval);

    questionTimer = 10;
    document.getElementById("timerBox").innerText = `⏱ ${questionTimer}`;

    questionInterval = setInterval(() => {
        questionTimer--;
        document.getElementById("timerBox").innerText = `⏱ ${questionTimer}`;

        if (questionTimer <= 0) {
            skip_();
        }
    }, 1000);
}

/* SHOW ANSWER */
function showAnswer() {

    clearInterval(questionInterval);

    document.getElementById("answerBox").innerText = result;
    document.getElementById("overlay").style.display = "flex";
}

function correct() {
    if (answered) return;

    score += 10;
    streak++;
    correctAnswers++;
    answered = true;

    showScoreAnimation("+10", "plus");

    update();
    closePopup();
    nextQuestion();
}

function wrong() {
    if (answered) return;

    score -= 5;
    streak = 0;
    answered = true;

    wrongQuestions.push({
        a: a,
        b: b,
        result: result
    });

    showScoreAnimation("-5", "minus");

    update();
    closePopup();
    nextQuestion();
}
function skip_() {
    if (answered) return;

    score -= 10;
    streak = 0;
    answered = false;


    wrongQuestions.push({
        a: a,
        b: b,
        result: result
    });

    showScoreAnimation("-10", "minus");

    update();
    closePopup();
    nextQuestion();
}

function startCountdown() {

    const screen = document.getElementById("countdown");
    const text = document.getElementById("countdownText");

    screen.style.display = "flex";

    let numbers = ["3", "2", "1", "GO!"];
    let index = 0;

    text.innerText = numbers[index];

    if (numbers[index] === "GO!") {
        text.style.color = "#16a34a";
    } else {
        text.style.color = "#2563eb";
    }

    const interval = setInterval(() => {

        index++;

        if (index >= numbers.length) {

            clearInterval(interval);

            screen.style.display = "none";

            document.getElementById("game").style.display = "block";

            startGlobalTimer();
            nextQuestion();

            return;
        }

        text.classList.remove("countAnim");
        void text.offsetWidth;
        text.classList.add("countAnim");

        text.innerText = numbers[index];

    }, 1000);
}

/* CLOSE POPUP */
function closePopup() {
    document.getElementById("overlay").style.display = "none";
}

/* NEXT */
function nextQuestion() {
    clearInterval(questionInterval);
    answered = false;
    generate();
}

/* UPDATE */
function update() {
    document.getElementById("score").innerText = score;
    document.getElementById("streak").innerText = streak;
}

/* RESET */
function resetGame() {
    location.reload();
}

/* END */
function endGame() {

    clearInterval(globalInterval);
    clearInterval(questionInterval);

    let usedTime = START_TIME - globalTimer;

    let sortedWrong = wrongQuestions.sort((x, y) => {

        if (x.a === y.a) {
            return x.b - y.b;
        }

        return x.a - y.a;
    });

    document.body.innerHTML = `
    
    <div class="menu">
    
        <h1>🏆 Test Report</h1>
    
        <h2>Score: ${score}</h2>
    
        <h3>✅ Correct: ${correctAnswers}</h3>
    
        <h3>❌ Wrong: ${wrongQuestions.length}</h3>
    
        <h3>📊 Level: ${level}</h3>
    
        <h3>⏱ Used time: ${usedTime} sec</h3>
    
        <h3>⌛ Remaining time: ${globalTimer} sec</h3>
    
        <hr>
    
        <h2>Wrong Questions</h2>
    
        ${sortedWrong.length
            ? sortedWrong.map(q => `<p>${q.a} × ${q.b} = ${q.result}</p>`).join("")
            : "<p>No mistakes 🎉</p>"
        }

        <button class="blue" onclick="location.reload()">
            Reset
        </button>

    </div>
    
    `;
}
function showScoreAnimation(text, type) {

    const scoreBox = document.getElementById("scoreContainer");
    const rect = scoreBox.getBoundingClientRect();

    const div = document.createElement("div");

    div.className = "scoreEffect " + type;
    div.innerText = text;

    div.style.left = (rect.left + rect.width / 2 - 15) + "px";
    div.style.top = (rect.top + 30) + "px";

    document.body.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 1000);
}