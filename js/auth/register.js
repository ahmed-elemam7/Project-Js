document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = ''; 

    const id = Date.now();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const grade = parseInt(document.getElementById('grade').value.trim());
    const mobile = document.getElementById('mobile').value.trim();
    const profilePic= document.getElementById('profilePicInput').value.trim();
    const students = StorageService.load("students") || [];

    if (students.find(s => s.username === username)) {
        errorElement.textContent = "User already exists! Choose another username.";
        return;
    }
    if (password.length < 5) {
        errorElement.textContent = "Password must be at least 5 characters long.";
        return;
    }
    if (mobile.length !== 11) {
        errorElement.textContent = "Mobile must be 11 numbers long.";
        return;
    }
    if (isNaN(grade) || grade < 1 || grade > 3) {
        errorElement.textContent = "Grade must be between 1 and 3.";
        return;
    }

    const createStudent = () => {
        const student = new Student(id, username, password, profilePic, mobile, grade);
        StorageService.updateStudent(student);
        errorElement.style.color = 'green';
        errorElement.textContent = "Registered successfully!";
        setTimeout(() => {
            window.location.href = "../pages/login.html";
        }, 2000);
    };
    createStudent();
});
