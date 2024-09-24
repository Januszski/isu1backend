// app.js

const express = require("express");
const app = express();
const PORT = 8080;
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const corsOptions = {
  origin: "*",
  methods: "POST,GET,OPTIONS",
  allowedHeaders: "Content-Type",
};
app.use(cors(corsOptions));

const prisma = new PrismaClient();

app.use(express.json());

//////////////////

app.post("/getPrisoner", async (req, res) => {
  const { id } = req.body;

  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT * FROM prisoners WHERE id = ${id}`
    );

    if (result.length > 0) {
      res.json(result);
    } else {
      res.status(404).json({ error: "Prisoner not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch prisoner", details: error.message });
  }
});

app.post("/getPrisonersFromCellIdDb", async (req, res) => {
  const { id } = req.body;

  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT prisoners.* FROM prisoners JOIN prisoner_cells ON prisoners.id = prisoner_cells.prisoner_id WHERE prisoner_cells.cell_id = ${id}`
    );

    if (result.length > 0) {
      res.json(result);
    } else {
      res.status(404).json({ error: "Prisoner not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to fetch prisoner", details: error.message });
  }
});

app.post("/updatePrisonerNotes", async (req, res) => {
  const { prisonerId, notes } = req.body;

  try {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE prisoners SET notes = '${notes}' WHERE id = ${prisonerId}`
    );

    if (result) {
      res.json({ message: "Prisoner notes updated successfully." });
    } else {
      res.status(404).json({ error: "Prisoner not found or update failed." });
    }
  } catch (error) {
    console.error("SQL Error:", error);
    res.status(500).json({
      error: "Failed to update prisoner notes",
      details: error.message,
    });
  }
});

app.post("/uploadComplaint", async (req, res) => {
  const { message, subject, sender_name } = req.body;

  try {
    const result = await prisma.$executeRawUnsafe(`
          INSERT INTO messages (message, subject, sender_name)
          VALUES ('${message}', '${subject}', '${sender_name}');
        `);

    res.status(201).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: "Failed to insert message" });
  }
});

app.listen(PORT, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
