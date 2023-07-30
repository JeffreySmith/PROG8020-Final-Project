"use strict";
const test = require('./htmlTemplate.js');
const express = require("express");
const myApp = new express();
const path = require("path");
const port = 8080;

const session = require("express-session");
myApp.use(session({
    secret :"66b40822-73c6-50c4-a5d7-8fd3aa19152a",
    resave:false,
    saveUninitialized : true
}));

const { check, validationResult } = require('express-validator');

let template = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple CMS</title>
        <link rel="stylesheet" href="css/normalize.css">
        <link rel="stylesheet" href="css/styles.css">
    </head>
<body>`;
let testInfo = `
<p>Et ea pariatur amet eiusmod reprehenderit ea ipsum sunt occaecat cillum fugiat sint voluptate non eiusmod aliquip aliquip esse aliqua commodo magna sunt labore enim
Labore eiusmod laboris amet consequat tempor quis magna quis quis fugiat <strong>cupidatat tempor</strong> incididunt officia sit pariatur cupidatat elit mollit ut voluptate proident sunt aute</p>
`
myApp.set("view engine", "ejs");
myApp.use(express.urlencoded({ extended: true }));
myApp.set("views",path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));

const pages = [];


myApp.get("/edit",(req,res)=>{
    res.render('edit');
});
myApp.get("/:name/",(req,res)=>{
    let name = req.params.name;

    let filter = pages.filter(x=> x.route == name);
    if(filter.length === 1){
        console.log("I'm running this for: "+"/"+name);

        //let html = test.createHTMLPage(name,newTitle,content);    
        let html = test.createHTMLPage(filter[0].name,filter[0].name,filter[0].content);
        res.send(html);
    }
    else{
        console.log(req.url)   
        res.redirect('/edit');
    }
    
})


myApp.get("/pages/:pageName/",(req,res)=>{
    let {type} = req.params;
    console.log(req.params);
    res.send(req.params);
});


myApp.post("/edit",[check("htmlcontent").notEmpty(),check("pagename").notEmpty()],(req,res)=>{

    let html=req.body.htmlcontent;
    let title = req.body.articleTitle;
    let pageName = req.body.pagename;
    console.log(pageName)
    pageName = pageName.replace(' ','');
    //console.log(pageName);
    let filter = pages.filter(x=>x.route === pageName);
    console.log(`Filter length: ${filter.length}`);
    if(filter.length===0){
        let page = {
            name:title,
            route:pageName,
            content:html
        };
        pages.push(page);
    }
    else{
        console.log(filter[0].route)
        filter[0].name=title;
        filter[0].content=html;
        //filter[0].route=pageName;
    }   
    
    console.log(pages);
    res.render("edit");
});

myApp.listen(port);
console.log("Server running");