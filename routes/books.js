const uuid = require("uuid/v4");
const express = require("express");
const router = express.Router();
const { books } = require("../data/db.json");
const { Book, Author } = require("../models");
const { sequelize } = require("../models/index");

const filterBooksBy = (property, value) => {
  return books.filter(b => b[property] === value);
};

// remember to put my-awesome-token in postman bearer token
const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.sendStatus(403);
  } else {
    if (authorization === "Bearer my-awesome-token") {
      next();
    } else {
      res.sendStatus(403);
    }
  }
};

router
  .route("/")
  .get(async (req, res) => {
    const { title, name } = req.query;

    if (title) {
      // Use where to filter
      const books = await Book.findAll({
        where: { title },
        include: [Author]
      }).catch(err => err);
      res.json(books);
    } else if (name) {
      // Author table doesn't have author name, thus need to use include to specify the model
      const books = await Book.findAll({
        include: [{ model: Author, where: { name } }]
      }).catch(err => err);
      res.json(books);
    } else {
      const books = await Book.findAll({
        include: [Author]
      });
      res.json(books);
    }
  })
  .post(verifyToken, async (req, res) => {
    const { title, name } = req.body;

    await sequelize.transaction(async t => {
      try {
        //find if author exist if not create
        const [foundAuthor] = await Author.findOrCreate({
          where: { name },
          transaction: t
        });

        //create a book w/o author
        const newBook = await Book.create({ title, transaction: t });
        await newBook.setAuthor(foundAuthor, { transaction: t });

        //query again
        const newBookWithAuthor = await Book.findOne({
          where: { id: newBook.id },
          include: [Author],
          transaction: t
        });
        res.status(201).json(newBookWithAuthor);
      } catch (err) {
        res.status(400).json({
          err: `An unexpected error has occurred ${req.message}`
        });
      }
    });
  });

router
  .route("/:id")
  .put(async (req, res) => {
    const book = await Book.findOne({
      where: { id: req.params.id },
      include: [Author]
    });

    if (book) {
      const updated = await Book.update({ title: req.body.title });
      res.status(202).json(updated);
    } else {
      res.sendStatus(400);
    }
  })
  .delete(async (req, res) => {
    const book = await Book.findOne({
      where: { id: req.params.id }
    });

    const destroy = await Book.destroy({
      where: {
        id: req.params.id
      }
    });

    if (destroy === 1) {
      res.status(202).json(book);
    } else {
      res.sendStatus(400);
    }
  });

module.exports = router;
