class Student {
    constructor(id, username, password, profilePic, mobile, grade) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.profilePic = profilePic;
        this.mobile = mobile;
        this.grade = grade;
        this.completedExams = [];
        this.nextExams = [];
    }

    addCompletedExam(examResult) {
        this.completedExams.push(examResult);
    }

    addNextExam(examId) {
        if (!this.nextExams.includes(examId)) {
            this.nextExams.push(examId);
        }
    }

    hasTakenExam(examId) {
        return this.completedExams.some(r => r.examId === examId);
    }
}

class Teacher {
    constructor(id, username, password, course) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.course = course;
        this.exams = [];
    }
    createExam(exam) {
        this.exams.push(exam);
    }
    assignStudentToExam(exam, studentId) {
        exam.assignStudent(studentId);
    }
}

class Question {
    constructor(id, text, image, choices, correctAnswer, difficulty, score) {
        this.id = id;
        this.text = text;
        this.image = image;
        this.choices = choices;
        this.correctAnswer = correctAnswer;
        this.difficulty = difficulty;
        this.score = score;
    }

    shuffleChoices() {
        let arr = this.choices.map((c, i) => ({ c, i }));
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        this.choices = arr.map(x => x.c);
        this.correctAnswer = arr.findIndex(x => x.i === this.correctAnswer);
    }
}

class Exam {
    constructor(teacherId,course,id, name, durationMinutes, numberOfQuestions, grade) {
        this.id = id;
        this.teacherId = teacherId;
        this.course = course;
        this.name = name;
        this.durationMinutes = durationMinutes;
        this.numberOfQuestions = numberOfQuestions;
        this.questions = [];
        this.grade = grade;
        this.assignedStudents = [];
        this.results = [];
    }

    addQuestion(question) {
        this.questions.push(question);
    }

    addResult(studentId, score, date) {
        this.results.push({ studentId, score, date });
    }

    getRandomizedQuestions() {
        let shuffled = [...this.questions]
            .map(q => Object.assign(new Question(), q))
            .sort(() => Math.random() - 0.5);
        shuffled.forEach(q => (typeof q.shuffleChoices === 'function') ? q.shuffleChoices() : null);
        return shuffled.slice(0, this.numberOfQuestions);
    }
}


class StorageService {
    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static load(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    static updateStudent(student) {
        let students = StorageService.load('students');
        const idx = students.findIndex(s => s.id === student.id);
        if (idx >= 0) {
            students[idx] = student;
        } else {
            students.push(student);
        }
        StorageService.save('students', students);
    }

    static updateTeacher(teacher) {
        let teachers = StorageService.load('teachers');
        const idx = teachers.findIndex(t => t.id === teacher.id);
        if (idx >= 0) {
            teachers[idx] = teacher;
        } else {
            teachers.push(teacher);
        }
        StorageService.save('teachers', teachers);
    }

    static updateExam(exam) {
        let exams = StorageService.load('exams');
        const idx = exams.findIndex(e => e.id === exam.id);
        if (idx >= 0) {
            exams[idx] = exam;
        } else {
            exams.push(exam);
        }
        StorageService.save('exams', exams);
    }
}

function setupDarkModeToggle() {
    const toggleBtn = document.getElementById('modeToggle');

    if (!toggleBtn) return;

    function applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            toggleBtn.textContent = 'Switch to Light Mode';
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            toggleBtn.textContent = 'Switch to Dark Mode';
            localStorage.setItem('darkMode', 'false');
        }
    }

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    applyTheme(isDarkMode);

    toggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        applyTheme(!isDark);
    });
}