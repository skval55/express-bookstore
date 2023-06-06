process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testBook;

beforeAll(async () => {
  await db.query(`DELETE FROM books`);
});

beforeEach(async () => {
  const compResult = await db.query(
    `INSERT INTO books (
    isbn,
    amazon_url,
    author,
    language,
    pages,
    publisher,
    title,
    year) 
 VALUES ('12', 'http://a.co/eobPtX2', 'test author', 'english', 300, 'test publisher', 'test book', 2020)
 RETURNING isbn,
 amazon_url,
 author,
 language,
 pages,
 publisher,
 title,
 year `
  );
  testBook = compResult.rows[0];
  console.log(testBook);
});

afterEach(async () => {
  await db.query(`DELETE FROM books`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /books", () => {
  test("Get a list of books", async () => {
    const res = await request(app).get("/books");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ books: [testBook] });
  });
});

describe("GET /books/:id", () => {
  test("Get a certain book according to id ", async () => {
    const res = await request(app).get(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: testBook });
  });
  test("get 404 with wrong id", async () => {
    const res = await request(app).get(`/books/11111111`);
    expect(res.statusCode).toBe(404);
  });
});

describe("post /books", () => {
  test("post a book", async () => {
    const newBook = {
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ book: newBook });
  });
  test("post missing some required value", async () => {
    const newBook = {
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: { message: ['instance requires property "isbn"'], status: 400 },
      message: ['instance requires property "isbn"'],
    });
  });
  test("post wrong data type for author", async () => {
    const newBook = {
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: 111,
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    const res = await request(app).post("/books").send(newBook);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      error: {
        message: ["instance.author is not of a type(s) string"],
        status: 400,
      },
      message: ["instance.author is not of a type(s) string"],
    });
  });
});

describe("put /books/:ibsn", () => {
  test("update a book", async () => {
    const updatedBook = {
      isbn: testBook.isbn,
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    const res = await request(app)
      .put(`/books/${testBook.isbn}`)
      .send(updatedBook);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: updatedBook });
  });
  test("get 404 with wrong id", async () => {
    const updatedBook = {
      isbn: testBook.isbn,
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    };
    const res = await request(app).put(`/books/1011111111`).send(updatedBook);
    expect(res.statusCode).toBe(404);
  });
});

describe("DELETE /books/:isbn", () => {
  test("DELETE a book", async () => {
    const res = await request(app).delete(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Book deleted" });
  });
});
