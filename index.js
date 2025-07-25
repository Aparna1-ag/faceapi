const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: "Content-Type",
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  database: process.env.DB_DATABASE,
});

pool.getConnection((err, conn) => {
  if (err) {
    console.log(err);
    return;
  }
});


app.post("/sendfacedata", async (req, res) => {
  //    if (!req.body || !req.body.empName || !req.body.descriptorArray) {
  //     res.status(400).json({
  //         error: "must contain username and descriptor array"
  //     })

  const { empName, descriptorArray } = req.body;

  // const {descriptorArray} = req.body
  console.log(empName, descriptorArray);

  try {
    const [rows] = await pool.query(
      "INSERT INTO facedata (username,  descriptorArr) VALUES (?, ?)",
      [empName, descriptorArray]
    );
    res.json({
      success: true,
      insertId: rows.insertId,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "error processing request" });
  }
});

app.get("/hello", (req, res) => {
  res.send("Hellooooo");
});



app.post("/compare", async (req, res) => {

  let { userFace } = req.body;
  const [rows] = await pool.query("SELECT * FROM facedata");
  const userFaceForComparison = JSON.parse(userFace);

  let allComparisons = []

  const faceMatcher = (dbArr, username) => {
    const dbArrForComparison = JSON.parse(dbArr);

    let differenceOfSquares = [];

    for (let a = 0; a < userFaceForComparison.length; a++) {
      let differenesForEachPoint = Number(dbArrForComparison[a]) - Number(userFaceForComparison[a]);
      differenceOfSquares.push(Math.pow(differenesForEachPoint, 2));
      // console.log(a, userFaceForComparison[a])
      // console.log(a, dbArrForComparison[a])
    }

    // console.log(differenceOfSquares)

    let sumOfDifferences = 0;

    for (let each of differenceOfSquares) {
      sumOfDifferences += each;
    }

    // console.log(sumOfDifferences)

    const euclideanDistance = Math.sqrt(sumOfDifferences);

    // console.log(euclideanDistance, username);
    allComparisons.push({
        distanceIndicator: euclideanDistance,
        personName: username

    })

  };

  for (let each of rows) {
    faceMatcher(each.descriptorArr, each.username);
  }


  // console.log(allComparisons)

  let bestMatch = allComparisons[0].distanceIndicator
  let bestMatchUserName = allComparisons[0].personName
  let noMatch = true

 const findIfNoMatches = () => {
  for (let y = 0 ; y < allComparisons.length; y++) {
    if  (allComparisons[y].distanceIndicator  < 0.5) {
      noMatch = false
      return
    }

  }
 }

 findIfNoMatches()

  


if (!noMatch) {
  for (let y = 0 ; y < allComparisons.length; y++) {
    console.log(allComparisons[y].distanceIndicator)
    if (allComparisons[y].distanceIndicator < bestMatch) {
        bestMatch = allComparisons[y].distanceIndicator
        bestMatchUserName = allComparisons[y].personName
        console.log(allComparisons[y].personName, bestMatchUserName)
    }
}

if (bestMatch > 0.5) {
  bestMatchUserName =  "No matches found"
  bestMatch = "NA"
}

res.json({
  success: true,
  bestMatchFace: bestMatchUserName,
  indicator: bestMatch
});

  
    
  } else {
    res.json({
      success: true,
      bestMatchFace: "No matching faces found",
      indicator: null
    });

  }





});

app.listen(PORT, () => {
  console.log("App listening to port " + PORT);
});
