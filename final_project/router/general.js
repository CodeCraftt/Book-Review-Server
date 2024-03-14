const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        const usr = users.find(u => u.username === username);
        if (usr) {
            res.status(400).json({ message: 'User already exists.' });
        } else {
            users.push({ "username": username, "password": password });
            res.status(200).json({ message: "User registered successfully." });
        }
    } else {
        res.status(400).json({ message: "Username/password not provided." });
    }
});


function getAllBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

public_users.get('/', function (req, res) {
    getAllBooks()
      .then(books => res.send(JSON.stringify(books)))
      .catch(error => res.status(500).json({ message: "Internal Server Error" }));
  });
  

function getBookByIsbn(isbn) {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: `No book with ISBN ${isbn} found` });
    }
  });
}


public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);
  getBookByIsbn(isbn)
    .then(book => res.send(book))
    .catch(error => res.status(error.status).json({ message: error.message }));
});

public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();
    getAllBooks()
    .then((resultBooks) => Object.values(resultBooks))
    .then((books) => books.filter((book) => book.author.toLowerCase() === author))
    .then((filteredBooks) => res.send(filteredBooks));
  });

public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();
    getAllBooks()
    .then((resultBooks) => Object.values(resultBooks))
    .then((books) => books.filter((book) => book.title.toLowerCase() === title))
    .then((filteredBooks) => res.send(filteredBooks));
  });


public_users.get('/review/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);
  getBookByIsbn(isbn)
    .then(book => res.send(book.reviews))
    .catch(error => res.status(error.status).json({ message: error.message }));
});

module.exports.general = public_users;
