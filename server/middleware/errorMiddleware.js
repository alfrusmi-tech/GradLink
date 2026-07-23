import multer from "multer";

export const notFound = (
  req,
  res,
  next
) => {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  res.status(404);

  next(error);
};

export const errorHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(error);

  if (
    error instanceof multer.MulterError
  ) {
    if (
      error.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(400).json({
        message:
          "The uploaded file is too large.",
      });
    }

    return res.status(400).json({
      message:
        error.message ||
        "File upload failed.",
    });
  }

  if (
    error.message?.includes(
      "Only PDF CV files are allowed"
    )
  ) {
    return res.status(400).json({
      message:
        "Only PDF CV files are allowed.",
    });
  }

  if (
    error.name === "CastError"
  ) {
    return res.status(400).json({
      message: "Invalid resource ID.",
    });
  }

  if (
    error.code === 11000
  ) {
    return res.status(400).json({
      message:
        "A record with this information already exists.",
    });
  }

  const statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  return res.status(statusCode).json({
    message:
      error.message ||
      "Internal server error.",

    stack:
      process.env.NODE_ENV ===
      "production"
        ? undefined
        : error.stack,
  });
};
