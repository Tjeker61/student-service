/*
Integration tests for studentController.
Requests go through the real Express routing, JSON body parser, controller and Joi validator.
Only the service layer is mocked, so no database is required.
 */

import {jest, beforeEach, describe, it, expect} from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockService = {
    addStudent: jest.fn(),
    findStudent: jest.fn(),
    deleteStudent: jest.fn(),
    updateStudent: jest.fn(),
    addScore: jest.fn(),
    findStudentsByName: jest.fn(),
    countStudentsByNames: jest.fn(),
    findStudentsByMinScore: jest.fn(),
}

jest.unstable_mockModule('../src/service/studentService.js', () => mockService)

// Routes must be imported after the mock is registered so the controller receives the mocked service
const {default: studentRoutes} = await import('../src/routes/studentRoutes.js')

// Build the app locally: server.js does not export app and connects to MongoDB on import
const app = express()
app.use(express.json())
app.use(studentRoutes)

// Common assertion for the 404 error body produced by the controller
const expectNotFoundBody = (res, id, path) => {
    expect(res.body).toEqual({
        timestamp: expect.any(String),
        status: 404,
        error: 'Not Found',
        message: `Student with id ${id} not found`,
        path
    })
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('POST /student', () => {
    const validBody = {id: 1, name: 'John', password: 'secret'}

    it('returns 204 when student is created', async () => {
        // Arrange
        mockService.addStudent.mockResolvedValue(true)
        // Act
        const res = await request(app).post('/student').send(validBody)
        // Assert
        expect(res.status).toBe(204)
        expect(res.text).toBe('')
        expect(mockService.addStudent).toHaveBeenCalledWith(validBody)
    })
    it('returns 409 when student already exists', async () => {
        // Arrange
        mockService.addStudent.mockResolvedValue(false)
        // Act
        const res = await request(app).post('/student').send(validBody)
        // Assert
        expect(res.status).toBe(409)
        expect(mockService.addStudent).toHaveBeenCalledWith(validBody)
    })
    it.each([
        ['id is missing', {name: 'John', password: 'secret'}, '"id" is required'],
        ['id is negative', {...validBody, id: -1}, '"id" must be a positive number'],
        ['id is not an integer', {...validBody, id: 1.5}, '"id" must be an integer'],
        ['id is not a number', {...validBody, id: 'abc'}, '"id" must be a number'],
        ['name is missing', {id: 1, password: 'secret'}, '"name" is required'],
        ['password is missing', {id: 1, name: 'John'}, '"password" is required'],
        ['unknown field is sent', {...validBody, age: 20}, '"age" is not allowed'],
    ])('returns 400 when %s', async (_, body, message) => {
        // Act
        const res = await request(app).post('/student').send(body)
        // Assert
        expect(res.status).toBe(400)
        expect(res.text).toBe(message)
        expect(mockService.addStudent).not.toHaveBeenCalled()
    })
})

describe('GET /student/:id', () => {
    it('returns 200 and student when student exists', async () => {
        // Arrange
        const student = {id: 5, name: 'John', scores: {math: 90}}
        mockService.findStudent.mockResolvedValue(student)
        // Act
        const res = await request(app).get('/student/5')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toEqual(student)
        expect(mockService.findStudent).toHaveBeenCalledWith('5')
    })
    it('returns 404 when student does not exist', async () => {
        // Arrange
        mockService.findStudent.mockResolvedValue(null)
        // Act
        const res = await request(app).get('/student/5')
        // Assert
        expect(res.status).toBe(404)
        expectNotFoundBody(res, '5', '/student/5')
        expect(mockService.findStudent).toHaveBeenCalledWith('5')
    })
})

describe('DELETE /student/:id', () => {
    it('returns 200 and deleted student when student exists', async () => {
        // Arrange
        const student = {id: 5, name: 'John', scores: {}}
        mockService.deleteStudent.mockResolvedValue(student)
        // Act
        const res = await request(app).delete('/student/5')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toEqual(student)
        expect(mockService.deleteStudent).toHaveBeenCalledWith('5')
    })
    it('returns 404 when student does not exist', async () => {
        // Arrange
        mockService.deleteStudent.mockResolvedValue(null)
        // Act
        const res = await request(app).delete('/student/5')
        // Assert
        expect(res.status).toBe(404)
        expectNotFoundBody(res, '5', '/student/5')
        expect(mockService.deleteStudent).toHaveBeenCalledWith('5')
    })
})

describe('PATCH /student/:id', () => {
    it('returns 200 and updated student when student exists', async () => {
        // Arrange
        const updated = {id: 5, name: 'Mary', scores: {}}
        mockService.updateStudent.mockResolvedValue(updated)
        // Act
        const res = await request(app).patch('/student/5').send({name: 'Mary'})
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toEqual(updated)
        expect(mockService.updateStudent).toHaveBeenCalledWith('5', {name: 'Mary'})
    })
    it('returns 404 when student does not exist', async () => {
        // Arrange
        mockService.updateStudent.mockResolvedValue(null)
        // Act
        const res = await request(app).patch('/student/5').send({name: 'Mary'})
        // Assert
        expect(res.status).toBe(404)
        expectNotFoundBody(res, '5', '/student/5')
    })
    it.each([
        ['name is not a string', {name: 123}, '"name" must be a string'],
        ['password is not a string', {password: 123}, '"password" must be a string'],
        ['unknown field is sent', {scores: {math: 90}}, '"scores" is not allowed'],
    ])('returns 400 when %s', async (_, body, message) => {
        // Act
        const res = await request(app).patch('/student/5').send(body)
        // Assert
        expect(res.status).toBe(400)
        expect(res.text).toBe(message)
        expect(mockService.updateStudent).not.toHaveBeenCalled()
    })
    it('passes empty body to service (current schema allows it)', async () => {
        // Arrange
        mockService.updateStudent.mockResolvedValue({id: 5, name: 'John'})
        // Act
        const res = await request(app).patch('/student/5').send({})
        // Assert
        expect(res.status).toBe(200)
        expect(mockService.updateStudent).toHaveBeenCalledWith('5', {})
    })
})

describe('PATCH /score/student/:id', () => {
    const validBody = {examName: 'math', score: 90}

    it('returns 204 when score is added', async () => {
        // Arrange
        mockService.addScore.mockResolvedValue({id: 5, scores: {math: 90}})
        // Act
        const res = await request(app).patch('/score/student/5').send(validBody)
        // Assert
        expect(res.status).toBe(204)
        expect(res.text).toBe('')
        expect(mockService.addScore).toHaveBeenCalledWith('5', 'math', 90)
    })
    it('returns 404 when student does not exist', async () => {
        // Arrange
        mockService.addScore.mockResolvedValue(null)
        // Act
        const res = await request(app).patch('/score/student/5').send(validBody)
        // Assert
        expect(res.status).toBe(404)
        expectNotFoundBody(res, '5', '/score/student/5')
    })
    it.each([
        ['examName is missing', {score: 90}, '"examName" is required'],
        ['score is missing', {examName: 'math'}, '"score" is required'],
        ['score is greater than 100', {...validBody, score: 101}, '"score" must be less than or equal to 100'],
        ['score is negative', {...validBody, score: -1}, '"score" must be greater than or equal to 0'],
        ['score is not an integer', {...validBody, score: 50.5}, '"score" must be an integer'],
    ])('returns 400 when %s', async (_, body, message) => {
        // Act
        const res = await request(app).patch('/score/student/5').send(body)
        // Assert
        expect(res.status).toBe(400)
        expect(res.text).toBe(message)
        expect(mockService.addScore).not.toHaveBeenCalled()
    })
})

describe('GET /students/name/:name', () => {
    it('returns students with given name', async () => {
        // Arrange
        const students = [{id: 5, name: 'John', scores: {}}]
        mockService.findStudentsByName.mockResolvedValue(students)
        // Act
        const res = await request(app).get('/students/name/John')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toEqual(students)
        expect(mockService.findStudentsByName).toHaveBeenCalledWith('John')
    })
    it('returns empty array when no students found', async () => {
        // Arrange
        mockService.findStudentsByName.mockResolvedValue([])
        // Act
        const res = await request(app).get('/students/name/Ghost')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })
})

describe('GET /quantity/students', () => {
    it('passes multiple names as array and returns count', async () => {
        // Arrange
        mockService.countStudentsByNames.mockResolvedValue(2)
        // Act
        const res = await request(app).get('/quantity/students?names=John&names=Jane')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toBe(2)
        expect(mockService.countStudentsByNames).toHaveBeenCalledWith(['John', 'Jane'])
    })
    it('passes single name as string', async () => {
        // Arrange
        mockService.countStudentsByNames.mockResolvedValue(0)
        // Act
        const res = await request(app).get('/quantity/students?names=Ghost')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toBe(0)
        expect(mockService.countStudentsByNames).toHaveBeenCalledWith('Ghost')
    })
})

describe('GET /students/exam/:exam/minscore/:minScore', () => {
    it('returns students with score not less than minScore', async () => {
        // Arrange
        const students = [{id: 5, name: 'John', scores: {math: 90}}]
        mockService.findStudentsByMinScore.mockResolvedValue(students)
        // Act
        const res = await request(app).get('/students/exam/math/minscore/80')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toEqual(students)
        expect(mockService.findStudentsByMinScore).toHaveBeenCalledWith('math', '80')
    })
    it('returns empty array when no students match', async () => {
        // Arrange
        mockService.findStudentsByMinScore.mockResolvedValue([])
        // Act
        const res = await request(app).get('/students/exam/math/minscore/100')
        // Assert
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })
})
