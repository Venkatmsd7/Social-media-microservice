const logger=require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  logger.error(error.stack);
  if (process.env.NODE_ENV === "production") {
    return res.status(500).json({ error: "Internal server error" });
  }
  return res.status(500).json({ error: error.message });
};

module.exports = errorHandler;

