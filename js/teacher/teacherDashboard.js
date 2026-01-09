const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "../pages/login.html";
const teacher = Object.assign(new Teacher(), storedUser);
document.getElementsByClassName("teacherName")[0].innerText = teacher.name;
document.getElementsByClassName("course")[0].innerText = "Course: " + teacher.course;

const loadStudents = () => StorageService.load("students").map(s => Object.assign(new Student(), s));
const loadExams = () => StorageService.load("exams").map(e => Object.assign(new Exam(), e));
const examsList = document.getElementById("examsList");
const resultsDiv = document.getElementById("resultsDiv");
const reviewDiv = document.getElementById("reviewDiv");
const reviewStudentsGrid = document.getElementById("reviewStudentsGrid");
const reviewGradeFilter = document.getElementById("reviewGradeFilter");
const resultsGradeFilter = document.getElementById("resultsGradeFilter");
const resultsExamFilter = document.getElementById("resultsExamFilter");

function getAllExams() { return loadExams(); }
function getMyExamIds() { return getAllExams().filter(e => e.teacherId === teacher.id).map(e => e.id); }

function renderExams() {
    examsList.innerHTML = "";
    const allExams = loadExams();
    const myExams = allExams.filter(e => e.teacherId === teacher.id);
    myExams.forEach(ex => {
        const li = document.createElement("li");
        li.innerHTML = `${ex.name} - Grade: ${ex.grade} - Duration: ${ex.durationMinutes} mins - Questions: ${ex.numberOfQuestions}`;
        if (!ex.questions || ex.questions.length === 0) {
            const warn = document.createElement("span");
            warn.textContent = " ⚠ No Questions";
            warn.style.color = "red";
            li.appendChild(warn);
        }
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => { localStorage.setItem("currentExamId", ex.id); window.location.href = "../pages/TeacherExamDetails.html"; }
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => {
            StorageService.save("exams", allExams.filter(e => e.id !== ex.id));
            teacher.exams = teacher.exams.filter(id => id !== ex.id);
            StorageService.updateTeacher(teacher);
            renderExams();
            displayAllResults(resultsGradeFilter.value, resultsExamFilter.value);
            renderReviewStudents(reviewGradeFilter.value);
        };
        li.append(editBtn, delBtn);
        examsList.appendChild(li);
    });
    populateResultsExamFilter();
}
renderExams();

document.getElementById("createExamForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = examName.value.trim();
    const duration = +examDuration.value;
    const numQ = +numQuestions.value;
    const grade = examGrade.value;
    if (!["1", "2", "3"].includes(grade) || numQ < 15) { alert("Invalid exam rules"); return; }
    const id = Date.now();
    const exam = new Exam(teacher.id, teacher.course, id, name, duration, numQ, grade, teacher);
    teacher.createExam(exam);
    StorageService.updateExam(exam);
    StorageService.updateTeacher(teacher);
    localStorage.setItem("currentExamId", exam.id);
    window.location.href = "../pages/TeacherExamDetails.html";
});

function displayAllResults(filterGrade = "", filterExam = "") {
    resultsDiv.innerHTML = "";
    const students = loadStudents();
    students.forEach(st => {
        if (filterGrade && st.grade != filterGrade) return;
        st.completedExams?.forEach(rec => {
            if (!getMyExamIds().includes(rec.examId)) return;
            if (filterExam && rec.examId.toString() !== filterExam) return;
            const totalExamScore = rec.questions?.reduce((s, q) => s + (q.score || 0), 0) || 0;
            if (totalExamScore === 0) return;
            let studentScore = rec.questions?.reduce((s, q) => q.studentAnswer === q.correctAnswer ? s + (q.score || 0) : s, 0) || 0;
            const percent = Math.round((studentScore / totalExamScore) * 100);
            const passed = percent >= 50;
            const p = document.createElement("p");
            p.innerHTML = `<strong>${st.username}</strong> - ${rec.examName} - ${percent}% <span style="color:${passed ? "green" : "red"}; font-weight:bold">(${passed ? "Passed" : "Failed"})</span>`;
            resultsDiv.appendChild(p);
        });
    });
}

