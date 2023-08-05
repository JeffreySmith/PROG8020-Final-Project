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
mongoose.connect("mongodb://localhost:27017/cms-jeffrey",{
    UseNewURLParser:true,
    UseUnifiedTopology:true,
});
const Page = mongoose.model("pages",{
    html:String,
    route:String,
    title:String,
    imageName:String
});
const Credentials = mongoose.model("credentials",{
    username:String,
    password:String
});
myApp.set("view engine", "ejs");
myApp.use(express.urlencoded({ extended: true }));
myApp.set("views",path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));
myApp.use(upload());

const reservedNames = ["edit","login","logout","dashboard","add"];

function checkImage(image,errors){
    let imageName="";
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
    return imageName;
}

myApp.get("/",(req,res)=>{
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    //eventually, check if 'home' exists before redirecting. Send to login
    res.redirect('/home');
});
myApp.get("/login",(req,res)=>{
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    if(req.session.admin!=undefined && req.session.admin){
        res.redirect('dashboard');
    }
    else{
        res.render('login');
    }
    
});
myApp.get("/logout",(req,res)=>{
    req.session.admin = false;
    res.redirect('/login');
});
myApp.get("/add",(req,res)=>{
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    if(req.session.admin!=undefined && req.session.admin){
        res.render("add");
    }
    else{
        res.redirect('/login');
    }
    
});
myApp.get("/dashboard",(req,res)=>{
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    //need a call to the db here to get page info.
    //this is a SELECT * kind of call
    if(req.session.admin!=undefined && req.session.admin){
        Page.find({}).then((page)=>{
            console.log(page);
            let pages = page;
            res.render("dashboard",{pages});
        }).catch((error)=>{
            console.log(`Error:${error}`);
        });
        //res.render("dashboard",{pages});
    }
    else{
        res.redirect('/login');
    }
    
});
myApp.get("/edit/:name/",(req,res)=>{
    let name = req.params.name;
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    console.log(`/edit/${name}`);

    let filter = pages.filter(x=>x.route.toLowerCase() == name.toLowerCase());
    console.log(`There are ${filter.length} elements in the filter for ${name}`);
    if(filter.length===1 && req.session.admin!=undefined && req.session.admin){
        let values = {
            html:filter[0].content,
            title:filter[0].name,
            pageName:filter[0].route
        };
        console.log(values);
        res.render('edit',{values});
    }
    else{
        res.redirect('/dashboard');
    }
});
myApp.get("/delete/:name/",(req,res)=>{
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    let name = req.params.name;
    let filter = pages.filter(x=>x.route.toLowerCase() == name.toLowerCase());
    if (filter.length===1 && req.session.admin){
        let index = pages.findIndex(x=>  x.route.toLowerCase() === name.toLowerCase());
        console.log(`index is: ${index}`);
        pages = [
            ...pages.slice(0,index),
            ...pages.slice(index+1)
        ];
        console.log(`Deleted page /${name} successfully`);
        let confirmation = {
            confirm:true,
            name:name
        }
        res.render('delete',{confirmation});
    }
    else{
        res.redirect('/dashboard');
    }
    
});

myApp.get("/:name/",(req,res)=>{
    let name = req.params.name;
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    let pages = [];
    //async problems led me to have to structure things this way. That was an incredibly frustrating bug
    //to figure out. My functions would *sometimes* succeed, then other times fail.
    Page.find({}).then((navPage)=>{
        console.log(`return from mongodb: ${navPage}`);
        for(let p of navPage){
            console.log(`Running for: ${p}`);
            pages.push(p.route);
            
        }
        console.log(`eia,srntietnihar${navPage[0].route}`);
        
        Page.findOne({route:name.toLowerCase()}).then((page)=>{
        
            if(page){
                let nav = createNav(pages);
                let html = createHTMLPage(page.title,page.title,page.html,page.imageName,nav);
                res.send(html);
            }
            else{
                Page.findOne({route:'home'}).then((homePage)=>{
                    if(homePage){
                        res.redirect('/home');
                    }
                    else{
                        res.redirect('/dashboard');
                    }
                }).catch((error)=>{
                    console.log(`Error:${error}`);
                });
            }
        }).catch((error)=>{
            console.log(`Error:${error}`);
        });

    }).catch((error)=>{
        console.log(`Error:${error}`);
    });

    
    //Every one of these 'filter' variables needs to eventually become a call to the db
    
    
    /*let filter = pages.filter(x=> x.route.toLowerCase() == name.toLowerCase());
    if(filter.length === 1){
        console.log("I'm running this for: "+"/"+name);
        let nav = createNav(pages);
        let html = createHTMLPage(filter[0].name,filter[0].name,filter[0].content,filter[0].image,nav);
        res.send(html);
    }
    else{
        console.log(req.url)   
        if(pages.findIndex(x=>x.route.toLowerCase()==="home")!=-1){
            res.redirect('/home');
        }
        else{
            res.redirect('/login');
        }
    }*/
});

