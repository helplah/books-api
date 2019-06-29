const { Author, Book } = require("./models");

const createAuthorsAndBooks = async () => {
  /* setAuthor AKA magic method exists for tables in a belongTo relationship */
  // create authors
  // const author1 = await Author.create({ name: "George Orwell" });

  // create books
  // await Book.create({ title: "Animal Farm" });
  // await Book.setAuthor(author1);

  // good for one-to-many method
  await Author.create(
    {
      name: "George Orwell",
      books: [
        { title: "Animal Farm" },
        { title: "1984" },
        { title: "Homage to Catalonia" },
        { title: "The Road to Wigan Pier" }
      ]
    },
    { include: [Book] }
  );

  await Author.create(
    {
      name: "Aldous Huxley",
      books: { title: "Brave New World" }
    },
    { include: [Book] }
  );

  await Author.create(
    {
      name: "Ray Bradbury",
      books: {
        title: "Fahrenheit 451"
      }
    },
    { include: [Book] }
  );
};

module.exports = createAuthorsAndBooks;
