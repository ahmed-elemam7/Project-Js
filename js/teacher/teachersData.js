const defaultTeachers = [
    {
        id: 1,
        username: "teacher1",
        password: "123456",
        name: "Dr. Ahmed",
        course: "Animals"
    },
    {
        id: 2,
        username: "teacher2",
        password: "123456",
        name: "Dr. Mona",
        course: "Plants"
    },
    {
        id: 3,
        username: "teacher3",
        password: "123456",
        name: "Dr. Omar",
        course: "Planets"
    }
];

if (!localStorage.getItem("teachers")) {
    localStorage.setItem("teachers", JSON.stringify(defaultTeachers));
}

