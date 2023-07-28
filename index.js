"use strict";
const express = require("express");
const myApp = new express();
const path = require("path");
const port = 8080;

const session = require("express-session");
myApp.use(session({
    secret :"66b40822-73c6-50c4-a5d7-8fd3aa19152a",
    //secret : "123456",
    resave:false,
    saveUninitialized : true
}));

const { check, validationResult } = require('express-validator');

myApp.set("view engine", "ejs");
myApp.use(express.urlencoded({ extended: true }));
myApp.set("views",path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));

const pages = ["login","about"];
myApp.get('/users/:userId/books/:bookId', (req, res) => {
    console.log(req.params);
    res.send(req.params);
  });

myApp.get("/pages/:pageName/",(req,res)=>{
    let {type} = req.params;
    console.log(req.params);
    res.send(req.params);
});
myApp.get("/:pageName/",(req,res)=>{
    let {type} = req.params;
    console.log(req.params);
    res.send(req.params);
});
pages.forEach((name)=>{
    myApp.get("/"+name,(req,res)=>{
        res.send("abcdefg");
    })
});


myApp.listen(port);
console.log("Server running");