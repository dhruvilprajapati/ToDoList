const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.set('view engine', 'ejs');

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workList = [];

app.get("/", (req, res) => {
    let day = date();
    res.render("list", { listTitle: day, newListItems: items });
})
app.post("/", (req, res) => {
    const item = req.body.newItem;
    if (req.body.list === "Work") {
        workList.push(item);
        res.redirect("/work");
    }
    else {
        items.push(item);
        res.redirect("/");
    }

})
app.get("/work", (req, res) => {
    res.render("list", { listTitle: "Work Time", newListItems: workList });
});

app.listen(3000, () => {
    console.log("Starting the server!!!")
})