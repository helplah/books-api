require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize;
const currentEnv = process.env.NODE_ENV || "development";

if (currentEnv === "production") {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres"
  });
} else {
  sequelize = new Sequelize(
    "books-api",
    "postgres",
    process.env.DATABASE_PASSWORD,
    {
      dialect: "postgres"
    }
  );
}

const models = {
  Book: sequelize.import("./book"),
  Author: sequelize.import("./author")
};

// call association method in each model
Object.keys(models).forEach(key => {
  console.log(models);
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

module.exports = { sequelize, ...models };
