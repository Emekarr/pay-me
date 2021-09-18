import Mongoose from "mongoose";
const { connect } = Mongoose;

class DBInstance {
  constructor() {
    connect(process.env.DB_URL, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => {
        console.log("DB CONNECTION SUCCESSFUL");
      })
      .catch((err) => {
        console.log(`DB CONNECTION FAILED ${err.message}`);
        process.exit();
      });
  }
}

export default Object.freeze(new DBInstance());
