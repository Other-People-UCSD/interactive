/*
localStorage
eOpen
progress
routesVisited
*/

var dataJSON;
var literature;
var hist;
var routesVisited; // 0 = Never visited, 1 = Partially visited, 2 = All routes after have been visited
const startId = 23;
var passageEvents = {
    'passage': [
        { 'id': 1, 'vars': [{ 'action': 'set', 'target': 'eOpen', 'val': 'true' }] },
        { 'id': 23, 'vars': [{ 'action': 'appendRoute', 'id': '23a', 'val': 'eOpen'}] },
        // {'id': 35, 'vars': ["madeStory"]},
        // {'id': 61, 'vars': ["madeStory"]},
    ]
};

/**
 * Check if the passage has events to handle.
 * @param {Number} toId 
 * @returns 
 */
function checkEvents(toId) {
    const passage = passageEvents['passage'];
    for (let i = 0, len = passage.length; i < len; i++) {
        if (passage[i]['id'] === toId) {            
            const pVars = Object.values(passage[i]['vars']);
            checkActions(pVars);
            return;
        }
    }
}

/**
 * Runs each action event the passage contains.
 * @param {Array} pVars 
 */
function checkActions(pVars) {
    for (let i = 0, len = pVars.length; i < len; i++) {
        const query = pVars[i];
        console.log(query);
        if (query['action'] === 'set') {
            setVar(query['target'], query['val']);
        } else if (query['action'] === 'show') {
            if (checkVar(query['id'], query['val'], query['cond'])) { showParagraph(query['id']); }
        } else if (query['action'] === 'appendRoute') {
            if (checkVar(query['id'], query['val'], query['cond'])) { appendRoute(query['id']);}
        }
    }
}

/**
 * Sets the value of a variable in local storage.
 * @param {String} varName 
 * @param {String} value 
 */
function setVar(varName, value) {
    window.localStorage.setItem(varName, value);
}

/**
 * Checks if the event action variable's condition is satisfied to show a paragraph in a passage.
 * By default, the condition is true.
 * @param {Number} targetId 
 * @param {String} varName 
 * @param {Boolean} cond 
 */
function checkVar(targetId, varName, cond=true) {
    const mainReached = window.localStorage.getItem(varName);
    return JSON.parse(mainReached) === JSON.parse(cond);
}

/**
 * Get the passage's data specified by its id. 
 * @param {Number} id 
 * @returns {Array, Array} The text and options array from the JSON file. 
 */
function getPassageById(id) {
    for (let i = Math.max(0, id-10), len = id+5; i < len; i++) {
        if (literature[i]['id'] == id) {
            return {
                passageText: literature[i]['text'],
                options: literature[i]['options']
            };
        }
    }
}

/**
 * Writes the passage that was selected by the option.
 */
