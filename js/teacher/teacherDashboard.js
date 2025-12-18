const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "../pages/login.html";
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

    window.location.href = "../pages/TeacherExamDetails.html";
});

const allExams = StorageService.load('exams');
const myExamIds = allExams.filter(e => e.teacherId === teacher.id).map(e => e.id);


const resultsDiv = document.getElementById('resultsDiv');

function displayAllResults() {
    resultsDiv.innerHTML = '';
    const allStudents = StorageService.load('students').map(s => Object.assign(new Student(), s));

    allStudents.forEach(st => {
        if (st.completedExams && st.completedExams.length > 0) {
            st.completedExams.forEach(rec => {
                if (myExamIds.includes(rec.examId)) {
                    const ex = allExams.find(e => e.id == rec.examId);
                    const p = document.createElement('p');
                    p.textContent = `${st.username} - ${ex?.name || 'Unknown Exam'} - Score: ${rec.score} - Date: ${new Date(rec.date).toLocaleDateString()}`;
                    resultsDiv.appendChild(p);
                }
            });
        }
    });
}
displayAllResults();


const reviewDiv = document.getElementById('reviewDiv');
const studentSelectForReview = document.getElementById('studentSelectForReview');

function populateStudentReviewSelect() {
    const allStudents = StorageService.load('students').map(s => Object.assign(new Student(), s));
    studentSelectForReview.innerHTML = '<option value="" disabled selected>Select a student...</option>'; // لتحسين العرض
    allStudents.forEach(st => {
        const option = document.createElement('option');
        option.value = st.id;
        option.textContent = st.username;
        studentSelectForReview.appendChild(option);
    });
}
populateStudentReviewSelect();

studentSelectForReview.addEventListener('change', function () {
    reviewDiv.innerHTML = '';
    const studentId = parseInt(this.value);
    const student = StorageService.load('students').map(s => Object.assign(new Student(), s)).find(s => s.id === studentId);

    if (!student || !student.completedExams) return;

    student.completedExams.forEach(rec => {
        if (myExamIds.includes(rec.examId)) {
            const ex = allExams.find(e => e.id == rec.examId);

            const header = document.createElement('h3');
            header.textContent = `Student: ${student.username} - Exam: ${ex?.name || 'Unknown'} - Date: ${new Date(rec.date).toLocaleDateString()}`;
            reviewDiv.appendChild(header);

            if (!rec.questions || rec.questions.length === 0) {
                const p = document.createElement('p');
                p.textContent = `(Detailed question data is missing for this exam, perhaps the exam was taken before the latest update.)`;
                p.style.color = 'var(--muted-text)';
                reviewDiv.appendChild(p);
                return;
            }

            rec.questions.forEach((q, idx) => {
                const div = document.createElement('div');
                div.style.border = '1px solid var(--border-color)';
                div.style.margin = '10px 0';
                div.style.padding = '12px';
                div.style.borderRadius = '8px';

                const isCorrect = q.studentAnswer === q.correctAnswer;

                div.innerText = `
                    Q${idx + 1}: ${q.text}   
                    Choices: ${q.choices.join(' | ')}
                    Student Answer: ${q.studentAnswer}
                    Correct Answer: ${q.correctAnswer}
                `;
                reviewDiv.appendChild(div);
            });
        }
    });
});