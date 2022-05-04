require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { all } = require("express/lib/application");
const https = require("https");
const { query } = require("express");
const app = express();
const whitelist = ["http://127.0.0.1"];

let items = [];
let workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// ToDo List
app.get("/", function (req, res) {
  let today = new Date();
  let options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let day = today.toLocaleDateString("en-gb", options);
  res.render("list", { listTitle: day, newListItems: items, route: "/" });
});

app.post("/", function (req, res) {
  let item = req.body.newItem;
  items.push(item);
  res.redirect("/");
});
// Delete To Do List item
app.get("/delete", function (req, res) {
  res.render("list", {
    listTitle: day,
    newListItems: items,
    route: "/",
  });
});
app.post("/delete", function (req, res) {
  let itemItself = req.body.itemItself;
  let deleteItem = items.indexOf(itemItself); //index of the item
  items.splice(deleteItem, 1);

  res.redirect("/");
});
// Work ToDo List
app.get("/workList", function (req, res) {
  res.render("workList", {
    listTitle: "Work List",
    newListItems: workItems,
    route: "/workList",
  });
});
app.post("/workList", function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  console.log(workItems);
  res.redirect("/workList");
});
// Delete Work To Do List item
app.get("/deleteWork", function (req, res) {
  res.render("workList", {
    listTitle: "Work List",
    newListItems: workItems,
    route: "/workList",
  });
});
app.post("/deleteWork", function (req, res) {
  let itemItself = req.body.itemItself;
  let deleteItem = workItems.indexOf(itemItself); //index of the item

  workItems.splice(deleteItem, 1);

  res.redirect("/workList");
});

// Weather Inquiry Page
app.get("/weather", function (req, res) {
  res.render("weather");
});
// Weather Render Page
app.get("/weatherInfo", function (req, res) {
  res.render("weatherInfo");
});
// Weather Inquiry Page Post Request
app.post("/weather", function (req, res) {
  const query = req.body.cityName;
  const apiKey = process.env.WEATHER_API_KEY;
  const unit = "metric";
  const url =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    query +
    "&appid=" +
    apiKey +
    "&units=" +
    unit +
    "";
  https.get(url, function (response) {
    console.log(response.statusCode);
    response.on("data", function (data) {
      const weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const weatherDescription = weatherData.weather[0].description;
      const icon = weatherData.weather[0].icon;
      const imageURL = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
      // Rendering the request on the Weather Render Page
      res.render("weatherInfo", {
        query: query,
        weatherData: weatherData,
        temp: temp,
        weatherDescription: weatherDescription,
        imageURL: imageURL,
      });
    });
  });
});

// Server
app.listen(3000, function () {
  console.log("The server is running on port 3000");
});
