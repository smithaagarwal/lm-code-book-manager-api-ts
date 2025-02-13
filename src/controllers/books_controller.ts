import { Request, Response } from "express";
import * as bookService from "../services/books";

export const getBooks = async (req: Request, res: Response) => {
	const books = await bookService.getBooks();
	res.json(books).status(200);
};

export const getBook = async (req: Request, res: Response) => {
	const bookId = req.params.bookId;
	const book = await bookService.getBook(Number(bookId));

	if (book) {
		res.json(book).status(200);
	} else {
		res.status(404).send(`Book with id ${bookId} was not found`);
	}
};

export const saveBook = async (req: Request, res: Response) => {
	const bookToBeSaved = req.body;
	try {
		const book = await bookService.saveBook(bookToBeSaved);
		res.status(201).json(book);
	} catch (error) {
		if ((error as Error).name === "SequelizeUniqueConstraintError"){
			res.status(400).send("The book already exists");
		}
		else if ((error as Error).name === "SequelizeValidationError") {
			res.status(400).send("Invalid book details");
		}
	}
};

// User Story 4 - Update Book By Id Solution
export const updateBook = async (req: Request, res: Response) => {
	const bookUpdateData = req.body;
	const bookId = Number.parseInt(req.params.bookId);

	const book = await bookService.updateBook(bookId, bookUpdateData);
	res.status(204).json(book);
};

export const deleteBook = async (req: Request, res: Response) => {
	const bookId = req.params.bookId;
	const numOfBooksDeleted = await bookService.deleteBook(Number(bookId));
	if (numOfBooksDeleted == 0) {
		res.status(404).send(`Book with id ${bookId} was not found`);
	} else {
		res
			.status(200)
			.send(`Book with id ${bookId} has been successfully deleted`);
	}
};
