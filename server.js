const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
const router = express.Router();
var mysql = require("mysql");


app.use(bodyParser.json()); // Add this line to parse JSON requests
app.use(bodyParser.urlencoded({ extended: true })); // Add this line to parse URL-encoded requests

var connection = mysql.createConnection({
  host: "db4free.net",
  user: "netgluayadmin",
  password: "netgluay",
  database: "netgluaydb",
});

connection.connect((error) => {
  if (error) console.log(error);
  else console.log("MYSQL Connected...");
});
// Dummy leaderboard data
const dummyLeaderboard = [
  { username: "user1", score: 100 },
  { username: "user2", score: 90 },
  { username: "user3", score: 80 },
  { username: "user4", score: 70 },
  { username: "user5", score: 60 },
  // ... add more entries as needed
];

app.use(express.static(path.join(__dirname, "/")));


router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

router.get("/leaderboard", (req, res) => {
  // Query the leaderboard table from the MySQL database
  connection.query(
    "SELECT * FROM leaderboard ORDER BY score DESC",
    (error, rows) => {
      if (error) {
        console.error("Error querying leaderboard from MySQL:", error);
        res.status(500).send("Internal Server Error");
      } else {
        res.json({ leaderboard: rows });
      }
    }
  );
});

router.post('/updateScore', (req, res) => {
	const { username, score } = req.body;
  
	connection.query(
	  'INSERT INTO leaderboard (username, score) VALUES (?, ?) ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score))',
	  [username, score],
	  (error, result) => {
		if (error) {
		  console.error('Error updating score in MySQL:', error);
		  res.status(500).json({ error: 'Internal Server Error' });
		} else {
		  res.json({ message: 'Score updated successfully' });
		}
	  }
	);
  });

app.use("/", router);
app.listen(process.env.port || 3000);

console.log("Listening on port 3000");
