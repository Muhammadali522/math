let a, b, result;

let score = 0;
let streak = 0;
let maxStreak = 0;

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
    Easy: { max: 9, time: 200, total: 36 },
    Medium: { max: 12, time: 300, total: 66 },
    Hard: { max: 15, time: 400, total: 105 },
    ULTRA_Hard: { max: 20, time: 500, total: 190 }
};

function selectLevel(lvlName, element) {
    level = lvlName;
    const tabs = document.querySelectorAll('.level-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    element.classList.add('active');
}

function startGame() {
    let settings = LEVELS[level];
    globalTimer = settings.time;
    START_TIME = settings.time;
    maxNumber = settings.max;
    streak = 0;
    maxStreak = 0;

    document.getElementById("globalTimer").innerText = globalTimer;
    document.getElementById("menu").style.display = "none";
    document.getElementById("headerLevelSwitcher").style.display = "none";
    document.getElementById("headerProgressContainer").style.display = "flex";

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }

    startCountdown();
}

function startGlobalTimer() {
    clearInterval(globalInterval);
    globalInterval = setInterval(() => {
        globalTimer--;
        document.getElementById("globalTimer").innerText = globalTimer;
        if (globalTimer <= 0) endGame();
    }, 1000);
}

function generate() {
    let settings = LEVELS[level];
    let totalQuestions = settings.total;

    let list = [];
    for (let i = 2; i <= maxNumber; i++) {
        for (let j = i; j <= maxNumber; j++) {
            list.push([i, j]);
        }
    }

    let available = list.filter(x => !used.has(x.join("*")));
    if (available.length === 0) return endGame();

    let pick = available[Math.floor(Math.random() * available.length)];

    a = pick[0];
    b = pick[1];
    result = a * b;

    if (Math.random() > 0.5) {
        let temp = a;
        a = b;
        b = temp;
    }

    used.add(`${Math.min(a, b)}*${Math.max(a, b)}`);

    const questionEl = document.getElementById("question");
    questionEl.innerText = `${a} × ${b}`;
    questionEl.classList.remove('new');
    void questionEl.offsetWidth;
    questionEl.classList.add('new');

    let currentCount = used.size;
    document.getElementById("progressText").innerText = `${currentCount} / ${totalQuestions}`;
    let percentage = (currentCount / totalQuestions) * 100;
    document.getElementById("progressBarFill").style.width = `${percentage}%`;

    startQuestionTimer();
}

function startQuestionTimer() {
    clearInterval(questionInterval);
    questionTimer = 10;
    const timerEl = document.getElementById("timerBox");
    timerEl.innerText = `⏱ ${questionTimer}`;
    timerEl.classList.remove('low');

    questionInterval = setInterval(() => {
        questionTimer--;
        timerEl.innerText = `⏱ ${questionTimer}`;

        if (questionTimer <= 3) timerEl.classList.add('low');
        if (questionTimer <= 0) timeoutQuestion();
    }, 1000);
}

function showAnswer() {
    clearInterval(questionInterval);
    document.getElementById("answerBox").innerText = result;
    document.getElementById("overlay").style.display = "flex";
}

function correct() {
    if (answered) return;
    score += 10;
    streak++;
    if (streak > maxStreak) maxStreak = streak;
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

    wrongQuestions.push({ a: a, b: b, result: result, isSkipped: false });
    showScoreAnimation("-5", "minus");
    update();
    closePopup();
    nextQuestion();
}

function timeoutQuestion() {
    if (answered) return;
    score -= 10;
    streak = 0;
    answered = true;

    wrongQuestions.push({ a: a, b: b, result: result, isSkipped: true });
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
    text.style.color = "#2563eb";

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

        if (numbers[index] === "GO!") text.style.color = "#16a34a";
        else text.style.color = "#2563eb";

        text.classList.remove("countAnim");
        void text.offsetWidth;
        text.classList.add("countAnim");
        text.innerText = numbers[index];
    }, 1000);
}

function closePopup() {
    document.getElementById("overlay").style.display = "none";
}

function nextQuestion() {
    clearInterval(questionInterval);
    answered = false;
    generate();
}

function update() {
    document.getElementById("score").innerText = score;
    document.getElementById("streak").innerText = streak;
}

function resetGame() {
    location.reload();
}

function getGradeData(successRate) {
    if (successRate >= 90) return { grade: "5", label: "Отлично! 🎉", color: "#16a34a" };
    if (successRate >= 75) return { grade: "4", label: "Хорошо! 👍", color: "#2563eb" };
    if (successRate >= 50) return { grade: "3", label: "Удовлетворительно 😐", color: "#facc15" };
    if (successRate >= 20) return { grade: "2", label: "Неудовлетворительно 👎", color: "#ea580c" };
    return { grade: "1", label: "Очень плохо 💀", color: "#dc2626" };
}

