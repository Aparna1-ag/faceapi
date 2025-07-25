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
    console.log(rows);
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
  userFace = JSON.parse(userFace);

  const faceMatcher = (desArr, username) => {
    desArr = JSON.parse(desArr);

    let differenceOfSquares = [];

    for (let a = 0; a < userFace.length; a++) {
      let differenesForEachPoint = Number(desArr[a]) - Number(userFace[a]);
      differenceOfSquares.push(Math.pow(differenesForEachPoint, 2));
      // console.log(a, userFace[a])
      // console.log(a, desArr[a])
    }

    // console.log(differenceOfSquares)

    let sumOfDifferences = 0;

    for (let each of differenceOfSquares) {
      sumOfDifferences += each;
    }

    // console.log(sumOfDifferences)

    const euclideanDistance = Math.sqrt(sumOfDifferences);

    console.log(euclideanDistance, username);
  };

  for (let each of rows) {
    faceMatcher(each.descriptorArr, each.username);
  }

  res.json({
    success: true,
  });
});

app.listen(PORT, () => {
  console.log("App listening to port " + PORT);
});
