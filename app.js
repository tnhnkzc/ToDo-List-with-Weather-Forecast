require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { all } = require("express/lib/application");
const https = require("https");
const { query } = require("express");
const app = express();
app.use(express.static("public"));
const whitelist = ["http://127.0.0.1"];
const mongoose = require("mongoose");
const _ = require("lodash");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Database Connection
mongoose.connect(process.env.MONGODB_URI);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list!",
});
const item2 = new Item({
  name: "Press < + > to add an item.",
});
const item3 = new Item({
  name: "Press the checkbox to delete an item.",
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

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
  //Fetch items from DB
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved the default items to the DB.");
        }
      });
      res.redirect("/");
    }
    if (err) {
      console.log(err);
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
        route: "/",
      });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      let newItems = foundList.items;
      newItems.push(item);
      foundList.save();
      res.redirect("/lists/" + listName);
    });
  }
});
// Delete To Do List item
app.get("/delete", function (req, res) {
  res.render("list", {
    listTitle: day,
    newListItems: foundItems,
    route: "/",
  });
});
app.post("/delete", function (req, res) {
  const listItem = req.body.deleteItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(listItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: listItem } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/lists/" + listName);
        }
      }
    );
  }
});
// Custom ToDo List
app.get("/lists/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  const existingListName = List.findOne(
    { name: customListName },
    function (err, foundList) {
      if (!err) {
        if (!foundList) {
          //Create a new list.
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          list.save();
          res.redirect("/lists/" + customListName);
        } else {
          //Show an existing list.
          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items,
          });
        }
      }
    }
  );
});

// Weather Inquiry Page
app.get("/weather", function (req, res) {
  res.render("weather");
});
// // Weather Render Page
// app.get("/weatherInfo", function (req, res) {
//   res.render("weatherInfo");
// });
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
app.listen(process.env.PORT || 3000, function () {
  console.log("The server is running on port 3000");
});
