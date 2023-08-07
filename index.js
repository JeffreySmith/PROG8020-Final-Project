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

//This is here because I realized that if you ran it, you would be unable to login if the credentials document didn't exist
//This sets a default name and password. You can actually change the password in the database, and it will work with that
//new password



Credentials.findOne({username:'admin'}).then((admin)=>{
    if(!admin){
        let info = {
            username:'admin',
            password:'admin'
        };
        let Admin = new Credentials(info);
        Admin.save().then(()=>{
            console.log("Credentials set in db");
        });
    }
    else{
        console.log("Admin account already exists");
    }

});

myApp.set("view engine", "ejs");
myApp.use(express.urlencoded({ extended: true }));
myApp.set("views",path.join(__dirname, "views"));
myApp.use(express.static(__dirname + "/public"));
myApp.use(upload());

const reservedNames = ["edit","login","logout","dashboard","add"];

//This modifies errors, which is an array. Since it's pass by reference, this works
function checkImage(image,errors){
    let imageName="";
    if(image){
        imageName = image.name;
        let mimeType = image.mimetype;
        //Check that the file is an image
        if(/^image/.test(mimeType)){
            //console.log(`${imageName} is an image`);
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
    //Make sure that req.session exists. We'll do this a few more times
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    res.redirect('/home');
});
myApp.get("/login",(req,res)=>{
    if(req.session.loggingOut==undefined){
        req.session.loggingOut = false;
    }
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    if(req.session.admin!=undefined && req.session.admin){
        res.redirect('dashboard');
    }
    else{
        //If we're actually logging out, set a message saying we've been logged out successfully
        if(req.session.loggingOut){
            req.session.loggingOut = false;
            let message = "You've succesfully logged out!";
            res.render('login',{message});
        }
        else{
            res.render('login');
        }

    }
    
});
myApp.get("/logout",(req,res)=>{
    if(req.session.admin){
        req.session.loggingOut = true;
    }
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

    if(req.session.admin!=undefined && req.session.admin){
        //go through all of the pages so we can pass it to 'dashboard'
        Page.find({}).then((page)=>{
            
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
    //toLowerCase() is here to make sure things are all in lowercase. I'm going to do this a lot
    name = name.toLowerCase();
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    console.log(`/edit/${name}`);


    if(req.session.admin){
        Page.findOne({route:name}).then((page)=>{
            if(page){
                console.log(`Found page ${page.route}`);
                let values = {
                    html:page.html,
                    title:page.title,
                    pageName:page.route
                };
                console.log(values);
                res.render('edit',{values});
            }
            else{
                res.redirect('/dashboard');
            }
            
            
        });
    }
    else{
        res.redirect('/login');
    }
    
});
myApp.get("/delete/:name/",(req,res)=>{
    if(req.session.admin==undefined){
        req.session.admin = false;
    }
    let errors= [];
    if(!req.session.admin){
        errors.push("You don't have permisson to do this. Please login");
        res.redirect('/login');
        return;
    }
    let name = req.params.name;
    name = name.toLowerCase();
    Page.findOneAndDelete({route:name}).then((page)=>{
        if(page && errors.length===0){
            console.log(`Page ${name} deleted`);
            let confirmation = {
                confirm:true,
                name:name
            }
            res.render('delete',{confirmation});
        }
        
        else{
            //Go back to the login page
            res.redirect('/login');
            console.log(`Page ${name} not found`);
        }
        
    });
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
        //Get all pages
        for(let p of navPage){
            pages.push(p.route);
        }
        //look for a page that exists
        Page.findOne({route:name.toLowerCase()}).then((page)=>{
        
            if(page){
                //generate the page
                let nav = createNav(pages);
                let html = createHTMLPage(page.title,page.title,page.html,page.imageName,nav,req.session.admin);
                res.send(html);
            }
            else{
                Page.findOne({route:'home'}).then((homePage)=>{
                    //if there's a 'home' page
                    if(homePage){
                        res.redirect('/home');
                    }
                    //if there isn't 
                    //This will go to 'login' if the user isn't logged in as admin
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
});


myApp.post("/edit",(req,res)=>{
    let html=req.body.htmlcontent;
    let title = req.body.articleTitle;
    let image = "";
    let imageName = "";
    let pageName = req.body.pagename;
    pageName = pageName.toLowerCase();
    const errors = [];
    if(!req.session.admin){
        //This mostly happens if you've already logged out in another page, or have restarted the server
        errors.push("You don't have permission to do this. Please login.");
    }
    if(req.files){
        image = req.files.Image;
        imageName=checkImage(image,errors);
    }
    
    let values={};
    if(errors.length===0){
        
        Page.findOne({route:pageName}).then((p)=>{
            if(p && imageName == ""){
                imageName = p.imageName;
            }
            if(p){
                //I couldn't figure out how to find something correctly and update it using a different column than _id, so I ended
                //up having to nest calls to the db
                Page.findByIdAndUpdate({_id:p._id}).then((page)=>{
                    page.html = html,
                    page.title = title,
                    page.imageName = imageName;
                    page.save();
                    //This tells 'edit' that the page has been saved
                    let confirmation = {confirm:true};
                    res.render('edit',{confirmation});
                }).catch((error)=>{
                    console.log(`Error:${error}`);
                });
            }
            
        });  
    }
    else{
        //Something wasn't valid, fill the values back in
        let values = {
            html:html,
            title:title,
            pageName:pageName
        };
        res.render('edit',{values,errors});
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
    if(!req.session.admin){
        errors.push("You don't have permission to do this. Please login");
    }
    if(pageName.includes('/')){
        errors.push("Please don't put a '/' in the page name");
    }

    if(req.files ){
        console.log(req.files);
        let image = req.files.Image;
        
        imageName=checkImage(image,errors);
        
    }
    else{
        //In here, an image is required, unlike in 'edit'
        errors.push("Please upload an image");
    }
    
    console.log(pageName)
    //This prevents weird things happening with spaces in urls
    pageName = pageName.trim();
    pageName = pageName.replaceAll(' ','-').toLowerCase();
    pageName = pageName.toLowerCase();
    //We don't want someone trying to create a page that is predefined (like 'edit','login',etc)
    //Those values will change as I add more features to the site
    for(const page of reservedNames){
        if(pageName == page){
            errors.push(`Page name '${page}' is a reserved name`);
        }
    }
    Page.findOne({route:pageName}).then((page)=>{
        if(page){
            //if it exists, don't just overwrite it. If you want to change it, you have to go to edit.
            errors.push("A page with that name already exists");
            let values = {
                html:html,
                title:title,
                pageName:pageName
            };
            res.render("add",{errors,values});
        }
        else{
            //reload the page and render the errors
            if(errors.length>0){
                let values = {
                    html:html,
                    title:title,
                    pageName:pageName
                };
                res.render("add",{errors,values});
            }
            else{
                //Hooray, no errors, and the page doesn't exist already!
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
                //Hey, page has been saved!
                let confirmation = {confirm:true};
                res.render("add",{confirmation});
            }
        }
    }).catch((error)=>{
        console.log(`Error:${error}`);
    });
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
        //Username and password are correct!
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
console.log("Server running: http://localhost:8080");