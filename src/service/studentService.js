import * as repo from '../repository/studentRepository.js';

export const addStudent = async (student) => {
return repo.createStudent(student);
}

export const findStudent = async id => {
    let student = repo.findStudent(+id);
    if (student) {
        student = {...student};
        delete student.password;

    }
    return student;
}

export const removeStudent = async id => {
    //TODO implement removeStudent
}

export const updateStudent = async (id, data) => {
    //TODO implement updateStudent
}

export const addScore = async (id, exam, score) => {
    //TODO implement addScore
}

export const findStudentsByName = async name => {
    //TODO implement findStudentsByName
}

export const countStudentsByNames = async names => {
    //TODO implement countStudentsByNames
}

export const findStudentsByMinScore = async (exam, minScore) => {
    //TODO implement findStudentsByMinScore
}