myApp.post("/edit",(req,res)=>{
    const expressErrors = validationResult(req);
    let html=req.body.htmlcontent;
    let title = req.body.articleTitle;
    let image = "";
    let imageName = "";
    let pageName = req.body.pagename;
    const errors = [];
    if(req.files){
        image = req.files.Image;
        
        //*TODO*Check for valid filetype here, but allow none if they don't want to change the photo here
        imageName=checkImage(image,errors);
    }

    
    
    if(!expressErrors.isEmpty()){
        for(let err of expressErrors.array()){
            console.log(`Express errors: ${err.msg}`);
        }
        errors.push("You must supply a page name");
    }
    
    
    console.log(`PageName:${pageName}`);
    let filter = pages.filter(x=>x.route === pageName);
    
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
       

        let confirmation = {confirm:true};
        res.render("edit",{confirmation});
    }
   else if( filter.length==1 && errors.length>0){
        console.log(`filter is: ${filter}`);
        values = {
            html:filter[0].content,
            title:filter[0].name,
            pageName:filter[0].route
        };
        res.render("edit",{errors,values});
    }
    else{
        
        console.log("Running else for edit.post");
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
        
        imageName=checkImage(image,errors);
        
    }
    else{
        errors.push("Please upload an image");
    }
    
    console.log(pageName)
    //This prevents weird things happening with spaces in urls
    pageName = pageName.replaceAll(' ','-').toLowerCase();
    
    //We don't want someone trying to create a page that is predefined (like 'edit','login',etc)
    //Those values will change as I add more features to the site
    for(const page of reservedNames){
        if(pageName.toLowerCase() == page){
            errors.push(`Page name '${page}' is a reserved name`);
        }
    }
    Page.findOne({route:pageName.toLowerCase()}).then((page)=>{
        if(page){
            errors.push("A page with that name already exists");
        }
        else{
            if(errors.length>0){
                values = {
                    html:html,
                    title:title,
                    pageName:pageName
                };
                res.render("add",{errors,values});
            }
            else{
                let newPage = {
                    html:html,
                    title:title,
                    route:pageName,
                    imageName:imageName
                };
                let addedPage = new Page(newPage);
                addedPage.save().then(()=>{
                    console.log("Page added to db");
                });
                let confirmation = {confirm:true};
                res.render("add",{confirmation});
            }
        }
    }).catch((error)=>{
        console.log(`Error:${error}`);
    });

    //eventually a call to the db
    /*let filter = pages.filter(x=>x.route === pageName);
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
        let confirmation = {confirm:true};
        //res.render("add",{values});
        res.render("add",{confirmation});
    }*/
});
myApp.post('/login',(req,res)=>{
    if(req.session.admin==undefined){
        req.session.admin=false;
    }
    let user = req.body.username;
    let pass = req.body.password;

    let errors = [];
    Credentials.findOne({username:user,password:pass}).then((admin)=>{
        console.log(admin);
        if(admin){
            req.session.admin=true;
            res.redirect('/dashboard');
        }
        else{
            errors.push("Invalid username or password");
            res.render('login',{errors});
        }
    }).catch((err)=>{
        console.log(`Something went wrong: ${err}`);
    });
    
    
});
myApp.listen(port);
console.log("Server running");