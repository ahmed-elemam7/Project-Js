
const storedUser = StorageService.load("currentUser");
if (!storedUser) window.location.href = "login.html";
const teacher = Object.assign(new Teacher(), storedUser);

const examId = StorageService.load("currentExamId");
if (!examId) window.location.href = "teacherDashboard.html";

const exams = StorageService.load("exams").map(e => Object.assign(new Exam(), e));
const exam = exams.find(e => e.id == examId);

document.getElementById("examTitle").textContent = exam.name;

const questionsList = document.getElementById("questionsList");

function renderQuestions() {
    questionsList.innerHTML = "";
    exam.questions.forEach((q, idx) => {
        const li = document.createElement("li");

        const questionText = document.createElement("div");
        questionText.textContent = `${idx + 1}. ${q.text} [Score: ${q.score}]`;
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
        choicesDiv.textContent = 'Choices: ' + q.choices.join(' | ');
        li.appendChild(choicesDiv);


        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => {
            exam.questions.splice(idx, 1);
            StorageService.updateExam(exam);
            renderQuestions();
        });
        li.appendChild(delBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.style.marginLeft = '8px';
        editBtn.addEventListener('click', () => {
            document.getElementById('qText').value = q.text;
            document.getElementById('choice1').value = q.choices[0] || '';
            document.getElementById('choice2').value = q.choices[1] || '';
            document.getElementById('choice3').value = q.choices[2] || '';
            document.getElementById('choice4').value = q.choices[3] || '';
            document.getElementById('correctChoice').value = q.correctAnswer;
            document.getElementById('difficulty').value = q.difficulty;
            document.getElementById('score').value = q.score;

            exam.questions.splice(idx, 1);
            StorageService.updateExam(exam);
            renderQuestions();
        });
        li.appendChild(editBtn);

        questionsList.appendChild(li);
    });
}

renderQuestions();

document.getElementById("questionForm").addEventListener("submit", function (e) {
    e.preventDefault();

    if (exam.questions.length >= exam.numberOfQuestions) {
        alert('You have already added the required number of questions.');
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
    const correct = parseInt(document.getElementById("correctChoice").value);
    const difficulty = document.getElementById("difficulty").value;
    const score = parseInt(document.getElementById("score").value);

    const saveQuestion = () => {
        const questionData = new Question(id, text, imgSrc, choices, correct, difficulty, score);
        exam.addQuestion(questionData);
        StorageService.updateExam(exam);
        renderQuestions();
        document.getElementById("questionForm").reset();
    }
    saveQuestion();
});

function calculateTotalScore() {
    return exam.questions.reduce((s, q) => s + (q.score || 0), 0);
}
document.getElementById('finalizeBtn').addEventListener('click', () => {
    const total = calculateTotalScore();
    if (total !== 100) {
        alert('Total questions score must sum to 100. Current total: ' + total);
        return;
    }
    StorageService.updateExam(exam);
    alert('Exam finalized and saved.');
});

document.getElementById('assignBtn').addEventListener('click', () => {
    const total = calculateTotalScore();
    if (total !== 100) {
        alert('Total questions score must sum to 100. Current total: ' + total);
        return;
    }
    const students = StorageService.load('students').map(s => Object.assign(new Student(), s));
    students.forEach(st => {
        if (Number(st.grade) === Number(exam.grade)) {
            if (!st.nextExams.includes(exam.id)) st.nextExams.push(exam.id);
            StorageService.updateStudent(st);
            if (!exam.assignedStudents.includes(st.id)) exam.assignedStudents.push(st.id);
        }
    });
    StorageService.updateExam(exam);
    alert('Assigned exam to all students.');
});
const students = StorageService.load('students')
    .map(s => Object.assign(new Student(), s))
    .filter(s => Number(s.grade) === Number(exam.grade));

const studentSelect = document.getElementById('studentSelect');

students.forEach(st => {
    const option = document.createElement('option');
    option.value = st.id;
    option.textContent = `${st.username} (Grade ${st.grade})`;
    studentSelect.appendChild(option);
});

document.getElementById('assignSingleBtn').addEventListener('click', () => {
    const total = calculateTotalScore();
    if (total !== 100) {
        alert('Total questions score must sum to 100. Current total: ' + total);
        return;
    }
    const selectedId = parseInt(studentSelect.value);
    const student = students.find(st => st.id === selectedId);
    if (!student) {
        alert('Student not found!');
        return;
    }
    if (!student.nextExams.includes(exam.id)) student.nextExams.push(exam.id);
    StorageService.updateStudent(student);

    if (!exam.assignedStudents.includes(student.id)) exam.assignedStudents.push(student.id);
    StorageService.updateExam(exam);

    alert(`Exam assigned to ${student.username}`);
});

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'teacherDashboard.html';
});
