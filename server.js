const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieSession = require("cookie-session");

const app = express();
const PORT = 3000;

const animespath = path.join(__dirname, "data", "animes.json");
const animedetailspath = path.join(__dirname, "data", "anime_details.json");
const characterdetailspath = path.join(
  __dirname,
  "data",
  "character_details.json"
);
const favpath = path.join(__dirname, "data", "favourites.json");
const userpath = path.join(__dirname, "data", "users.json");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["secret-key-tanay"], // Ideally hide this in environment variables
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const requireLogin = (req, res, next) => {
  if (req.session.userId) {
    next(); // User is good, let them pass
  } else {
    res.redirect("/login"); // Stop right there! Go to login.
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

app.get("/anime/:id", (req, res) => {
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
app.get("/character/:name", (req, res) => {
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
app.get("/favourites", (req, res) => {
  fs.readFile(favpath, (err, data) => {
    const favs = JSON.parse(data || "[]");
    res.render("favourites", { favourites: favs });
  });
});

app.post("/favourites", (req, res) => {
  const newChar = req.body;
  fs.readFile(favpath, (err, data) => {
    const favs = JSON.parse(data || "[]");
    const found = favs.find((fav) => fav.name === newChar.name);
    if (found) {
      res.redirect("/favourites");
    } else {
      favs.push(newChar);
      fs.writeFile(favpath, JSON.stringify(favs, null, 2), (err) => {
        if (err) res.status(500).send(`Failed to Add: Server Error!`);
        else res.redirect("/favourites");
      });
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/login", (req, res) => {
  const userDetails = req.body;
  fs.readFile(userpath, (err, data) => {
    const users = JSON.parse(data || "[]");
    const found = users.find((user) => user.email === userDetails.email);
    if (found) {
      if (found.password === userDetails.password) {
        req.session.userId = found.id;
        res.redirect("/");
      } else {
        res.send(`Incorrect Password <a href='/login'>Try Again</a>`);
      }
    } else {
      res.redirect("/signup");
    }
  });
});

app.post("/signup", (req, res) => {
  const newUser = req.body;
  fs.readFile(userpath, (err, data) => {
    const users = JSON.parse(data || "[]");
    const found = users.find((user) => user.email === newUser.email);
    if (found) res.redirect("/login");
    else {
      newUser.id = Date.now().toString();
      users.push(newUser);
      fs.writeFile(userpath, JSON.stringify(users, null, 2), (err) => {
        if (err) res.status(500).send(`Failed to Add: Server Error!`);
        else res.redirect("/login");
      });
    }
  });
});

app.get("/logout", (req, res) => {
  req.session = null; // Clear the session
  res.redirect("/");
});

app.post("/recommendations", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
