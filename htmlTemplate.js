"use strict";
function createHTMLPage(title,articleTitle,innerHTMLContent,image,navbar,admin){
    let logInOrOut = '<a href="/login"><p>Login</p></a>';
    if(admin){
        logInOrOut = '<a href="/logout"><p>Logout</p></a>';
    }
    
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
            
            <div><a href="/" title="home"><img src='https://placekitten.com/100/100'></a></div>
            <div><h2>My website</h2></div>
            ${logInOrOut}
        </header>
        <nav>
            ${navbar}
        </nav>
        <div class="container">
            <img class="hero-image" src="/images/${image}" alt="Hero image here">
            <h1>${articleTitle}</h1>
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
    console.log('Pages is '+pages+' before we try making the navbar') ;
    for(const page of pages){
        console.log('Route: '+page);
        navBar+=`<a href="${page}">${page}</a>`;
    }
    console.log('Navbar is: '+navBar);
    return navBar;
}
module.exports = {createHTMLPage,createNav};