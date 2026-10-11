/*
The Arrange, Act, Assert (AAA) pattern is a common approach used in unit testing to organize test cases. It consists of three steps:

1. Arrange: Set up the necessary conditions and inputs for the test case.
2. Act: Execute the code or function being tested.
3. Assert: Verify the expected output or behavior of the code or function.

This pattern helps in writing clear, concise, and maintainable test cases by separating the setup, execution, and verification steps.
 */

import {jest, beforeEach, describe, it, expect} from '@jest/globals';

const mockRepo = {
    createStudent: jest.fn(),
    findStudentById: jest.fn(),
    deleteStudent: jest.fn(),
    updateStudent: jest.fn(),
    findStudentsByName: jest.fn(),
    countStudentsByNames: jest.fn(),
    findStudentsByMinScore: jest.fn(),
}

jest.unstable_mockModule('../src/repository/studentRepository.js', () => mockRepo)

const studentService = await import('../src/service/studentService.js')

beforeEach(() => {
    jest.clearAllMocks()
})

describe('Student Service', () => {
    it('addStudent returns false when student is already exists', async () => {
        // Arrange
        mockRepo.findStudentById.mockResolvedValue({id: 1})
        // Act
        const result = await studentService.addStudent({
            id: 1,
            name: 'John',
            password: 'secret'
        })
        // Assert
        expect(result).toBeFalsy()
        expect(mockRepo.createStudent).not.toHaveBeenCalled()
        expect(mockRepo.findStudentById).toHaveBeenCalledWith(1)
    })
    it('addStudent returns true when student is not exists', async () => {
        // Arrange
        mockRepo.findStudentById.mockResolvedValue(null)
        // Act
        const result = await studentService.addStudent({
            id: 2,
            name: 'John',
            password: 'secret'
        })
        // Assert
        expect(result).toBeTruthy()
        expect(mockRepo.createStudent).toHaveBeenCalledWith({
            _id: 2,
            name: 'John',
            password: 'secret'
        })
        expect(mockRepo.findStudentById).toHaveBeenCalledWith(2)
    })
    it('findStudent returns student when student exists', async () => {
        // Arrange
        const student = {_id: 5, name: 'John'}
        mockRepo.findStudentById.mockResolvedValue(student)
        // Act
        const result = await studentService.findStudent('5')
        // Assert
        expect(result).toBe(student)
        expect(mockRepo.findStudentById).toHaveBeenCalledWith(5)
    })
    it('findStudent returns null when student is not exists', async () => {
        // Arrange
        mockRepo.findStudentById.mockResolvedValue(null)
        // Act
        const result = await studentService.findStudent('5')
        // Assert
        expect(result).toBeNull()
        expect(mockRepo.findStudentById).toHaveBeenCalledWith(5)
    })
    it('deleteStudent returns deleted student when student exists', async () => {
        // Arrange
        const student = {_id: 5, name: 'John'}
        mockRepo.deleteStudent.mockResolvedValue(student)
        // Act
        const result = await studentService.deleteStudent('5')
        // Assert
        expect(result).toBe(student)
        expect(mockRepo.deleteStudent).toHaveBeenCalledWith(5)
    })
    it('deleteStudent returns null when student is not exists', async () => {
        // Arrange
        mockRepo.deleteStudent.mockResolvedValue(null)
        // Act
        const result = await studentService.deleteStudent('5')
        // Assert
        expect(result).toBeNull()
        expect(mockRepo.deleteStudent).toHaveBeenCalledWith(5)
    })
    it('updateStudent returns updated student when student exists', async () => {
        // Arrange
        const updated = {_id: 5, name: 'Mary'}
        mockRepo.updateStudent.mockResolvedValue(updated)
        // Act
        const result = await studentService.updateStudent('5', {name: 'Mary'})
        // Assert
        expect(result).toBe(updated)
        expect(mockRepo.updateStudent).toHaveBeenCalledWith(5, {name: 'Mary'})
    })
    it('updateStudent returns null when student is not exists', async () => {
        // Arrange
        mockRepo.updateStudent.mockResolvedValue(null)
        // Act
        const result = await studentService.updateStudent('5', {name: 'Mary'})
        // Assert
        expect(result).toBeNull()
        expect(mockRepo.updateStudent).toHaveBeenCalledWith(5, {name: 'Mary'})
    })
    it('addScore returns updated student when student exists', async () => {
        // Arrange
        const updated = {_id: 5, name: 'John', scores: {math: 90}}
        mockRepo.updateStudent.mockResolvedValue(updated)
        // Act
        const result = await studentService.addScore('5', 'math', 90)
        // Assert
        expect(result).toBe(updated)
        expect(mockRepo.updateStudent).toHaveBeenCalledWith(5, {'scores.math': 90})
    })
    it('addScore returns null when student is not exists', async () => {
        // Arrange
        mockRepo.updateStudent.mockResolvedValue(null)
        // Act
        const result = await studentService.addScore('5', 'math', 90)
        // Assert
        expect(result).toBeNull()
        expect(mockRepo.updateStudent).toHaveBeenCalledWith(5, {'scores.math': 90})
    })
    it('findStudentsByName returns students when name is found', async () => {
        // Arrange
        const students = [{_id: 5, name: 'John'}]
        mockRepo.findStudentsByName.mockResolvedValue(students)
        // Act
        const result = await studentService.findStudentsByName('John')
        // Assert
        expect(result).toBe(students)
        expect(mockRepo.findStudentsByName).toHaveBeenCalledWith('John')
    })
    it('findStudentsByName returns empty array when name is not found', async () => {
        // Arrange
        mockRepo.findStudentsByName.mockResolvedValue([])
        // Act
        const result = await studentService.findStudentsByName('Ghost')
        // Assert
        expect(result).toEqual([])
        expect(mockRepo.findStudentsByName).toHaveBeenCalledWith('Ghost')
    })
    it('countStudentsByNames returns count when names are found', async () => {
        // Arrange
        mockRepo.countStudentsByNames.mockResolvedValue(2)
        // Act
        const result = await studentService.countStudentsByNames(['John', 'Jane'])
        // Assert
        expect(result).toBe(2)
        expect(mockRepo.countStudentsByNames).toHaveBeenCalledWith(['John', 'Jane'])
    })
    it('countStudentsByNames returns 0 and wraps single name into array when name is not found', async () => {
        // Arrange
        mockRepo.countStudentsByNames.mockResolvedValue(0)
        // Act
        const result = await studentService.countStudentsByNames('Ghost')
        // Assert
        expect(result).toBe(0)
        expect(mockRepo.countStudentsByNames).toHaveBeenCalledWith(['Ghost'])
    })
    it('findStudentsByMinScore returns students when scores are found', async () => {
        // Arrange
        const students = [{_id: 5, name: 'John'}]
        mockRepo.findStudentsByMinScore.mockResolvedValue(students)
        // Act
        const result = await studentService.findStudentsByMinScore('math', '80')
        // Assert
        expect(result).toBe(students)
        expect(mockRepo.findStudentsByMinScore).toHaveBeenCalledWith('math', 80)
    })
    it('findStudentsByMinScore returns empty array when scores are not found', async () => {
        // Arrange
        mockRepo.findStudentsByMinScore.mockResolvedValue([])
        // Act
        const result = await studentService.findStudentsByMinScore('math', '80')
        // Assert
        expect(result).toEqual([])
        expect(mockRepo.findStudentsByMinScore).toHaveBeenCalledWith('math', 80)
    })
})
