const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
app.use(express.json());
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertingToCamelCase = (players) => {
  return {
    playerId: players.player_id,
    playerName: players.player_name,
    jerseyNumber: players.jersey_number,
    role: players.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
  SELECT 
    *
  FROM 
    cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertingToCamelCase(eachPlayer))
  );
});
module.export = app;

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO 
  cricket_team  (player_name,jersey_number,role)
  VALUES('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
     *
     FROM
      cricket_team
      WHERE
       player_id=${playerId};`;
  const player = await db.get(getPlayerQuery);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team 
  SET 
  player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
  WHERE player_id=${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.delete(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const DeletePlayerQuery = `DELETE FROM cricket_team
    WHERE player_id=${playerId}`;
  await db.run(DeletePlayerQuery);
  response.send("Player Removed");
});
module.export = app;
