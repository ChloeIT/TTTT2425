const { ZodError } = require("zod");

function validateData(schema) {
  return (req, res, next) => {
    console.log("req.body inside validateData:", req.body);
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: issue.message,
          field: issue.path.join("."),
        }));

        res.status(400).json({ error: "Invalid data", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}

module.exports = validateData;
