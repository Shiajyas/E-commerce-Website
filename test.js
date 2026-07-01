require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./DB/dataBase");

const app = require("./ai/graph/chatGraph");

const testCases = [

  // ==========================
  // OFFICE
  // ==========================
  "best camera for office",
  "recommend camera for office",
  "office camera under 5000",
  "hikvision camera for office",
  "camera for office with night vision",

  // ==========================
  // HOME
  // ==========================
  "best camera for home",
  "camera for house",
  "wifi camera for home",
  "home camera under 3000",
  "cpplus camera for home",

  // ==========================
  // SHOP
  // ==========================
  "camera for shop",
  "best camera for small shop",
  "shop camera with audio",
  "camera for supermarket",
  "camera for showroom",

  // ==========================
  // WAREHOUSE
  // ==========================
  "camera for warehouse",
  "best camera for warehouse",
  "warehouse camera under 10000",
  "hikvision warehouse camera",
  "warehouse camera with night vision",

  // ==========================
  // PARKING
  // ==========================
  "camera for parking",
  "best parking camera",
  "parking camera under 6000",
  "outdoor parking camera",
  "parking camera with number plate detection",

  // ==========================
  // SCHOOL
  // ==========================
  "camera for school",
  "camera for classroom",
  "best classroom camera",
  "school camera under 7000",

  // ==========================
  // HOSPITAL
  // ==========================
  "camera for hospital",
  "camera for clinic",
  "hospital camera with audio",

  // ==========================
  // FARM
  // ==========================
  "camera for farm",
  "camera for garden",
  "long range camera for farm",
  "outdoor farm camera",

  // ==========================
  // BRAND + REQUIREMENTS
  // ==========================
  "hikvision wifi camera under 8000",
  "cpplus outdoor camera",
  "hikvision dome camera",
  "best bullet camera for gate",
  "camera with motion detection",
  "camera with human detection",
  "camera with full color night vision"

];

(async () => {

    await connectDB();

    for (const question of testCases) {

        console.log("\n====================================================");
        console.log("QUESTION:");
        console.log(question);

        try {

            const result = await app.invoke({

                question,

                intent: "",

                context: [],

                answer: ""

            });

            console.log("------------------------------------");
            console.log("Intent :", result.intent);

            console.log("------------------------------------");
            console.log("Answer :");
            console.log(result.answer);

            console.log("------------------------------------");

            if (Array.isArray(result.context)) {

                console.log(`Context : ${result.context.length} item(s)`);

            } else {

                console.log("Context :", result.context);

            }

        } catch (err) {

            console.log("ERROR");
            console.error(err);

        }

    }

})();