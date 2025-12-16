
setupDarkModeToggle();

const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "login.html";
const teacher = Object.assign(new Teacher(), storedUser);

document.getElementsByClassName("teacherName")[0].innerText = teacher.name
document.getElementsByClassName("course")[0].innerText = " Course: " + teacher.course

const examsList = document.getElementById("examsList");

function renderExams() {
    examsList.innerHTML = "";

    const allExams = StorageService.load("exams").map(e => Object.assign(new Exam(), e));
    const teachers = StorageService.load("teachers").map(t => Object.assign(new Teacher(), t));
    const currentTeacher = teachers.find(t => t.id === teacher.id);

    const myExams = allExams.filter(e => e.teacherId === currentTeacher.id);

    myExams.forEach((ex) => {
        const li = document.createElement("li");
        li.textContent = `${ex.name} - Duration: ${ex.durationMinutes} mins - Questions: ${ex.numberOfQuestions}`;

        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.marginLeft = "10px";
        delBtn.style.height = "10px";
        delBtn.addEventListener("click", () => {
            const updatedExams = allExams.filter(e => e.id !== ex.id);
            StorageService.save("exams", updatedExams);
            currentTeacher.exams = currentTeacher.exams.filter(eid => eid !== ex.id);
            StorageService.updateTeacher(currentTeacher);
            renderExams();
        });

        li.appendChild(delBtn);
        examsList.appendChild(li);
    });
}

renderExams();

document.getElementById("createExamForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const id = Date.now();
    const name = document.getElementById("examName").value.trim();
    const duration = parseInt(document.getElementById("examDuration").value.trim());
    const numQ = parseInt(document.getElementById("numQuestions").value.trim());
    const grade = parseInt(document.getElementById("examGrade").value.trim());
    if (isNaN(numQ) || numQ < 1) {
        alert('Number of questions must be at least 15.');
        return;
    }
    const exam = new Exam(teacher.id, teacher.course, id, name, duration, numQ, grade, teacher);

    teacher.createExam(exam);
    StorageService.updateExam(exam);
    StorageService.updateTeacher(teacher);

    localStorage.setItem("currentExamId", exam.id);

    window.location.href = "TeacherExamDetails.html";
});