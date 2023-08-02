"use strict";
const test = require('./htmlTemplate.js');
const express = require("express");
const upload = require('express-fileupload');
const myApp = new express();
const path = require("path");
const port = 8080;
const mongoose = require("mongoose");
const session = require("express-session");


myApp.use(session({
    secret :"66b40822-73c6-50c4-a5d7-8fd3aa19152a",
    resave:false,
    saveUninitialized : true
}));

const { check, validationResult } = require('express-validator');

myApp.set("view engine", "ejs");
myApp.use(express.urlencoded({ extended: true }));
myApp.set("views",path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));
myApp.use(upload());
const pages = [];
const reservedNames = ["edit","login","logout"];
myApp.get("/",(req,res)=>{
   res.redirect('/HOME');
});
myApp.get("/edit",(req,res)=>{
    res.render('edit');
});
myApp.get("/:name/",(req,res)=>{
    let name = req.params.name;

    let filter = pages.filter(x=> x.route.toLowerCase() == name.toLowerCase());
    if(filter.length === 1){
        console.log("I'm running this for: "+"/"+name);
        test.createNav(pages);
        let html = test.createHTMLPage(filter[0].name,filter[0].name,filter[0].content,filter[0].image);
        res.send(html);
    }
    else{
        console.log(req.url)   
        res.redirect('/edit');
    }
});

myApp.post("/edit",[check("pagename").notEmpty()],(req,res)=>{
    const expressErrors = validationResult(req);
    let html=req.body.htmlcontent;
    let title = req.body.articleTitle;
    let pageName = req.body.pagename;
    const errors = [];
    let imageName = "";
    if(!expressErrors.isEmpty()){
        for(let err of expressErrors.array()){
            console.log(`Express errors: ${err.msg}`);
        }
        errors.push("You must supply a page name");
    }
    if(req.files){
        console.log(req.files);
        let image = req.files.Image;
        

        if(image){
            imageName = image.name;
            let mimeType = image.mimetype;
            //Check that the file is an image
            if(/^image/.test(mimeType)){
                console.log(`${imageName} is an image`);
                const imageFolderPath = './public/images/' + imageName;
                image.mv(imageFolderPath,(err) => {
                    if(err){
                        console.log(`Error with ${imageName}:${err}`);
                        errors.push("Something went wrong with uploading the file");
                    }
                });
            }
            else{
                errors.push("Please upload an image");
            }
            console.log(`Mimetype is: ${mimeType}`);
        }
        
    }
    else{
        errors.push("Please upload an image");
    }
    
    console.log(pageName)
    pageName = pageName.replaceAll(' ','-');
    
    for(const page of reservedNames){
        if(pageName == page){
            errors.push(`Page name '${page}' is a reserved name`);
        }
    }

    let filter = pages.filter(x=>x.route === pageName);
    console.log(`Filter length: ${filter.length}`);
    if(errors.length===0){
        if(filter.length===0){
            let page = {
                name:title,
                route:pageName,
                content:html,
                image:imageName
            };
            pages.push(page);
            console.log(pageName);
        }
        if(filter.length===1){
            console.log(filter[0].route)
            filter[0].name=title;
            filter[0].content=html;
            filter[0].route=pageName;
            filter[0].image=imageName;
        }
    }   
    
    console.log(pages);
    res.render("edit",{errors});
});

myApp.listen(port);
console.log("Server running");