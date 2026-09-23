import * as repo from '../repository/studentRepository.js';

export const addStudent = async (student) => {
return repo.createStudent(student);
}

export const findStudent = async id => {
    let student = repo.findStudent(+id);
    if (student) {
        student = stripPassword(student)

    }
    return student;
}

export const removeStudent = async id => {
    const student = repo.findStudent(+id);
    if (!student) {
        return null;
    }
    repo.removeStudent(+id);
    return student;
}

export const updateStudent = async (id, data) => {
    const student = repo.findStudent(+id);
    if (!student) {
        return null;
    }
    const name = data.name !== undefined ? data.name : student.name;
    const password = data.password !== undefined ? data.password : student.password;
    repo.updateStudent({id: +id, name, password});
    return repo.findStudent(+id);
}

export const addScore = async (id, exam, score) => {
    return repo.addScore(+id, exam, score);
}

export const findStudentsByName = async name => {
    return repo.findStudentsByName(name).map(stripPassword);
}

export const countStudentsByNames = async names => {
    const nameList = Array.isArray(names) ? names : [names];
    return repo.countStudentsByNames(nameList);
}

export const findStudentsByMinScore = async (exam, minScore) => {
    return repo.findStudentsByMinScore(exam, +minScore).map(stripPassword);
}

const stripPassword = student => {
    const copy = {...student};
    delete copy.password;
    return copy;
}