function populateResultsExamFilter() {
    resultsExamFilter.innerHTML = "";
    const allExams = loadExams().filter(e => e.teacherId === teacher.id);
    const optAll = document.createElement("option");
    optAll.value = "";
    optAll.textContent = "All Exams";
    resultsExamFilter.appendChild(optAll);
    allExams.forEach(ex => {
        const opt = document.createElement("option");
        opt.value = ex.id;
        opt.textContent = `${ex.name} (Grade ${ex.grade})`;
        resultsExamFilter.appendChild(opt);
    });
}

resultsGradeFilter.addEventListener("change", () => displayAllResults(resultsGradeFilter.value, resultsExamFilter.value));
resultsExamFilter.addEventListener("change", () => displayAllResults(resultsGradeFilter.value, resultsExamFilter.value));

displayAllResults();
populateResultsExamFilter();

function populateGradeFilter() {
    ["1", "2", "3"].forEach(g => {
        const opt = document.createElement("option");
        opt.value = g;
        opt.textContent = "Grade " + g;
        reviewGradeFilter.appendChild(opt);
    });
}
populateGradeFilter();

function renderReviewStudents(filterGrade = "") {
    reviewStudentsGrid.innerHTML = "";
    loadStudents().forEach(st => {
        if (!st.completedExams?.some(r => getMyExamIds().includes(r.examId))) return;
        if (filterGrade && st.grade.toString() !== filterGrade) return;
        const card = document.createElement("div");
        card.style.border = "1px solid #ccc";
        card.style.padding = "10px";
        card.style.borderRadius = "8px";
        card.style.width = "150px";
        card.style.textAlign = "center";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.alignItems = "center";
        card.style.cursor = "pointer";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.style.marginBottom = "8px";
        cb.student = st;
        cb.onchange = () => renderSelectedStudents();
        const name = document.createElement("p");
        name.textContent = st.username;
        const grade = document.createElement("p");
        grade.textContent = "Grade: " + st.grade;
        card.append(cb, name, grade);
        reviewStudentsGrid.appendChild(card);
    });
}

reviewGradeFilter.addEventListener("change", e => renderReviewStudents(e.target.value));
renderReviewStudents();

function renderSelectedStudents() {
    reviewDiv.innerHTML = "";
    Array.from(reviewStudentsGrid.querySelectorAll("input:checked")).map(c => c.student).forEach(student => {
        student.completedExams.forEach(rec => {
            if (!getMyExamIds().includes(rec.examId)) return;
            let index = 0;
            const sliderContainer = document.createElement("div");
            sliderContainer.style.border = "2px solid #666";
            sliderContainer.style.borderRadius = "8px";
            sliderContainer.style.padding = "10px";
            sliderContainer.style.marginBottom = "20px";
            const header = document.createElement("h3");
            header.textContent = `${student.username} - ${rec.examName}`;
            sliderContainer.appendChild(header);
            const contentDiv = document.createElement("div");
            sliderContainer.appendChild(contentDiv);
            const prevBtn = document.createElement("button");
            prevBtn.textContent = "Prev";
            prevBtn.style.marginRight = "10px";
            prevBtn.onclick = () => { if (index > 0) { index--; renderQuestion(); } };
            const nextBtn = document.createElement("button");
            nextBtn.textContent = "Next";
            nextBtn.onclick = () => { if (index < rec.questions.length - 1) { index++; renderQuestion(); } };
            sliderContainer.append(prevBtn, nextBtn);
            reviewDiv.appendChild(sliderContainer);
            function renderQuestion() {
                const q = rec.questions[index];
                const correct = q.studentAnswer === q.correctAnswer;
                contentDiv.innerHTML = `<p><strong>Q${index + 1}:</strong> ${q.text}</p>
<p>Choices: ${q.choices.join(" | ")}</p>
<p style="color:${correct ? "green" : "red"}">Student Answer: ${q.studentAnswer}</p>
<p style="color:blue">Correct Answer: ${q.correctAnswer}</p>
<p>Difficulty: ${q.difficulty}</p>`;
            }
            renderQuestion();
        });
    });
}
