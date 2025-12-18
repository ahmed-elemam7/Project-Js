const storedUser = JSON.parse(localStorage.getItem("currentUser"));
if (!storedUser) window.location.href = "../pages/login.html";
const student = Object.assign(new Student(), storedUser);

const examId = localStorage.getItem("currentExamId");
if (!examId) window.location.href = "../pages/studentProfile.html";

const exams = StorageService.load("exams").map(e => Object.assign(new Exam(), e));
const exam = exams.find(e => e.id == examId);

if (!exam) {
    alert('Exam not found');
    window.location.href = '../pages/studentProfile.html';
}

if (exam.questions && exam.questions.length) {
    exam.questions = exam.questions.map(q => Object.assign(new Question(), q));
}

if (student.hasTakenExam(exam.id, exam.version)) {
    alert("You already took this exam!");
    window.location.href = "../pages/studentProfile.html";
}

document.getElementById("examName").textContent = `${exam.name} (${exam.numberOfQuestions} required, ${exam.questions.length} added)`;

let questions = [];
try {
    questions = exam.getRandomizedQuestions();
} catch (err) {
    console.error('Error getting randomized questions', err, exam.questions);
    alert('Error loading exam questions. Please contact the teacher.');
    window.location.href = '../pages/studentProfile.html';
}

let currentIndex = 0;
let totalScore = 0;
const totalQuestions = questions.length;

const totalSeconds = Math.max(1, (exam.durationMinutes || 1) * 60);
const perQuestionSec = Math.floor(totalSeconds / Math.max(1, totalQuestions));
let remaining = perQuestionSec;
let timerInterval = null;

const questionText = document.getElementById('questionText');
const questionImg = document.getElementById('questionImg');
const choicesDiv = document.getElementById('choices');
const nextBtn = document.getElementById('nextBtn');
const timerBar = document.getElementById('timerBar');
const timerText = document.getElementById('timerText');
const qMeta = document.getElementById('qMeta');

function startTimer() {
    clearInterval(timerInterval);
    remaining = perQuestionSec;
    updateTimerBar();
    timerInterval = setInterval(() => {
        remaining--;
        updateTimerBar();
        if (remaining <= 0) {
            clearInterval(timerInterval);
            disableChoices();
            nextBtn.disabled = false;
            setTimeout(() => nextQuestion(false), 700);
        }
    }, 1000);
}

function updateTimerBar() {
    const pct = Math.max(0, (remaining / perQuestionSec) * 100);
    timerBar.style.setProperty('--bar-pct', pct + '%');
    if (timerText) timerText.textContent = formatTime(remaining);
}

function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function renderCurrent() {
    const q = questions[currentIndex];
    if (!q) {
        questionText.textContent = 'Question missing';
        choicesDiv.innerHTML = '';
        nextBtn.disabled = false;
        return;
    }

    questionText.textContent = q.text;
    if (q.image) { questionImg.src = q.image; questionImg.style.display = 'block'; }
    else { questionImg.style.display = 'none'; }

    choicesDiv.innerHTML = '';
    if (!Array.isArray(q.choices)) q.choices = q.choices ? Object.values(q.choices) : [];
    while (q.choices.length < 4) q.choices.push('(missing)');
    if (typeof q.correctAnswer !== 'number') q.correctAnswer = 0;

    q.choices.forEach((ch, i) => {
        const btn = document.createElement('button');
        btn.className = 'choice-option';
        btn.textContent = ch;
        btn.dataset.idx = i;
        btn.addEventListener('click', () => handleChoice(btn, i));
        choicesDiv.appendChild(btn);
    });

    nextBtn.disabled = true;
    startTimer();
    qMeta.textContent = `Question ${currentIndex + 1} of ${totalQuestions} 
    — Defficulty: ${q.difficulty} — Score: ${q.score}`;
}

function disableChoices() {
    const btns = choicesDiv.querySelectorAll('button');
    btns.forEach(b => {
        b.disabled = true;
        b.classList.remove('selected');
    });
}

function handleChoice(btn, idx) {
    if (choicesDiv.querySelectorAll('button[disabled]').length > 0) return;
    clearInterval(timerInterval);
    const q = questions[currentIndex];
    const correctIdx = q.correctAnswer;

    q.studentAnswer = q.choices[idx];

    const btns = choicesDiv.querySelectorAll('button');
    btns.forEach((b, i) => {
        b.disabled = true;
        b.classList.remove('selected');
        b.classList.remove('correct');
        b.classList.remove('wrong');
        if (i === correctIdx) b.classList.add('correct');
        else b.classList.add('wrong');
    });

    btn.classList.add('selected');
    if (idx === correctIdx) totalScore += q.score || 0;
    nextBtn.disabled = false;
}

function nextQuestion(manual = true) {
    if (currentIndex < totalQuestions - 1) {
        currentIndex++;
        renderCurrent();
    } else finishExam();
}

nextBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    nextQuestion();
});

function finishExam() {
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('score').textContent = `Score: ${totalScore}`;

    const questionsForReview = questions.map(q => {
        return {
            text: q.text,
            choices: q.choices,
            correctAnswer: q.choices[q.correctAnswer],
            studentAnswer: q.studentAnswer || 'N/A',
            score: q.score,
            difficulty: q.difficulty
        };
    });

    const date = new Date().toLocaleString();
    const examResult = {
        examId: exam.id,
        examName: exam.name,
        score: totalScore,
        course: exam.course,
        date,
        questions: questionsForReview
    };

    student.completedExams = student.completedExams || [];
    student.completedExams.push(examResult);
    if (student.nextExams) student.nextExams = student.nextExams.filter(id => id !== exam.id);
    StorageService.save('students', StorageService.load('students').map(s => s.id === student.id ? student : s));
    StorageService.save('currentUser', student);

    exam.results = exam.results || [];
    exam.results.push({ studentId: student.id, score: totalScore, date });
    StorageService.updateExam(exam);

    nextBtn.disabled = true;
    nextBtn.style.display = 'none';
    clearInterval(timerInterval);
}

try {
    if (!questions || questions.length === 0) {
        questionText.textContent = 'This exam is not ready or no questions were added. Please notify your teacher.';
        choicesDiv.innerHTML = '';
        nextBtn.style.display = 'none';
    } else {
        renderCurrent();
    }
} catch (err) {
    console.error('Error during quiz start', err);
    questionText.textContent = 'Unexpected error while loading the exam. Please notify the teacher.';
    choicesDiv.innerHTML = '';
    nextBtn.style.display = 'none';
}