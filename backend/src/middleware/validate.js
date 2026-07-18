// Wraps a Zod schema into Express middleware. Keeps controllers free of
// validation boilerplate — by the time a controller runs, req.body is
// guaranteed to match the schema shape.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data; // parsed + coerced (e.g. lowercased email)
    next();
  };
}