"use strict";
function createHTMLPage(title,articleTitle,innerHTMLContent,image,navbar,admin){
    let logInOrOut = '<div><a href="/login"><p>Login</p></a></div>';
    if(admin){
        logInOrOut = '<div><a href="/dashboard">Dashboard</a> &nbsp;<a href="/logout"><p>Logout</p></a></div>';
    }
    //Funny bug here: js inserts implicit ';' which means that if you put the '`' on the next line, it returns nothing
    //Thanks JavaScript. That's definitely what I had in mind
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" type="text/css" href="/css/normalize.css">
        <link rel="stylesheet" type="text/css" href="/css/styles.css">
    </head>
    
    <body>
        
        <header>
            <!-- Logo generated by Hatchful/Shopify -->
            <div><a href="/" title="home"><img src='/images/logo.png'></a></div>
            <div><h2>SimpleCMS</h2></div>
            ${logInOrOut}
        </header>
        <nav>
            ${navbar}
        </nav>
        <div class="container">
            <h1>${articleTitle}</h1>
            <img class="hero-image" src="/images/${image}" alt="Hero image here">
            
            <main>
                ${innerHTMLContent}
            </main>
        </div>
        <footer>
            <p>&copy; Copyright 2023. Jeffrey Smith</p>
        </footer>
    </body>
    
    </html>`;
}
function createNav(pages){
    let navBar = "";
    let index = pages.indexOf("home");
    //This way, the special page 'home' always shows up first. But only if home actually exists
    if (index!=-1){
        pages.splice(index,1);
        pages.unshift("home")
    }
    for(const page of pages){
        //Uppercase the first letter of each page. Looks a little better
        let pageName = page[0].toUpperCase()+page.slice(1);
        //Nicer to read. The dashes are a bit of an eyesore
        navBar+=`<a href="${page}">${pageName.replaceAll('-',' ')}</a>`;
    }
    return navBar;
}
module.exports = {createHTMLPage,createNav};