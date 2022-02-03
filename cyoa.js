
let storyReference;
let dataJSON;
/**
 * When the page's DOM is loaded, this function will get the name of the JSON file by first looking 
 * up the textual value of 'post-src' and making a relative URL reference to it with .json appended 
 * to the end.
 */
window.addEventListener('DOMContentLoaded', (event) => {
    // function getStoryRef() {
    const storyRef = document.getElementById('post-src');
    console.log(storyRef);
    if (!storyRef) {
        alert('Error! The post-src title is not defined!');
    }

    const title = parseString(storyRef.innerText);
    console.log(title);
    storyReference = "./" + title + ".json";
    console.log(storyReference);
});

/**
 * @event onclick from buttons the user can interact with
 * @param {Number} passage The id of the passage to show
 */
function goto(passage) {
    console.log('clicked me');
    const passageId = parseInt(passage);
    console.log(passageId);
    const passageText = getJSONObject(storyReference, passageId);
};

/**
 * 
 * @param {String} url The url of the JSON file
 * @param {Number} id The id of the passage
 */
function getJSONObject(url, id) {
    fetch(url)
        .then(response => response.json())
        .then(dataJSON => {
            console.log(dataJSON);

            const literature = dataJSON['story'];
            let passageText;
            let options;
            for (let i = 0; i < literature.length; i++) {
                if (literature[i]['id'] == id) {
                    // console.log(literature[i]['text']);
                    passageText = literature[i]['text'];
                    options = literature[i]['options'];
                }
            }
            console.log("passage text" + passageText);

            const content = document.getElementById('cyoa');
            content.innerHTML = '';

            for (let i = 0; i < passageText.length; i++) {
                // You gave an unformatted passage, will automatically parse all the data
                if (passageText[i][0] != '<') {
                    const p = document.createElement('p');
                    const node = document.createTextNode(passageText[i]);
                    p.appendChild(node);
                    content.appendChild(p);
                } else {
                    // Your programmer knew how to style the entire passage! Form the story!
                    content.innerHTML = content.innerHTML + passageText[i];
                }
            }

            // console.log("options" + options);
            // console.log("options", options[0]);
            if (options) {
                console.log('yes');
                // const options = literature['options'];
                for (let i = 0; i < options.length; i++) {
                    const button = document.createElement('button');

                    button.addEventListener('click', () => {
                        goto(parseInt(options[i]['to']));
                    });

                    const text = parseString(options[i]['text']);
                    button.innerText = text;
                    content.appendChild(button);
                }
            }

            return passageText;
        });
}

/**
 * SECURITY: IN REPLACE OF EVAL() FOR ANY REFERENCED STRINGS
 * @param {Object} obj 
 * @returns {String} A safely-parsed string 
 */
function parseString(obj) {
    console.log(obj);
    return Function('"use strict";return ("' + obj + '")')();
}