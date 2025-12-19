const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "../pages/login.html";

const teacher = Object.assign(new Teacher(), storedUser);

document.getElementsByClassName("teacherName")[0].innerText = teacher.name;
document.getElementsByClassName("course")[0].innerText = " Course: " + teacher.course;

const loadStudents = () =>
    StorageService.load("students").map(s => Object.assign(new Student(), s));

const loadExams = () =>
    StorageService.load("exams").map(e => Object.assign(new Exam(), e));

const examsList = document.getElementById("examsList");

function renderExams() {
    examsList.innerHTML = "";

    const allExams = loadExams();
    const myExams = allExams.filter(e => e.teacherId === teacher.id);

    myExams.forEach(ex => {
        const li = document.createElement("li");
        li.textContent = `${ex.name} - Grade: ${ex.grade} - Duration: ${ex.durationMinutes} mins - Questions: ${ex.numberOfQuestions}`;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.marginLeft = "10px";
        delBtn.style.height = "10px";

        delBtn.addEventListener("click", () => {
            const updatedExams = allExams.filter(e => e.id !== ex.id);
            StorageService.save("exams", updatedExams);

            teacher.exams = teacher.exams.filter(id => id !== ex.id);
            StorageService.updateTeacher(teacher);

            renderExams();
        });

        li.appendChild(delBtn);
        examsList.appendChild(li);
    });
}

renderExams();

document.getElementById("createExamForm").addEventListener("submit", e => {
    e.preventDefault();

    const id = Date.now();
    const name = document.getElementById("examName").value.trim();
    const duration = +document.getElementById("examDuration").value.trim();
    const numQ = +document.getElementById("numQuestions").value.trim();
    const grade = +document.getElementById("examGrade").value.trim();

    if (isNaN(numQ) || numQ < 1) {
        alert("Number of questions must be at least 15.");
        return;
    }

    const exam = new Exam(teacher.id, teacher.course, id, name, duration, numQ, grade, teacher);

    teacher.createExam(exam);
    StorageService.updateExam(exam);
    StorageService.updateTeacher(teacher);

    StorageService.save("currentExamId", exam.id);
    window.location.href = "../pages/TeacherExamDetails.html";
});

const allExams = loadExams();
const myExamIds = allExams.filter(e => e.teacherId === teacher.id).map(e => e.id);
const examMap = Object.fromEntries(allExams.map(e => [e.id, e]));

const resultsDiv = document.getElementById("resultsDiv");

function displayAllResults() {
    resultsDiv.innerHTML = "";
    const students = loadStudents();

    students.forEach(st => {
        st.completedExams?.forEach(rec => {
            if (myExamIds.includes(rec.examId)) {
                const ex = examMap[rec.examId];
                const p = document.createElement("p");
                p.textContent = `${st.username} - Grade:${ex.grade} - ${ex.name} - Score: ${rec.score} - Date: ${new Date(rec.date).toLocaleDateString()}`;
                resultsDiv.appendChild(p);
            }
        });
    });
}

displayAllResults();

const reviewDiv = document.getElementById("reviewDiv");
const studentSelectForReview = document.getElementById("studentSelectForReview");

function populateStudentReviewSelect() {
    const students = loadStudents().filter(
        st => st.completedExams && st.completedExams.some(rec => myExamIds.includes(rec.examId))
    );

    students.forEach(st => {
        const option = document.createElement("option");
        option.value = st.id;
        option.textContent = st.username;
        studentSelectForReview.appendChild(option);
    });
}

populateStudentReviewSelect();

studentSelectForReview.addEventListener("change", function () {
    reviewDiv.innerHTML = "";
    const studentId = +this.value;
    const student = loadStudents().find(s => s.id === studentId);
    if (!student?.completedExams) return;

    student.completedExams.forEach(rec => {
        if (myExamIds.includes(rec.examId)) {
            const ex = examMap[rec.examId];

            const header = document.createElement("h3");
            header.textContent = `Student: ${student.username} - Grade: ${ex.grade} - Exam: ${ex.name} - Date: ${new Date(rec.date).toLocaleDateString()}`;
            reviewDiv.appendChild(header);

            if (!rec.questions?.length) {
                const p = document.createElement("p");
                p.textContent = "(Detailed question data is missing for this exam.)";
                reviewDiv.appendChild(p);
                return;
            }

            rec.questions.forEach((q, idx) => {
                const div = document.createElement("div");
                div.style.border = "1px solid grey";
                div.style.width = "80%";
                div.style.margin = "10px ";
                div.style.padding = "12px";
                div.style.textAlign = "center";
                div.style.borderRadius = "8px";
                div.innerText = `
                Q${idx + 1}: ${q.text}
                Choices: ${q.choices.join(" | ")}
                Student Answer: ${q.studentAnswer}
                Correct Answer: ${q.correctAnswer}
                `;
                reviewDiv.appendChild(div);
            });
        }
    });
});
