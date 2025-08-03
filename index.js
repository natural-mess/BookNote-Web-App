import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

// Creates an Express application instance.
const app = express();
// Sets the port number the server will listen on.
const port = 3000;

// Adds middleware to parse URL-encoded form data from requests.
app.use(bodyParser.urlencoded({ extended: true }));
// Serves static files (like HTML, CSS, JS) from the "public" directory.
app.use(express.static("public"));

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

// Get data from db
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books ORDER BY id ASC");
    books = result.rows;
    res.render("index.ejs", {
      books,
    });
  } catch (err) {
    console.log(err);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
