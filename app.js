const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dateModule = require(__dirname + "/date.js")
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://uid:pw@url/todolistDB");

var allLists = [];
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todoList"
})

const item2 = new Item({
  name: "Hit + button to add a new Item"
})

const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const item4 = new Item({
  name: "To create a new list, add /listname to the URL"
})

const defaultItems = [item1, item2, item3, item4];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);
// let items = [];
// let workItems = [];
app.get("/", function(req, res) {
  allLists = [];
  Item.find(function(err, items) {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Successfully saved all the items to DB");
            res.redirect("/");
            //mongoose.connection.close();
          }
        })
      } else {

        List.find({}, function(err, lists) {
          allLists = [];
          lists.forEach((list, i) => {
            if(list.name != "Favicon.ico"){
              allLists.push(list.name);
            }
          });
          res.render("list", {
            listTitle: dateModule.getDate(),
            greeting: dateModule.getGreeting(),
            newListItems: items,
            allLists: allLists
          });
        });

      }
    }
  })


})

app.post("/", function(req, res) {
  const itemName = req.body.task;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === dateModule.getDate()){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err, foundList){
      if(!err){
        //console.log(listName);
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+req.body.list);
      }
    })
  }
})

app.get("/about", function(req, res) {
  res.render("about");
})

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === dateModule.getDate()){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err, foundList){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/"+listName);
      }
    })
  }



})

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  console.log("customListName "+customListName);
  List.findOne({ name: customListName }, function(err, result) {
    if (err) {
      console.log(err);
    }
    else
    {
      if (result) {
        //console.log(customListName + " list already exists!");
        List.find({}, function(err, lists) {
          allLists = [];
          lists.forEach((list, i) => {
            if(list.name != "Favicon.ico"){
              allLists.push(list.name);
            }
          });
          res.render("list", {
            listTitle: customListName,
            newListItems: result.items,
            greeting: dateModule.getGreeting(),
            allLists: allLists
          });
        });

      } else {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        if(customListName !== "Favicon.ico"){
          console.log("saved");
          list.save();
          res.redirect("/"+customListName);
        }
      }
    }
  })

})



app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
})
