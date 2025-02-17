const logger=require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  logger.error(error.stack);
  return res.status(500).json({ error: error.message });
};

module.exports = errorHandler;

