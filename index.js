"use strict";
//defines my dynamically creating html functions
const {createHTMLPage,createNav} = require('./htmlTemplate.js');
const express = require("express");
const upload = require('express-fileupload');
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const { check, validationResult } = require('express-validator');

const port = 8080;
const myApp = new express();
myApp.use(session({
    secret :"66b40822-73c6-50c4-a5d7-8fd3aa19152a",
    resave:false,
    saveUninitialized : true
}));


myApp.set("view engine", "ejs");
myApp.use(express.urlencoded({ extended: true }));
myApp.set("views",path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));
myApp.use(upload());
const pages = [];
const reservedNames = ["edit","login","logout","dashboard","add"];
myApp.get("/",(req,res)=>{
   res.redirect('/home');
});
myApp.get("/add",(req,res)=>{
    res.render('add');
});
myApp.get("/dashboard",(req,res)=>{
    res.render("dashboard",{pages});
});
myApp.get("/edit/:name/",(req,res)=>{
    let name = req.params.name;
    console.log(`/edit/${name}`);
    //pages.forEach(x=>console.log(x));
    let filter = pages.filter(x=>x.route.toLowerCase() == name.toLowerCase());
    console.log(`There are ${filter.length} elements in the filter for ${name}`);
    if(filter.length===1){
        let values = {
            html:filter[0].content,
            title:filter[0].name,
            pageName:filter[0].route
        };
        console.log(values);
        res.render('edit',{values});
    }
    else{
        res.redirect('/add');
    }
});

myApp.get("/:name/",(req,res)=>{
    let name = req.params.name;
    //Every one of these 'filter' variables needs to eventually become a call to the db
    let filter = pages.filter(x=> x.route.toLowerCase() == name.toLowerCase());
    if(filter.length === 1){
        console.log("I'm running this for: "+"/"+name);
        let nav = createNav(pages);
        let html = createHTMLPage(filter[0].name,filter[0].name,filter[0].content,filter[0].image,nav);
        res.send(html);
    }
    else{
        console.log(req.url)   
        res.redirect('/add');
    }
});
myApp.post("/edit",(req,res)=>{
    const expressErrors = validationResult(req);
    let html=req.body.htmlcontent;
    let title = req.body.articleTitle;
    let pageName = req.body.pagename;
    let image = "";
    let imageName = "";
    if(req.files){
        image = req.files.Image;
        imageName = image.name;
    }

    const errors = [];
    
    if(!expressErrors.isEmpty()){
        for(let err of expressErrors.array()){
            console.log(`Express errors: ${err.msg}`);
        }
        errors.push("You must supply a page name");
    }
    //Eventually don't let it put this value in on error. It should not insert an invalid page route
    if(pageName.includes('/')){
        errors.push("Please don't put a '/' in the page name");
    }


    let filter = pages.filter(x=>x.route.toLowerCase() == pageName.toLowerCase());
    let values={};
    if(errors.length===0 && filter.length===1){
        
        if(imageName!=""){
            filter[0].image=imageName;
        }
        else{
            filter[0].image=filter[0].image;
        }
        console.log(filter[0].route)
        filter[0].name=title;
        filter[0].content=html;
        filter[0].route=pageName;
        res.redirect("/dashboard");
    }
    else if(filter.length===0){
        res.redirect("/add");
    }
    else{
        res.render("edit",{errors,values});
    }
});
myApp.post("/add/",[check("pagename").notEmpty()],(req,res)=>{
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
    //Eventually don't let it put this value in on error. It should not insert an invalid page route
    if(pageName.includes('/')){
        errors.push("Please don't put a '/' in the page name");
    }

    if(req.files ){
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
    //This prevents weird things happening with spaces in urls
    pageName = pageName.replaceAll(' ','-');
    
    //We don't want someone trying to create a page that is predefined (like 'edit','login',etc)
    //Those values will change as I add more features to the site
    for(const page of reservedNames){
        if(pageName.toLowerCase() == page){
            errors.push(`Page name '${page}' is a reserved name`);
        }
    }
    //eventually a call to the db
    let filter = pages.filter(x=>x.route === pageName);
    console.log(`Filter length: ${filter.length}`);
    if(errors.length===0){
        //This means a page with that name does not yet exist
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
        //This means we're updating an existing page
        if(filter.length===1){
            if(imageName!=""){
                filter[0].image=imageName;
            }
            else{
                filter[0].image=filter[0].image;
            }
            console.log(filter[0].route)
            filter[0].name=title;
            filter[0].content=html;
            filter[0].route=pageName;
            /*filter[0].image=imageName;*/
        }
    }   
    let values={};
    console.log(pages);
    if(errors.length>0){
        values = {
            html:html,
            title:title,
            pageName:pageName
        };
        res.render("add",{errors,values});
    }
    else{
        res.render("add",{values});
    }
    
});

myApp.listen(port);
console.log("Server running");