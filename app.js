require("dotenv").config();
require("express-async-errors");
const connectDB = require("./db/connect");

const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "https://panicodes.onrender.com",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const mainRouter = require("./routes/main");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authMiddleware = require("./middleware/auth");
const { connect } = require("mongoose");

// middleware
// app.set('view engine','ejs')
// app.use(express.static('./public'));
app.use(express.json());

app.use(authMiddleware);
app.use("/api/v1", mainRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.URL);
    // await studentDatabase.create({name:"rahul",year:3,results:[true,false,false,true]})
    // await staffDatabase.create({name:"sir1",subjects:["c++","java","python"]})
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
