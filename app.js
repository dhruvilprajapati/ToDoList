const express = require('express');
const bodyParser = require('body-parser');
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express()
const _ = require("lodash");

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.set('view engine', 'ejs');

// retryWrites=true&w=majority"
// "mongodb+srv://Dhruvil:7JV0gVUceMhn5XoP@cluster0.aocapva.mongodb.net/todolistDB"
mongoose.connect("mongodb+srv://root:JUJ4aRiYEHnaNvsd@to-do-list.gs8x4gh.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Drink water"
});
const item2 = new Item({
    name: "Buy Foods"
});
const item3 = new Item({
    name: "Eat Foods"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
    Item.find()
        .then(
            function (foundItems) {
                if (foundItems.length === 0) {
                    Item.insertMany(defaultItems)
                        .then(function () {
                            console.log("Successfully saved defult items to DB");
                        })
                        .catch(function (err) {
                            console.log(err);
                        });
                    res.redirect("/");
                }
                else {
                    res.render("list", { listTitle: "Today", newListItems: foundItems });
                }
            }
        )
        .catch(function (err) {
            console.log(err);
        });

})
app.post("/", (req, res) => {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })
    if (listName == "Today") {
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName })
            .then(function (foundList) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
    }
});
app.post("/delete", (req, res) => {
    const checkedItemdId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemdId)
            .then(function () {
                console.log("Successfully delete items to DB");
                res.redirect("/");
            });
    }
    else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemdId } } })
            .then(
                function () {
                    res.redirect("/" + listName);
                });
    }
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then(function (foundItems) {
            if (!foundItems) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("list", { listTitle: foundItems.name, newListItems: foundItems.items })
            }
        })
        .catch(function (err) {
            console.log(err)
        })

});

app.listen(3000, () => {
    console.log("Starting the server!!!")
})