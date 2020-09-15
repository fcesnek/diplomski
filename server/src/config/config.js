module.exports = {
  port: process.env.PORT || 8081,
  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'secret'
  },
  dbPath: process.env.MONGO_URI || 'mongodb://localhost:27017/diplomski'
};
