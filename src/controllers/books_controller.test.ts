import request from "supertest";
import { app } from "../app";
import { Book } from "../models/book";

import * as bookService from "../services/books";
jest.mock("../services/books");

afterEach(() => {
	jest.clearAllMocks();
});

const dummyBookData = [
	{
		bookId: 1,
		title: "The Hobbit",
		author: "J. R. R. Tolkien",
		description: "Someone finds a nice piece of jewellery while on holiday.",
	},
	{
		bookId: 2,
		title: "The Shop Before Life",
		author: "Neil Hughes",
		description:
			"Before being born, each person must visit the magical Shop Before Life, where they choose what kind of person they will become down on Earth...",
	},
];

describe("GET /api/v1/books endpoint", () => {
	test("status code successfully 200", async () => {
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("books successfully returned as empty array when no data returned from the service", async () => {
		// Arrange
		jest.spyOn(bookService, "getBooks").mockResolvedValue([]);
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual([]);
		expect(res.body.length).toEqual(0);
	});

	test("books successfully returned as array of books", async () => {
		// Arrange

		// NB the "as" to `Book[]` takes care of all the missing properties added by sequelize
		//    such as createdDate etc, that we don't care about for the purposes of this test
		jest
			.spyOn(bookService, "getBooks")
			.mockResolvedValue(dummyBookData as Book[]);

		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual(dummyBookData);
		expect(res.body.length).toEqual(2);
	});
});

describe("GET /api/v1/books/{bookId} endpoint", () => {
	test("status code successfully 200 for a book that is found", async () => {
		// Arrange
		const mockGetBook = jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("status code successfully 404 for a book that is not found", async () => {
		// Arrange

		jest
			.spyOn(bookService, "getBook")
			// this is a weird looking type assertion!
			// it's necessary because TS knows we can't actually return unknown here
			// BUT we want to check that in the event a book is missing we return a 404
			.mockResolvedValue(undefined as unknown as Book);
		// Act
		const res = await request(app).get("/api/v1/books/77");

		// Assert
		expect(res.statusCode).toEqual(404);
	});

	test("controller successfully returns book object as JSON", async () => {
		// Arrange
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.body).toEqual(dummyBookData[1]);
	});

	test("controller returns message text stating book was not found", async () => {
		// Arrange
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(undefined as unknown as Book);

		// Act
		const res = await request(app).get("/api/v1/books/55");

		// Assert
		expect(res.text).toEqual("Book with id 55 was not found");
	});
});

describe("POST /api/v1/books endpoint", () => {
	test("status code successfully 201 for saving a valid book", async () => {
		// Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: 3,
			title: "Fantastic Mr. Fox",
			author: "Roald Dahl",
			description: "Book about fantastic fox",
		});

		// Assert
		expect(res.statusCode).toEqual(201);
	});

	test("status code 400 and appropriate error message sent when saving ill formatted JSON", async () => {
		// Arrange - we can enforce throwing an exception by mocking the implementation
		jest.spyOn(bookService, "saveBook").mockImplementation(() => {
			throw { name: "SequelizeValidationError" };
		});

		// Act
		const res = await request(app)
			.post("/api/v1/books")
			.send({ title: "Fantastic Mr. Fox", author: "Roald Dahl" }); // No bookId

		// Assert
		expect(res.statusCode).toEqual(400);
		expect(res.text).toEqual("Invalid book details");
	});
	test("status code 400 and appropriate error message sent when saving a book that already exists", async () => {
		// Arrange - we can enforce throwing an exception by mocking the implementation
		jest.spyOn(bookService, "saveBook").mockImplementation(() => {
			throw { name: "SequelizeUniqueConstraintError" };
		});

		// Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: 1,
			title: "The Hobbit",
			author: "J. R. R. Tolkien",
			description: "Someone finds a nice piece of jewellery while on holiday.",
		}); // Existing book

		// Assert
		expect(res.statusCode).toEqual(400);
		expect(res.text).toEqual("The book already exists");
	});
});

//For the delete functionality on success a status code of 200 and a success message will be returned as response
//On failure a status code of 404 and failure message will be returned as  response
describe("DELETE /api/v1/books/{bookId} endpoint", () => {
	test("status code successfully 200 for a book that is deleted", async () => {
		// Arrange
		const mockGetBook = jest
			.spyOn(bookService, "deleteBook")
			//returns 1 as 1 book is deleted
			.mockResolvedValue(1);

		// Act
		const res = await request(app).delete("/api/v1/books/2");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("status code 404 for a book that is not found and cannot be deleted", async () => {
		// Arrange

		jest
			.spyOn(bookService, "deleteBook")
			//deleteBook returns 0 as no book is deleted
			.mockResolvedValue(0);
		// Act
		const res = await request(app).delete("/api/v1/books/55");

		// Assert
		expect(res.statusCode).toEqual(404);
	});

	test("controller successfully returns message text stating book is deleted", async () => {
		// Arrange
		jest.spyOn(bookService, "deleteBook").mockResolvedValue(1);

		// Act
		const res = await request(app).delete("/api/v1/books/2");

		// Assert
		expect(res.text).toEqual("Book with id 2 has been successfully deleted");
	});

	test("controller returns message text stating book was not found", async () => {
		// Arrange
		jest.spyOn(bookService, "deleteBook").mockResolvedValue(0);

		// Act
		const res = await request(app).delete("/api/v1/books/55");

		// Assert
		expect(res.text).toEqual("Book with id 55 was not found");
	});
});
