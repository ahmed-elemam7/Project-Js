const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "../pages/login.html";
const student = Object.assign(new Student(), storedUser);
const img = document.getElementById("profilePic");
img.onerror = () => {
    img.src = "../assets/images/avatar.png";
};
img.src = student.profilePic || "../assets/images/avatar.png";
document.getElementById("username").textContent = student.username;
document.getElementById("grade").textContent = "Grade: " + student.grade;

const completedList = document.getElementById("completedExams");
student.completedExams.forEach(ex => {
    const li = document.createElement("li");
    li.textContent = `${ex.course} : ${ex.examName} - Score: ${ex.score} - Date: ${ex.date}`;
    completedList.appendChild(li);
});

const nextList = document.getElementById("nextExams");
const exams = StorageService.load("exams").map(e => Object.assign(new Exam(), e));
student.nextExams.forEach(exId => {
    const exam = exams.find(e => e.id === exId);
    if (exam) {
        const li = document.createElement("li");
        li.textContent = `${exam.name} - Duration: ${exam.durationMinutes} mins`;

        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Exam';
        startBtn.style.marginLeft = '10px';
        const isTaken = student.hasTakenExam(exam.id, exam.version);
        const isAssigned = exam.assignedStudents ? exam.assignedStudents.includes(student.id) : false;
        const ready = exam.questions && exam.questions.length >= exam.numberOfQuestions;
        if (isTaken) {
            startBtn.disabled = true;
            startBtn.textContent = 'Already Taken';
        } else if (!isAssigned) {
            startBtn.disabled = true;
            startBtn.textContent = 'Not Assigned';
        } else if (!ready) {
            startBtn.disabled = true;
            startBtn.textContent = 'Not Ready';
        }

        startBtn.addEventListener('click', () => {
            if (exam.assignedStudents && !exam.assignedStudents.includes(student.id)) {
                alert('You are not assigned to take this exam.');
                return;
            }
            localStorage.setItem('currentExamId', exam.id);
            window.location.href = '../pages/quiz.html';
        });

        li.appendChild(startBtn);
        nextList.appendChild(li);
    }
});