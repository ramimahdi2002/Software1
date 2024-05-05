const express = require("./app/node_modules/express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const app = express();

const helpers = require("./app/helpers");
const Response = helpers.response;

app.use(cors());

app.use((req, res, next) => {
  express.json()(req, res, next);
});

app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

db.mongoose
  .connect(dbConfig.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  Response.success(res, {
    message: "Welcome to The Hiking API.",
  });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/account.routes")(app);
require("./app/routes/country.routes")(app);
require("./app/routes/community.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.use(
  "/files",
  express.static(require("path").join(__dirname, "/app/uploads"))
);
