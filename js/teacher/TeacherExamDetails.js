const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "../pages/login.html";
const teacher = Object.assign(new Teacher(), storedUser);

const examId = StorageService.load("currentExamId");
if (!examId) window.location.href = "../pages/teacherDashboard.html";

const exams = StorageService.load("exams").map(e => Object.assign(new Exam(), e));
const exam = exams.find(e => e.id == examId);
document.getElementById("examTitle").textContent = exam.name;

const questionsList = document.getElementById("questionsList");
let currentIndex = 0;
let editIndex = null;

function renderQuestionsSlider() {
    questionsList.innerHTML = "";
    if (exam.questions.length === 0) return;

    const q = exam.questions[currentIndex];
    const li = document.createElement("li");
    li.style.border = "1px solid grey";
    li.style.margin = "8px";
    li.style.padding = "12px";
    li.style.borderRadius = "15px";
    li.style.textAlign = "center";

    const questionText = document.createElement("div");
    questionText.innerHTML = `<strong>Q${currentIndex + 1}:</strong> ${q.text} [Score: ${q.score}] <span style="color:${q.difficulty === 'Easy' ? 'green' : q.difficulty === 'Middle' ? 'orange' : 'red'}">[${q.difficulty}]</span>`;
    li.appendChild(questionText);

    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.style.maxWidth = "120px";
        img.style.display = "block";
        img.style.margin = "6px auto";
        li.appendChild(img);
    }

    const choicesDiv = document.createElement("div");
    q.choices.forEach((c, idx) => {
        const span = document.createElement("span");
        span.textContent = c;
        span.style.display = "inline-block";
        span.style.margin = "0 5px";
        span.style.padding = "4px 6px";
        span.style.borderRadius = "4px";
        if (idx === q.correctAnswer) span.style.backgroundColor = "#90ee90";
        choicesDiv.appendChild(span);
    });
    li.appendChild(choicesDiv);

    const actions = document.createElement("div");
    actions.style.marginTop = "8px";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => loadQuestionForEdit(currentIndex);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "6px";
    deleteBtn.onclick = () => deleteQuestion(currentIndex);

    actions.append(editBtn, deleteBtn);
    li.appendChild(actions);

    const navDiv = document.createElement("div");
    navDiv.style.marginTop = "8px";

    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.disabled = currentIndex === 0;
    prevBtn.onclick = () => { currentIndex--; renderQuestionsSlider(); };

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.style.marginLeft = "8px";
    nextBtn.disabled = currentIndex === exam.questions.length - 1;
    nextBtn.onclick = () => { currentIndex++; renderQuestionsSlider(); };

    navDiv.append(prevBtn, nextBtn);
    li.appendChild(navDiv);

    questionsList.appendChild(li);
}

function loadQuestionForEdit(index) {
    const q = exam.questions[index];
    document.getElementById("qText").value = q.text;
    document.getElementById("qImage").value = q.image || "";
    document.getElementById("choice1").value = q.choices[0];
    document.getElementById("choice2").value = q.choices[1];
    document.getElementById("choice3").value = q.choices[2];
    document.getElementById("choice4").value = q.choices[3];
    document.getElementById("correctChoice").value = q.correctAnswer;
    document.getElementById("difficulty").value = q.difficulty;
    document.getElementById("score").value = q.score;
    editIndex = index;
}

function deleteQuestion(index) {
    exam.questions.splice(index, 1);
    if (currentIndex >= exam.questions.length) currentIndex--;
    if (currentIndex < 0) currentIndex = 0;
    StorageService.updateExam(exam);
    renderQuestionsSlider();
}

renderQuestionsSlider();

document.getElementById("questionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const text = document.getElementById("qText").value.trim();
    const imgSrc = document.getElementById("qImage").value.trim();
    const choices = [
        document.getElementById("choice1").value,
        document.getElementById("choice2").value,
        document.getElementById("choice3").value,
        document.getElementById("choice4").value
    ];
    const correct = +document.getElementById("correctChoice").value;
    const difficulty = document.getElementById("difficulty").value;
    const score = +document.getElementById("score").value;

    if (editIndex !== null) {
        const q = exam.questions[editIndex];
        q.text = text;
        q.image = imgSrc;
        q.choices = choices;
        q.correctAnswer = correct;
        q.difficulty = difficulty;
        q.score = score;
        editIndex = null;
    } else {
        if (exam.questions.length >= exam.numberOfQuestions) return alert("Reached maximum questions");
        const id = Date.now();
        const q = new Question(id, text, imgSrc, choices, correct, difficulty, score);
        exam.addQuestion(q);
        currentIndex = exam.questions.length - 1;
    }

    StorageService.updateExam(exam);
    renderQuestionsSlider();
    document.getElementById("questionForm").reset();
});

document.getElementById("finalizeBtn").addEventListener("click", () => {
    const total = exam.questions.reduce((s, q) => s + (q.score || 0), 0);
    if (total !== 100) return alert("Total score must be 100");

    const d = { Easy: 0, Middle: 0, Hard: 0 };
    exam.questions.forEach(q => d[q.difficulty]++);
    if (!d.Easy || !d.Middle || !d.Hard) return alert("Must include Easy/Middle/Hard");

    if (exam.questions.length < exam.numberOfQuestions) return alert("Not enough questions");
    StorageService.updateExam(exam);
    alert("Exam finalized");
});

const studentContainer = document.getElementById("studentSelect");
const students = StorageService.load("students") || [];

function renderStudents() {
    studentContainer.innerHTML = "";
    students.forEach(s => {
        const label = document.createElement("label");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.marginRight = "10px";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = s.id;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${s.username}`));
        studentContainer.appendChild(label);
    });
}

renderStudents();

document.getElementById("assignSingleBtn").addEventListener("click", () => {
    const selected = Array.from(studentContainer.querySelectorAll("input:checked"));
    if (!selected.length) return alert("Select at least one student");

    selected.forEach(c => {
        const st = students.find(s => s.id == c.value);
        if (!st.nextExams.includes(exam.id)) st.nextExams.push(exam.id);
        if (!exam.assignedStudents.includes(st.id)) exam.assignedStudents.push(st.id);
        StorageService.updateStudent(st);
    });

    StorageService.updateExam(exam);
    alert("Assigned");
});

document.getElementById("assignBtn").addEventListener("click", () => {
    students.forEach(st => {
        if (!st.nextExams.includes(exam.id)) st.nextExams.push(exam.id);
        if (!exam.assignedStudents.includes(st.id)) exam.assignedStudents.push(st.id);
        StorageService.updateStudent(st);
    });
    StorageService.updateExam(exam);
    alert("Assigned to all students");
});
