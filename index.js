import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

// Creates an Express application instance.
const app = express();
// Sets the port number the server will listen on.
const port = 3000;

// Adds middleware to parse URL-encoded form data from requests.
app.use(bodyParser.urlencoded({ extended: true }));
// Serves static files (like HTML, CSS, JS) from the "public" directory.
app.use(express.static("public"));

// The URL pattern to access book covers is:
// https://covers.openlibrary.org/b/$key/$value-$size.jpg
// Source: https://openlibrary.org/dev/docs/api/covers
const API_URL = "https://covers.openlibrary.org/b/isbn/";

// database information
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "booknote",
  password: "1",
  port: 5432,
});
// Start connecting to db
db.connect();

// Initialize array for all book notes
var books = [];

// Type of sorting notes
// 1 : sort by title
// 2 : sort by recency
// 3 : sort by best rating
var sortType = 1;

// Get data from db
app.get("/", async (req, res) => {
  var result;
  try {
    switch (sortType) {
      case 2:
        result = await db.query("SELECT * FROM books ORDER BY date ASC");
        break;

      case 3:
        result = await db.query("SELECT * FROM books ORDER BY rating DESC");
        break;

      case 1:
        result = await db.query("SELECT * FROM books ORDER BY id ASC");
      default:
        break;
    }
    books = result.rows;
    res.render("index.ejs", {
      books,
    });
  } catch (err) {
    console.log(err);
  }
});

// Sorting notes
app.post("/", async (req, res) => {
  console.log(req.body);
});

// Create new book note
app.get("/new", (req, res) => {
  res.render("new.ejs", {
    heading: "New Note",
    submit: "Create Note"
  });
});

// Add new book note to database when clicking submit
// Also check if ISBN is valid, if not, prompt user to try again
app.post("/new", async (req, res) => {
  var isbn = req.body.isbn;
  var name = req.body.bookName;
  var author = req.body.author;
  var rating = req.body.rating;
  var note = req.body.note;
  try {
    await db.query("INSERT INTO books (isbn, name, author, rating, note) VALUES ($1, $2, $3, $4, $5)",
      [isbn, name, author, rating, note]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// View book note in detail
app.get("/view/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [req.params.id]);
    var book = result.rows[0];
    res.render("view.ejs", {
      book
    });
  } catch (err) {
    console.log(err);
  }
});

// Fetch current data from selected book note for editing
app.get("/edit/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [req.params.id]);
    var book = result.rows[0];
    res.render("new.ejs", {
      book,
      heading: "Edit Note",
      submit: "Update Note"
    });
  } catch (err) {
    console.log(err);
  }
});

// Edit book note and update database
app.post("/edit/:id", async (req, res) => {
  var isbn = req.body.isbn;
  var name = req.body.bookName;
  var author = req.body.author;
  var rating = req.body.rating;
  var note = req.body.note;
  var bookId = req.params.id;
  try {
    await db.query("UPDATE books SET isbn = $1, name = $2, author = $3, rating = $4, note = $5, updated_at = NOW() WHERE id = $6;",
      [isbn, name, author, rating, note, bookId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Confirmation before delete a note
app.get("/delete/:id", async (req, res) => {
  var bookId =req.params.id;
  try {
    const result = await db.query("SELECT name FROM books WHERE id = $1", [bookId]);
    var bookName = result.rows[0].name;
    res.render("delete.ejs", {
      bookName,
      bookId,
      heading: "Delete Note"
    });
  } catch (err) {
    console.log(err);
  }
});

// Delete a note from database if user confirms
app.post("/delete/:id", async (req, res) => {
  var bookId =req.params.id;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
