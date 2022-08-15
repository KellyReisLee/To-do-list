//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

//1) Require mongoose in the file.js.
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//2) Create a new databasa inside MongoDB.
mongoose.connect("mongodb+srv://admin-kelly:1234@cluster0.aa8blhl.mongodb.net/todolistDB");

//3) Create a new schema:

const itemsSchema = {
  name: String
};

//4) Create a mongoose model basedd in the schema.
//The mongoose model has to be capitalize.
const Item = mongoose.model("Item", itemsSchema);

//5) Create 3 new documents using our brand new item mongoose
//model.

const item1 = new Item({
  name: "Welcome to our to do list."
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});


//6.  Putting all items inside an array.
const defaultItems = [item1, item2, item3];

//new schema:
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//New Model - create a new collection.
const List = mongoose.model("List", listSchema);

//This is the root route.
//This part will show tthe content inside the webpage.
app.get("/", function(req, res) {

// - Mongoose find()
  //type model + method(find) + {}(empty means find all), callback function.
//We have to write here because we will send them over to our list.ejs
//I will trigger thi methos just accessing the homepage or my root rout.
  Item.find({}, function(err, findItems){

    if(findItems.length === 0){
      //7.  Inserting all this items in one go into our items into our collection.
      //Using the insertMany() method.
      Item. insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Yes, everything goes well.")
        }
      });

      res.redirect("/");
    }else{
      res.render("list", {
        listTitle: "Today",
        newListItems: findItems
      });
  };
});
});


// Create a new and dynamic routes with express:
app.get("/:customerListName", function(req, res){
const customerListName = _.capitalize(req.params.customerListName);
  //represent the word after the forward slash in URL.
  //So we can use it to create a new document.

  //Avoid duplicate the same code when you run a webpage:
  List.findOne({name:customerListName}, function(err, foundList){
    if (!err){
      if (!foundList){
      //Create  a new list
      //New document:
      //1. Create a new schema in the above code:
      //2. Create a new model.
      const list = new List({
        name: customerListName,
        items: defaultItems
      });
    list.save();
    res.redirect("/" + customerListName);
    //When you reload, continue in the same route page with the customerListName.
      }else{
        //Show an existing list.
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

  //New document:
  //1. Create a new schema in the above code:
  //2. Create a new model.
  const list = new List({
    name: customerListName,
    items: defaultItems
  });

// list.save();
});


//This app.post get information by the user.
//This route is to create new items.
app.post("/", function(req, res) {

//This code has get information from the input.
  const itemName = req.body.newItem;
  const listName = req.body.list;

//Allows us create a new element in a list
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    //Using this you save the item inside the collections.
    item.save();
    //This code allows us to show the new item on webpage.
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});


//Deleting specific item from s collection.
app.post("/delete", function(req, res){
const checkboxItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){

  Item.findByIdAndRemove(checkboxItemId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Handle any errors or log success.");

      //This will show the changes in a webpage.
      res.redirect("/");
      //This automatically delete item when you get click.
    }
  });
}else{
  List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkboxItemId}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  });
}
});


app.get("/about", function(req, res) {
  res.render("about");
});


let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started!");
});

// Creating new routes with new lists.



//OBS: If we want send some data when a butoon gets clicked,
//then we need a form and a post route.
