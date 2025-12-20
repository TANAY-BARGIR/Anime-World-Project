require('dotenv').config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const User = require("./models/User");
const Favorite = require("./models/Favorite");

const app = express();
const PORT = 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected!");
  })
  .catch((err) => {
    console.log("❌ Connection Error:", err);
  });

const animespath = path.join(__dirname, "data", "animes.json");
const animedetailspath = path.join(__dirname, "data", "anime_details.json");
const characterdetailspath = path.join(
  __dirname,
  "data",
  "character_details.json"
);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

const requireLogin = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", (req, res) => {
  fs.readFile(animespath, (err, data) => {
    const animeList = JSON.parse(data || "[]");
    const isLoggedIn = !!req.session.userId;
    res.render("index", {
      title: "Anime World",
      animes: animeList,
      isLoggedIn: isLoggedIn,
    });
  });
});

app.get("/anime/:id", requireLogin, (req, res) => {
  const id_to_find = parseInt(req.params.id);
  fs.readFile(animedetailspath, (err, data) => {
    const animeDetails = JSON.parse(data || "[]");
    const animeFound = animeDetails.find((anime) => anime.id === id_to_find);
    if (animeFound) {
      res.render("anime_details", { anime: animeFound });
    } else {
      res.status(404).send("Anime not found");
    }
  });
});

app.get("/character/:name", requireLogin, (req, res) => {
  const name_to_find = req.params.name;
  fs.readFile(characterdetailspath, (err, data) => {
    const characterDetails = JSON.parse(data || "[]");
    const characterFound = characterDetails.find(
      (ch) => ch.name === name_to_find
    );
    if (characterFound) {
      res.render("character_details", { character: characterFound });
    } else {
      res.status(404).send(`Character ${name_to_find} not found in database.`);
    }
  });
});

app.get("/favourites", requireLogin, async (req, res) => {
  try {
    const favs = await Favorite.find({ user_id: req.session.userId });
    res.render("favourites", { favourites: favs });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching favorites");
  }
});

app.post("/favourites", requireLogin, async (req, res) => {
  const { name, anime, image } = req.body;
  try {
    const found = await Favorite.findOne({
      user_id: req.session.userId,
      name: name,
    });
    if (found) {
      res.redirect("/favourites");
    } else {
      await Favorite.create({
        user_id: req.session.userId,
        name: name,
        anime: anime,
        image: image,
      });
      res.redirect("/favourites");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding favorite");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const found = await User.findOne({ email: email });
    if (found && found.password === password) {
      req.session.userId = found._id;
      res.redirect("/");
    } else {
      res.send(`Invalid Email or Password <a href="/login"> Try Again</a>`);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Login Error");
  }
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const found = await User.findOne({ email: email });
    if (found)
      return res.send("User already exists. <a href='/login'>Login here</a>");
    else {
      const newUser = new User({
        username: name,
        email: email,
        password: password,
      });
      await newUser.save();
      console.log("New User Created:", newUser);
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating user");
  }
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

app.post("/recommendations", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
