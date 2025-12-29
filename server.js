require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const Favorite = require("./models/Favorite");

const app = express();
const PORT = 3000;
const authRouter = express.Router();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch((err) => console.log("❌ Connection Error:", err));

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
app.use(cookieParser());
app.use(authRouter);

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SESSION_SECRET, { expiresIn: "1d" });
};

const requireLogin = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.SESSION_SECRET, (err, decodedToken) => {
      if (err) {
        res.redirect("/login");
      } else {
        req.userId = decodedToken.id; // This line stores the userId in req , we can access it anywhere throughout the code
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.SESSION_SECRET, (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        res.locals.user = decodedToken.id;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

app.use(checkUser);

app.get("/", (req, res) => {
  fs.readFile(animespath, (err, data) => {
    const animeList = JSON.parse(data || "[]");
    res.render("index", {
      title: "Anime World",
      animes: animeList,
      isLoggedIn: !!res.locals.user,
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
    const favs = await Favorite.find({ user_id: req.userId });
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
      user_id: req.userId,
      name: name,
    });
    if (found) {
      res.redirect("/favourites");
    } else {
      await Favorite.create({
        // Create is shortcut for new and .save() combination .
        user_id: req.userId,
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

authRouter.get("/login", (req, res) => res.render("login"));
authRouter.get("/signup", (req, res) => res.render("signup"));

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const found = await User.findOne({ email: email });
    if (found && found.password === password) {
      const token = createToken(found._id);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.redirect("/");
    } else {
      res.send(`Invalid Email or Password <a href="/login"> Try Again</a>`);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Login Error");
  }
});

authRouter.post("/signup", async (req, res) => {
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

      const token = createToken(newUser._id);
      res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      console.log("New User Created:", newUser);
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating user");
  }
});

authRouter.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});

app.post("/recommendations", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
