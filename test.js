require("dotenv").config();

const connectDB = require("./DB/dataBase");
const mongoose = require("mongoose");
const graph = require("./ai/graph/chatGraph");

(async () => {

    await connectDB();

    const result = await graph.invoke({
        question: "hik vison bulle cam",
    });

    console.log(result);

    await mongoose.disconnect();

})();