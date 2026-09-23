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

export const removeStudent = id => students.delete(id);

export const updateStudent = ({id, name, password}) => {
    if (!students.has(id)) {
        return false;
    }
    const student = students.get(id);
    student.name = name;
    student.password = password;
    return true;
}

export const addScore = (id, examName, score) => {
    if (!students.has(id)) {
        return false;
    }
    const student = students.get(id);
    student.scores[examName] = score;
    return true;
}

export const findStudentsByName = name => {
    name = name.toLowerCase();
    return [...students.values()].filter(student => student.name.toLowerCase() === name);
}

export const countStudentsByNames = names => {
    names = names.map(name => name.toLowerCase());
    return [...students.values()].filter(student => names.includes(student.name.toLowerCase())).length;
}

export const findStudentsByMinScore = (exam, minScore) => {
    return [...students.values()].filter(student => student.scores[exam] >= minScore);
}