function writePassage(fromId, toId) {
    // let passageText;
    // let options;
    
    const {passageText,options} = getPassageById(toId);
    // console.log("passage text:", passageText.length, passageText);

    const content = document.getElementById('output-text');

    // content.innerHTML = ''; // Uncomment this line to clear the webpage's past info
    content.innerHTML += toId;

    // For each paragraph in the passage
    for (let parIdx = 0, len = passageText.length; parIdx < len; parIdx++) {
        // You gave an unformatted passage, will automatically parse all the data

        if (passageText[parIdx][0] != '<' && passageText[parIdx][-1] != '>') {
            // console.log('Non-HTML format!');
            const p = document.createElement('p');
            const node = document.createTextNode(passageText[parIdx]);
            p.appendChild(node);
            content.appendChild(p);
        } else {
            // The passage is in HTML format! Form this paragraph!
            // Intended for paragraphs that have buttons for the user to press
            // console.log('HTML format!');
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

    checkEvents(toId);
    
    if (hist.length > 0) {
        const backBtn = document.createElement('button');
        backBtn.addEventListener('click', () => {
            goBack();
        });
        backBtn.innerText = 'Back'; 
        backBtn.classList.add('backBtn');
        content.appendChild(backBtn)    
    }

    return passageText;
}

/**
 * Attaches the next route choices to the bottom of the passage.
 * @param {Array} options 
 * @param {Number} fromId 
 */
function createOptions(options, fromId) {
    const content = document.getElementById('output-text');
    const optionList = document.createElement('ol');
    optionList.id = 'option-list';
    count = options.length;

    for (let i = 0, len = options.length; i < len; i++) {
        const optionItem = document.createElement('li');
        const optionBtn = document.createElement('button');

        let toOpId = parseInt(options[i]['to']);
        // console.log('f:', fromId, 't:', toOpId);
        optionBtn.addEventListener('click', () => {
            showChoiceClicked(optionBtn);
            updateVisitedState(toOpId);
            goto(fromId, toOpId);
        });

        const text = parseString(options[i]['text']);
        optionBtn.innerText = parseString(text);
        
        // If the "back to start" route is an option, it is a route
        if (toOpId === startId) {
            count--;
        }
        if (routesVisited[toOpId-1] == 2) {
            optionBtn.classList.add('route-fully-visited');
            count--;
        } else if (routesVisited[toOpId-1] == 1) {
            optionBtn.classList.add('route-partial');
        } else {
            optionBtn.classList.add('route-not-visited');
        }

        optionItem.appendChild(optionBtn);
        optionList.appendChild(optionItem);
    }

    // End of route or all the routes have been completely visited
    if (count === 0) {
        routesVisited[fromId-1] = 2;
        bubbleVisited();
        window.localStorage.setItem('routesVisited', JSON.stringify(routesVisited));
    }

    content.appendChild(optionList);
}

/**
 * Changes the visited state of the option taken
 * @param {Number} id 
 */
function updateVisitedState(id) {
    let state = routesVisited[id-1];
    if (state == 0) {
        routesVisited[id-1] = 1;
        window.localStorage.setItem('routesVisited', JSON.stringify(routesVisited));

        let progressNum = parseInt(window.localStorage.getItem('progress'));
        console.log(progressNum)
        progressNum++;

        document.getElementById('progress-bar').style.width = (progressNum / literature.length * 100) + '%';
        
        document.getElementById('progress-text').innerText = progressNum + '/' + literature.length;
        window.localStorage.setItem('progress', JSON.stringify(progressNum));
    }

}

/**
 * 
 * @param {Array} options 
 */
function bubbleVisited() {
    let idx = hist.length - 1;
    let count;
    do {
        let id = hist[idx--];
        console.log('bubbling', id);
        const {_, options} = getPassageById(id);

        count = options.length;
        for (let i = 0, len = options.length; i < len; i++) {
            let toOpId = parseInt(options[i]['to']);
        
            // If the "back to start" route is an option, it is a route
            if (toOpId === startId) {
                count--;
            }
            if (routesVisited[toOpId-1] == 2) {
                count--;
            }
        }
        if (count == 0) {
            routesVisited[id-1] = 2;
        }
    } while(idx > 0 && count == 0);
}

/**
 * Shows the next passage based on the id of the route
 * @event onclick from buttons the user can interact with
 * @param {Number} passage The id of the passage to show
 */
function goto(fromId, toId, wentBack=false) {
    if (!wentBack) {
        hist.push(toId);
    }
    console.log('history: ', hist, wentBack);
    removePrevChoices();
    return writePassage(fromId, parseInt(toId));
};

/**
 * Returns to the previous passage(s) and its routes.
 */
function goBack() {
    let fromHere = hist.pop();
    let peekNext;
    if (hist.length == 0) {
        peekNext = startId;
    } else {
        peekNext = hist.at(-1);
    }    

    // console.log('goBack', hist, fromHere, peekNext);
    goto(fromHere, peekNext, true);
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
 * Adds another route to the list of options the user can take.
 * This is used when a route is dependent on a condition the reader must satisfy.
 * @param {Number} id 
 */
function appendRoute(id) {
    const routes = document.getElementById('option-list');
    const routeBtn = document.getElementById(id);
    const optionItem = document.createElement('li');
    const numericId = id.match(/\d+/);
    routeBtn.addEventListener('click', () => {
        showChoiceClicked(routeBtn);
        updateVisitedState(routeBtn.value);
        goto(numericId, routeBtn.value);
    });

    if (routesVisited[routeBtn.value-1] == 2) {
        routeBtn.classList.add('route-fully-visited');
    } else if (routesVisited[routeBtn.value-1] == 1) {
        routeBtn.classList.add('route-partial');
    } else {
        routeBtn.classList.add('route-not-visited');
    }

    routeBtn.classList.remove('hidden');
    optionItem.appendChild(routeBtn);
    routes.appendChild(optionItem);
}


/**
 * Buttons could be meaningful in some passages.
 * If keeping the text after selecting a route, removes the buttons in the story.
 * This is necessary to ensure that there is only one copy of an id on the webpage 
 * in the event the passage is encountered again.
 * 
 * The only button that should be kept
 */
function removePrevChoices() {
    const content = document.getElementById('output-text');
    ol = content.querySelectorAll('ol');
    for (let i = 0, len = ol.length; i < len; i++) {
        ol[i].remove();
    }

    btns = content.querySelectorAll('button');
    for (let i = 0, len = btns.length; i < len; i++) {
        btns[i].remove();
    }
}

/**
 * When the page's DOM is loaded, this function will get the name of the JSON file by first looking 
 * up the textual value of 'post-src' and making a relative URL reference to it with .json appended 
 * to the end.
 */
window.addEventListener('DOMContentLoaded', () => {
    const storyRef = document.getElementById('story-ref');

    if (!storyRef) {
        alert('Error! The story-ref block is not defined!');
    }

    const title = parseString(storyRef.innerText);
    console.log(title);
    const storyReference = "./" + title + ".json";
    beginStory(storyReference);
});

/**
 * When the webpage is loaded, show the first passage of the story.
 * Initialize global variables and store the JSON data.
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
            // console.log(dataJSON);

            
            const progress = document.getElementById('progress-text');
            let progressCleared = window.localStorage.getItem('progress');
            if (progressCleared === 'null' || progressCleared === null) {
                progressCleared = 0;
                window.localStorage.setItem('progress', JSON.stringify(progressCleared));
                
            }
            let progressNum = parseInt(window.localStorage.getItem('progress'));
            document.getElementById('progress-bar').style.width = (progressNum / literature.length * 100) + '%';
            progress.innerText = progressCleared + '/' + literature.length;

            // Convert to local storage array using localstorage = JSON.stringify(routesVisited) and JSON.parse(localStorage)
            
            routesVisited = JSON.parse(window.localStorage.getItem('routesVisited'));
            if (routesVisited === 'null' || routesVisited === null) {
                routesVisited = [];
                for (let i = 0, len = literature.length; i < len; i++) {
                    routesVisited.push(0);
                }
            }

            allChildRoutesVisited = [];

            writePassage(null, startId);
        });
}

/**
 * Debugging function to display the text of the route clicked on.
 * @param {Element} optionBtn 
 */
function showChoiceClicked(optionBtn) {
        const textChoice = document.createElement('strong');
        textChoice.innerHTML= '<br/>' + optionBtn.innerText + '->';
        document.getElementById('output-text').append(textChoice);
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

/**
 * Not used, meant to perform a 'redo' instead of 'back'.
 * @param {Number} btnId 
 * @param {Number} targetId 
 * @param {Boolean} remove 
 */
function nextPara(btnId, targetId, remove=true) {
    const btn = document.getElementById(btnId);
    console.log(btnId, targetId);
    showParagraph(targetId);

    if (remove) {
        btn.remove();
    }

}