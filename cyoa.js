var storyReference;
var dataJSON;
var literature;
var hist;
const startId = 1;
/**
 * When the page's DOM is loaded, this function will get the name of the JSON file by first looking 
 * up the textual value of 'post-src' and making a relative URL reference to it with .json appended 
 * to the end.
 */
window.addEventListener('DOMContentLoaded', (event) => {
    const storyRef = document.getElementById('story-ref');
    console.log(storyRef);
    if (!storyRef) {
        alert('Error! The story-ref block is not defined!');
    }

    const title = parseString(storyRef.innerText);
    console.log(title);
    storyReference = "./" + title + ".json";
    console.log(storyReference);
    beginStory(storyReference);
});

/**
 * 
 * @param {String} url The url of the JSON file
 * @param {Number} targetId The id of the passage
 */
function beginStory(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            dataJSON = data;
            literature = dataJSON['story'];
            hist = [];
            console.log(dataJSON);
            writePassage(null, startId);
        });
}

function writePassage(fromId, toId) {
    let passageText;
    let options;
    
    console.log(hist);

    for (let i = 0; i < literature.length; i++) {
        if (literature[i]['id'] == toId) {
            // console.log(literature[i]['text']);
            passageText = literature[i]['text'];
            options = literature[i]['options'];
        }
    }
    // console.log("passage text:", passageText.length, passageText);

    const content = document.getElementById('output-text');
    // content.innerHTML = '';
    content.innerHTML += toId;

    // For each paragraph in the passage
    for (let parIdx = 0, len = passageText.length; parIdx < len; parIdx++) {
        // You gave an unformatted passage, will automatically parse all the data

        if (passageText[parIdx][0] != '<' && passageText[parIdx][-1] != '>') {
            console.log('Non-HTML format!');
            const p = document.createElement('p');
            const node = document.createTextNode(passageText[parIdx]);
            p.appendChild(node);
            content.appendChild(p);
        } else {
            // The passage is in HTML format! Form this paragraph!
            // Intended for paragraphs that have buttons for the user to press
            console.log('HTML format!');
            const template = document.createElement('template');
            template.innerHTML = passageText[parIdx].trim();

            parHTML = template.content.firstChild;
            content.appendChild(parHTML);

            console.log(parHTML)
        }
    }

    if (options) {
        createOptions(options, toId);
    }

    if (hist.length > 0) {
        const backBtn = document.createElement('button');
        backBtn.addEventListener('click', () => {
            goBack();
        });
        backBtn.innerText = 'Back'; 
        content.appendChild(backBtn)    
    }

    return passageText;
}

function createOptions(options, fromId) {
    const content = document.getElementById('output-text');
    const optionList = document.createElement('ol');

    for (let i = 0; i < options.length; i++) {
        const optionItem = document.createElement('li');
        const optionBtn = document.createElement('button');

        // console.log('f:', fromId, 't:', parseInt(options[i]['to']));
        optionBtn.addEventListener('click', () => {
            
            // Debug 
            const textChoice = document.createElement('strong');
            textChoice.innerHTML= '<br/>' + optionBtn.innerText + '->';
            console.log(textChoice)
            document.getElementById('output-text').append(textChoice);
            
            goto(fromId, parseInt(options[i]['to']));
        });

        const text = parseString(options[i]['text']);
        optionBtn.innerText = parseString(text);

        optionItem.appendChild(optionBtn);
        optionList.appendChild(optionItem);

    }
    content.appendChild(optionList);
}

/**
 * @event onclick from buttons the user can interact with
 * @param {Number} passage The id of the passage to show
 */
function goto(fromId, toId, wentBack=false) {
    if (!wentBack) {
        hist.push(toId);
    }
    console.log('goto', hist, wentBack);
    return writePassage(fromId, parseInt(toId));
};

/**
 * 
 */
function goBack() {
    let fromHere = hist.pop();
    let peekNext;
    if (hist.length == 0) {
        peekNext = startId;
    } else {
        peekNext = hist.at(-1);
    }    

    console.log('goBack', hist, fromHere, peekNext);
    goto(fromHere, peekNext, true);
}

function something(targetId, route) {
    const mainReached = window.localStorage.getItem('theo-main-story');
    if (JSON.parse(mainReached) === route) {
        showParagraph(targetId);
    }
}


/**
 * Removes the button 
 */
function nextPara(btnId, targetId, remove=true) {
    const btn = document.getElementById(btnId);
    console.log(btnId, targetId);
    showParagraph(targetId);

    if (remove) {
        btn.remove();
    }

}
/**
 * Removes the hidden class on the target paragraph.
 * @param {String} id The id of the target paragraph to show within the same passage. 
 *                    May or may not be a number.
 */
function showParagraph(id) {
    const target = document.getElementById(id);
    target.classList.remove('hidden');
}
/**
 * SECURITY: IN REPLACE OF EVAL() FOR ANY REFERENCED STRINGS
 * @param {Object} obj 
 * @returns {String} A safely-parsed string 
 */
function parseString(obj) {
    return Function('"use strict";return ("' + obj + '")')();
}


/**
 * Not used
 * @param {String} id 
 */
function addBtnFunction(id) {
    eventBtn = document.getElementById(id);
    const offset = 'onclick=("';
    const funcIdx = eventBtn.outerHTML.indexOf(offset);
    let func = eventBtn.outerHTML.substring(funcIdx+offset.length).split(')\">')[0];
    console.log(func);
    eventBtn.addEventListener('click', () => {
        nextPara(id, id+'to');
    });
}