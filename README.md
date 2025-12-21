
# Name:Ahmed Ibrahim Elemam --- Email:ahmed.ibrahim.elemam@gmail.com   

# Project JS (Quiz Platform)

A light-weight client-side Quiz Management application built with plain HTML, CSS and JavaScript. It supports teacher and student roles, exam creation and review, student profiles and quiz taking. Data is stored in the browser (localStorage) via a small StorageService abstraction.

---

## 🔧 Features

- Teacher: create, list and delete exams, review student results and answers
- Student: register, login, take quizzes, view completed exam history
- Simple role-based pages for Teacher and Student
- All data persisted locally using `localStorage`

---

## 📁 Project structure

- `README.md` — this file
- `assets/` — static assets
  - `css/style.css`
  - `images/`
- `js/` — JavaScript source
  - `auth/` — `login.js`, `register.js` (authentication flows)
  - `core/` — `Classes.js`, `theme.js` (models and utilities)
  - `quiz/` — `quiz.js` (quiz runtime)
  - `student/` — `studentProfile.js` (student profile & history)
  - `teacher/` — `teacherDashboard.js`, `TeacherExamDetails.js`, `teachersData.js`
- `pages/` — HTML pages
  - `login.html`
  - `register.html`
  - `teacherDashboard.html`
  - `TeacherExamDetails.html`
  - `studentProfile.html`
  - `quiz.html`

---

## 🚀 How to run (development)

Because this is a static client-side site, you can serve the folder using any static server. Examples:

- VS Code: Install and use the Live Server extension, then open  page (`pages/login.html`).

---

## ⚙️ Usage notes

- Registration/login is handled in `js/auth/` and user data is persisted in `localStorage` by `StorageService` (see `js/core/Classes.js` and other core files).
- Teachers create exams from `teacherDashboard.html`. Each exam stores metadata (duration, number of questions, grade, teacher id).
- When students take an exam the system records question-level answers and scores so teachers can review them.
- Several UI elements and behaviors expect consistent data shapes; if you clear `localStorage` you may lose sample data.

---


