"use strict";
function createHTMLPage(title,articleTitle,innerHTMLContent){
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
        </nav>
        <div class="container">
            <img class="hero-image" src="imagePath" alt="Hero image here">
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
module.exports = {createHTMLPage};