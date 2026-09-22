import * as Service from '../service/studentService.js';

export const addStudent = async (req, res) => {
    const success = await Service.addStudent(req.body);
    if (success) {
        return res.status(204).send();
    } else {
        console.log("student already exists")
        return res.status(409).send()
    }
};

export const findStudent = async (req, res) => {
    const student = await Service.findStudent(req.params.id);
    if (student) {
        return res.json(student);
    } else {
        return res.status(404).send({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": `Student with id ${req.params.id} not found`,
            "path": req.originalUrl
        });
    }
}

export const removeStudent = async (req, res) => {
    const student = await Service.removeStudent(req.params.id);
    if (student) {
        return res.status(200).send(
            {
                "id": student.id,
                "name": student.name,
                "scores": student.scores
            }
        );
    } else {
        return res.status(404).send({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": `Student with id ${req.params.id} not found`,
            "path": req.originalUrl
        });
    }
}

export const updateStudent = async (req, res) => {
    const student = await Service.updateStudent(req.params.id, req.body);
    if (student) {
        return res.status(200).send(
            {
                "id": student.id,
                "name": student.name,
                "password": student.password
            }
        )
    } else {
        return res.status(404).send({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": `Student with id ${req.params.id} not found`,
            "path": req.originalUrl
        });
    }
}

export const addScore = async (req, res) => {
    const {examName, score} = req.body;
    const success = await Service.addScore(req.params.id, examName, score);
    if (success) {
        return res.status(204).send();
    } else {
        return res.status(404).send({
            "timestamp": new Date().toISOString(),
            "status": 404,
            "error": "Not Found",
            "message": "student not found",
            "path": req.originalUrl
        });
    }
}

export const findStudentsByName = async (req, res) => {
    const students = await Service.findStudentsByName(req.params.name);
    return res.status(200).json(students);
}

export const countStudentsByNames = async (req, res) => {
    const count = await Service.countStudentsByNames(req.query.names);
    return res.status(200).json(count);
}

export const findStudentsByMinScore = async (req, res) => {
    const students = await Service.findStudentsByMinScore(req.params.exam, req.params.minScore);
    return res.status(200).json(students);
}
