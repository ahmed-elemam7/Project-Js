const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "../pages/login.html";
const teacher = Object.assign(new Teacher(), storedUser);

const examId = StorageService.load("currentExamId");
if (!examId) window.location.href = "../pages/teacherDashboard.html";

const exams = StorageService.load("exams").map(e => Object.assign(new Exam(), e));
const exam = exams.find(e => e.id == examId);
document.getElementById("examTitle").textContent = exam.name;

const questionsList = document.getElementById("questionsList");

function renderQuestionsSlider() {
    questionsList.innerHTML = "";
    let currentIndex = 0;
    function renderSlide() {
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
            const img = document.createElement('img');
            img.src = q.image;
            img.style.maxWidth = '120px';
            img.style.display = 'block';
            img.style.margin = '6px auto';
            li.appendChild(img);
        }

        const choicesDiv = document.createElement('div');
        q.choices.forEach((c, idx) => {
            const choiceSpan = document.createElement("span");
            choiceSpan.textContent = c;
            choiceSpan.style.display = "inline-block";
            choiceSpan.style.margin = "0 5px";
            choiceSpan.style.padding = "4px 6px";
            choiceSpan.style.borderRadius = "4px";
            if (idx === q.correctAnswer) choiceSpan.style.backgroundColor = "#90ee90";
            choicesDiv.appendChild(choiceSpan);
        });
        li.appendChild(choicesDiv);

        const navDiv = document.createElement("div");
        navDiv.style.marginTop = "8px";

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.disabled = currentIndex === 0;
        prevBtn.onclick = () => { currentIndex--; renderSlide(); };

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.style.marginLeft = "8px";
        nextBtn.disabled = currentIndex === exam.questions.length - 1;
        nextBtn.onclick = () => { currentIndex++; renderSlide(); };

        navDiv.append(prevBtn, nextBtn);
        li.appendChild(navDiv);

        questionsList.appendChild(li);
    }
    renderSlide();
}

renderQuestionsSlider();

document.getElementById("questionForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (exam.questions.length >= exam.numberOfQuestions) {
        alert('Reached maximum questions.');
        return;
    }
    const id = Date.now();
    const text = document.getElementById("qText").value.trim();
    const imgSrc = document.getElementById("qImage").value.trim();
    const choices = [
        document.getElementById("choice1").value,
        document.getElementById("choice2").value,
        document.getElementById("choice3").value,
        document.getElementById("choice4").value
    ];
    const correct = +(document.getElementById("correctChoice").value);
    const difficulty = document.getElementById("difficulty").value;
    const score = +(document.getElementById("score").value);
    const questionData = new Question(id, text, imgSrc, choices, correct, difficulty, score);
    exam.addQuestion(questionData);
    StorageService.updateExam(exam);
    renderQuestionsSlider();
    document.getElementById("questionForm").reset();
});

document.getElementById('finalizeBtn').addEventListener('click', () => {
    const total = exam.questions.reduce((s, q) => s + (q.score || 0), 0);
    if (total !== 100) { alert('Total score must be 100'); return; }
    const counts = { Easy: 0, Middle: 0, Hard: 0 };
    exam.questions.forEach(q => counts[q.difficulty]++);
    if (counts.Easy === 0 || counts.Middle === 0 || counts.Hard === 0) { alert('Must include Easy/Middle/Hard'); return; }
    if (exam.questions.length < exam.numberOfQuestions) { alert('Not enough questions'); return; }
    StorageService.updateExam(exam);
    alert('Exam finalized.');
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
    const selected = Array.from(studentContainer.querySelectorAll("input[type=checkbox]:checked"));
    if (!selected.length) return alert("Select at least one student");

    const selectedStudents = selected.map(s => students.find(st => st.id == s.value));

    selectedStudents.forEach(st => {
        if (!st.nextExams.includes(exam.id)) {
            st.nextExams.push(exam.id);
        }
        if (!exam.assignedStudents.includes(st.id)) {
            exam.assignedStudents.push(st.id);
        }
        StorageService.updateStudent(st);
    });

    StorageService.updateExam(exam);

    const names = selectedStudents.map(s => s.username).join(", ");
    alert(`Assigned to: ${names}`);
});

document.getElementById("assignBtn").addEventListener("click", () => {
    students.forEach(st => {
        if (!st.nextExams.includes(exam.id)) {
            st.nextExams.push(exam.id);
        }
        if (!exam.assignedStudents.includes(st.id)) {
            exam.assignedStudents.push(st.id);
        }
        StorageService.updateStudent(st);
    });

    StorageService.updateExam(exam);

    alert("Assigned to all students");
});