function saveGameResult(lvl, finalScore, accuracy, grade, color) {
    let history = JSON.parse(localStorage.getItem("math_game_history") || "[]");
    let now = new Date();
    let timeString = now.toLocaleString("ru-RU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

    history.unshift({ date: timeString, level: lvl, score: finalScore, accuracy: accuracy, grade: grade, color: color });
    if (history.length > 20) history.pop();
    localStorage.setItem("math_game_history", JSON.stringify(history));

    let records = JSON.parse(localStorage.getItem("math_game_records") || "{}");
    if (!records[lvl] || finalScore > records[lvl]) {
        records[lvl] = finalScore;
    }
    localStorage.setItem("math_game_records", JSON.stringify(records));
}

function showHistory() {
    let history = JSON.parse(localStorage.getItem("math_game_history") || "[]");
    let container = document.getElementById("historyList");
    if (history.length === 0) {
        container.innerHTML = `<p class="no-data-msg">Вы ещё не сыграли ни одной игры 📜</p>`;
    } else {
        container.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="hist-meta">
                    <div class="hist-lvl">${item.level}</div>
                    <div class="hist-date">${item.date}</div>
                </div>
                <div class="hist-score">⭐ ${item.score} очков (${item.accuracy}%)</div>
                <div class="hist-badge" style="background: ${item.color};">${item.grade}</div>
            </div>
        `).join("");
    }
    document.getElementById("historyOverlay").style.display = "flex";
}

function closeHistory() {
    document.getElementById("historyOverlay").style.display = "none";
}

function showRecords() {
    let records = JSON.parse(localStorage.getItem("math_game_records") || "{}");
    let container = document.getElementById("recordsContainer");
    let keys = ["Easy", "Medium", "Hard", "ULTRA_Hard"];
    let labels = { Easy: "Easy 🟢", Medium: "Medium 🟡", Hard: "Hard 🔴", ULTRA_Hard: "Ultra 🔥" };

    container.innerHTML = keys.map(key => `
        <div class="rec-card">
            <div class="rec-lvl">${labels[key]}</div>
            <div class="rec-val">${records[key] !== undefined ? records[key] : 0}</div>
        </div>
    `).join("");
    document.getElementById("recordsOverlay").style.display = "flex";
}

function closeRecords() {
    document.getElementById("recordsOverlay").style.display = "none";
}

function endGame() {
    clearInterval(globalInterval);
    clearInterval(questionInterval);

    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    let usedTime = START_TIME - globalTimer;
    let remainingTime = globalTimer;
    let totalSeen = correctAnswers + wrongQuestions.length;

    let successRate = totalSeen > 0 ? Math.round((correctAnswers / totalSeen) * 100) : 0;
    let gradeData = getGradeData(successRate);

    let skippedCount = wrongQuestions.filter(q => q.isSkipped).length;
    let realWrongCount = wrongQuestions.filter(q => !q.isSkipped).length;

    saveGameResult(level, score, successRate, gradeData.grade, gradeData.color);

    let sortedWrong = wrongQuestions.sort((x, y) => (x.a === y.a ? x.b - y.b : x.a - y.a));

    document.body.innerHTML = `
    <div class="report-container">
        <h1>🏆 Итоговый Отчёт</h1>
        
        <div class="grade-badge-container">
            <div class="grade-circle" style="background: ${gradeData.color};">${gradeData.grade}</div>
            <div class="grade-label" style="color: ${gradeData.color};">${gradeData.label}</div>
            <div class="grade-percent">Точность: ${successRate}%</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card"><span class="stat-val" style="color:#2563eb;">${score}</span><span class="stat-lbl">Очки</span></div>
            <div class="stat-card"><span class="stat-val" style="color:#16a34a;">${correctAnswers}</span><span class="stat-lbl">Правильно</span></div>
            <div class="stat-card"><span class="stat-val" style="color:#dc2626;">${realWrongCount}</span><span class="stat-lbl">Ошибки</span></div>
            <div class="stat-card"><span class="stat-val" style="color:#f97316;">${skippedCount}</span><span class="stat-lbl">Пропущено</span></div>
            <div class="stat-card"><span class="stat-val">${totalSeen}</span><span class="stat-lbl">Всего</span></div>
            <div class="stat-card"><span class="stat-val">${usedTime}с</span><span class="stat-lbl">Прошло</span></div>
            <div class="stat-card"><span class="stat-val">${remainingTime}с</span><span class="stat-lbl">Осталось</span></div>
            <div class="stat-card"><span class="stat-val" style="color:#eab308;">${maxStreak}</span><span class="stat-lbl">Макс. серия</span></div>
        </div>
        
        <div class="wrong-section">
            <h2>Ошибки и пропущенные</h2>
            <div class="wrong-questions-list">
                ${sortedWrong.length ? sortedWrong.map(q => `
                    <div class="wrong-item ${q.isSkipped ? 'item-skipped' : 'item-wrong'}">
                        <span>${q.a} × ${q.b} = ${q.result}</span>
                        <span class="item-tag">${q.isSkipped ? '⏱ Пропущено' : '❌ Ошибка'}</span>
                    </div>
                `).join("") : "<p class='no-mistakes'>Идеально! Ошибок нет 🎉</p>"}
            </div>
        </div>

        <button class="blue reset-btn" onclick="location.reload()">Начать заново</button>
    </div>`;
}

function showScoreAnimation(text, type) {
    const scoreBox = document.getElementById("scoreContainer");
    const rect = scoreBox.getBoundingClientRect();
    const div = document.createElement("div");
    div.className = `scoreEffect ${type}`;
    div.innerText = text;
    div.style.left = (rect.left + rect.width / 2 - 25) + "px";
    div.style.top = (rect.top + window.scrollY + 40) + "px";
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 1000);
}