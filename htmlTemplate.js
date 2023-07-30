"use strict";
function createHTMLPage(title,articleTitle,innerHTMLContent){
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="css/normalize.css">
        <link rel="stylesheet" href="css/styles.css">
    </head>
    <header>
    </header>
    <nav>
    </nav>
    <body>
        <h1>${articleTitle}</h1>
        <main>
            ${innerHTMLContent}
        </main>
    </body>
    <footer>
        <p>&copy; Copyright 2023. Jeffrey Smith</p>
    </footer>
    </html>`;
}
module.exports = {createHTMLPage};