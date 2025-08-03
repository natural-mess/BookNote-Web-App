CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    isbn VARCHAR(13) NOT NULL,
    name VARCHAR(100) NOT NULL,
    author VARCHAR(50) NOT NULL,
    date DATE,
    rating TINYINT,
    note TEXT
);