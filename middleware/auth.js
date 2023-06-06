const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const ExpressError = require("../expressError");

function authenticateJson(req, res, next) {
  const result = jsonschema.validate(req.body, bookSchema);
  if (result.valid) {
    next();
  } else {
    let listOfErrors = result.errors.map((error) => error.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  }
}

module.exports = { authenticateJson };
