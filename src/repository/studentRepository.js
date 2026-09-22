import Student from "../model/student.js";

const students = new Map();

export const createStudent = ({id, name, password}) => {
    if (students.has(id)) {
        return false;
    }
    const student = new Student(id, name, password);
    students.set(id, student);
    return true;
}

export const findStudent = id => students.get(id);