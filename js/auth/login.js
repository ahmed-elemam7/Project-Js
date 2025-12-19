document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = '';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value.trim();

    if (role === "student") {
        const students = StorageService.load("students")
        const student = students.find(s => s.username === username && s.password === password);
        if (student) {
            StorageService.save("currentUser", student);
            window.location.href = "../pages/studentProfile.html";
        } else errorElement.textContent = "Invalid credentials!";
    } else {
        const teachers = StorageService.load("teachers")
        const teacher = teachers.find(t => t.username === username && t.password === password);
        if (teacher) {
            StorageService.save("currentUser", teacher);
            window.location.href = "../pages/teacherDashboard.html";
        } else errorElement.textContent = "Invalid credentials!"
    }
});