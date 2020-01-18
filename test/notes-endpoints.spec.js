const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures.js')
const { makeFoldersArray } = require('./folders.fixtures.js')

describe('Notes Endpoints', function () {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  afterEach('cleanup', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })

    context('Given there are notes in the database', () => {
      const testFolders = makeFoldersArray()
      const testNotes = makeNotesArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })

      beforeEach('insert notes', () => {
        return db
          .into('noteful_notes')
          .insert(testNotes)
      })

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })
  })

  describe(`GET /api/notes/:id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const noteId = 123456
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, { error: { message: `Note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testFolders = makeFoldersArray()
      const testNotes = makeNotesArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })

      beforeEach('insert notes', () => {
        return db
          .into('noteful_notes')
          .insert(testNotes)
      })

      it('responds with 200 and the specified note', () => {
        const noteId = 2
        const expectedNote = testNotes[noteId - 1]
        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote)
      })
    })
  })

  describe(`POST /api/notes`, () => {
    context('Given ther are folders to place notes into', () => {
      const testFolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })

      it(`creates an note, responding with 201 and the new note`, () => {
        const newNote = {
          text: 'Test new note',
          folder_id: 1,
        }
        return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(201)
          .expect(res => {
            expect(res.body.text).to.eql(newNote.text)
            expect(res.body.folder_id).to.eql(newNote.folder_id)
            expect(res.body).to.have.property('id')
            expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
            const expected = new Date().toLocaleString()
            const actual = new Date(res.body.modified).toLocaleString()
            expect(actual).to.eql(expected)
          })
          .then(res =>
            supertest(app)
              .get(`/api/notes/${res.body.id}`)
              .expect(res.body)
          )
      })
    })

    const requiredFields = ['text', 'folder_id']

    requiredFields.forEach(field => {
      const newNote = {
        text: 'Test new note',
        folder_id: 1,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newNote[field]

        return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    describe(`DELETE /api/notes/:note_id`, () => {
      context(`Given no notes`, () => {
        it(`responds with 404`, () => {
          const noteId = 123456
          return supertest(app)
            .delete(`/api/notes/${noteId}`)
            .expect(404, { error: { message: `Note doesn't exist` } })
        })
      })
  
      context('Given there are notes in the database', () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray()
  
        beforeEach('insert folders', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })

        beforeEach('insert notes', () => {
          return db
            .into('noteful_notes')
            .insert(testNotes)
        })
  
        it('responds with 204 and removes the note', () => {
          const idToRemove = 2
          const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
          return supertest(app)
            .delete(`/api/notes/${idToRemove}`)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/notes`)
                .expect(expectedNotes)
            )
        })
      })
    })

    describe(`PATCH /api/notes/:id`, () => {
      context(`Given no notes`, () => {
        it(`responds with 404`, () => {
          const noteId = 123456
          return supertest(app)
            .delete(`/api/notes/${noteId}`)
            .expect(404, { error: { message: `Note doesn't exist` } })
        })
      })
  
      context('Given there are notes in the database', () => {
        const testFolders = makeFoldersArray()
        const testNotes = makeNotesArray()
  
        beforeEach('insert folders', () => {
          return db
            .into('noteful_folders')
            .insert(testFolders)
        })

        beforeEach('insert notes', () => {
          return db
            .into('noteful_notes')
            .insert(testNotes)
        })
  
        it('responds with 204 and updates the note', () => {
          const idToUpdate = 2
          const updateNote = {
            text: 'updated note text',
            folder_id: 2,
          }
          const expectedNote = {
            ...testNotes[idToUpdate - 1],
            ...updateNote
          }
          return supertest(app)
            .patch(`/api/notes/${idToUpdate}`)
            .send(updateNote)
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/notes/${idToUpdate}`)
                .expect(expectedNote)
            )
        })
  
        it(`responds with 400 when no required fields supplied`, () => {
          const idToUpdate = 2
          return supertest(app)
            .patch(`/api/notes/${idToUpdate}`)
            .send({ irrelevantField: 'foo' })
            .expect(400, {
              error: {
                message: `Request body must content either 'text' or 'folder_id'`
              }
            })
        })
  
        it(`responds with 204 when updating only a subset of fields`, () => {
          const idToUpdate = 2
          const updateNote = {
            text: 'updated note text',
          }
          const expectedNote = {
            ...testNotes[idToUpdate - 1],
            ...updateNote
          }
  
          return supertest(app)
            .patch(`/api/notes/${idToUpdate}`)
            .send({
              ...updateNote,
              fieldToIgnore: 'should not be in GET response'
            })
            .expect(204)
            .then(res =>
              supertest(app)
                .get(`/api/notes/${idToUpdate}`)
                .expect(expectedNote)
            )
        })
      })
    })
  })
})