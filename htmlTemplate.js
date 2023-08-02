"use strict";
function createHTMLPage(title,articleTitle,innerHTMLContent,image,navbar){
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
    for(const page of pages){
        navBar+=`<a href="${page.route}">${page.route}</a>`;
    }
    console.log(navBar);
    return navBar;
}
module.exports = {createHTMLPage,createNav};