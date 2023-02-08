window.addEventListener('DOMContentLoaded', function () {
    timeAgo();
});

/**
 * Generates the time ago from when the post was published in a 
 * "x seconds/minutes/hours/days/weeks/months/years ago" format.
 * 
 * @param {Date}  pubDate Static binding to the Missed Connections post
 * @returns 
 */
function timeAgo() {
    const AGO = [
        { div: 60, name: 'seconds' },
        { div: 60, name: 'minutes' },
        { div: 24, name: 'hours' },
        { div: 7, name: 'days' },
        { div: 4.345, name: 'weeks' },
        { div: 12, name: 'months'},
        { div: Number.POSITIVE_INFINITY, name: 'years' }
    ]
    const timeSince = document.getElementById('missed-connections-date');
    const pubDate = new Date('2023-02-08 02:50:00 +0000');
    let diff = (pubDate - new Date()) / 1000;

    for (let i = 0; i < AGO.length; i++) {
        const division = AGO[i];
        if (Math.abs(diff) < division.div) {
            let timeAgo = new Intl.RelativeTimeFormat('en', { numeric: 'auto'});
            timeSince.innerText = timeAgo.format(Math.round(diff), division.name);
            return 0;
        }
        diff /= division.div;
    } 
}

/**
 * Executes the story when the button is clicked.
 */
function beginStory() {
    document.getElementById('begin').remove();
    story();
}

/**
 * Builds the story in sequential function calls.
 * To sequentially run the animation, each function must wait on Promises to be resolved.
 * Then the next function is able to execute to modify that part of the story.
 * @returns 0 on success
 */
async function story() {
    const one    = await writeTextChar(1, 20);
    const two    = await writeTextChar(2, 100);
    const del1   = await delTextChar(1, 80);
    // const del0   = await delTextWord(1, 500);
    // const del3   = await delTextChar(2, 20);
    const three  = await writeTextChar(3, 10);
    const four   = await writeTextChar(4, 20);
    const five   = await writeTextChar(5, 25);
    const six    = await writeTextChar(6, 30);
    const seven  = await writeTextChar(7, 10);
    const eight  = await writeTextChar(8, 10);
    const nine   = await writeTextChar(9, 20);
    const ten    = await writeTextChar(10, 20);
    const eleven = await writeTextChar(11, 20);
    return 0;
}

/**
 * Writes the target text character by character
 * @param {int} id    The id of the text area to write
 * @param {int} rate  The speed in milliseconds that characters are written
 * @returns {Promise} Announces the function has finished writing the targeted text 
 */
function writeTextChar(id, rate) {
    return new Promise((resolve) => {
        // Get the parent block to append the target HTML element to
        let outBlock;
        const ref = document.getElementById(id);

        // If this is a paragraph, the parent block is the output container
        if (ref.parentElement.id.includes('ref-text')) {
            outBlock = document.getElementById('output-text');
            const elem = document.createElement(ref.nodeName);
            elem.id = id + ref.nodeName;
            outBlock.append(elem);
            outBlock = elem;
        }
        else // If this is a line inside a paragraph, the parent is defined in the original story
        {
            let refId = ref.parentElement.id;
            refId = parseInt(refId.match(/\d/g));
            outBlock = document.getElementById(refId + ref.parentElement.nodeName);
            // Paragraph does not exist, create the block
            if (outBlock == null) {
                const elem = document.createElement(ref.parentElement.nodeName);
                elem.id = refId + ref.parentElement.nodeName;
                document.getElementById('output-text').append(elem);
                outBlock = elem;
            }
        }

        // The target text is wrapped in its own reference if it must be modified later
        let outWrap = document.createElement(ref.nodeName);
        outWrap.id = id + 'o';
        outBlock.append(outWrap);
        let refText = ref.innerHTML;

        let i = 0;
        let outStream = window.setInterval(function () {
            const input = { text: refText, i: i }
            const update = checkTag.call(input);

            outWrap.innerHTML += update.nextText;
            i += update.inc;

            if (i >= refText.length) {
                clearInterval(outStream);
                return resolve(id);
            }
        }, rate);
    });
};

/**
 * Check the target's innerHTML for any HTML tags to generate 
 * @param {Object} input The target text and current index
 * @returns {Object} The next text and new index to change
 */
function checkTag(input) {
    let tag = this.text.substring(this.i, this.i + 3);
    let appendText = this.text[this.i];
    let inc = 1;
    switch (tag) {
        case '<p>':
            appendText = "<p>";
            inc = 3;
            break;
        case '</p':
            appendText = "</p>";
            inc = 4;
            break;

        case '<br':
            appendText = "<br/>";
            inc = 5;
            break;
        default:
            break;
    }
    const update = { nextText: appendText, inc: inc };
    return update;
};

/**
 * Starting from the end, deletes the written output text character by character 
 * @param {int} id    The id of the target text area to delete
 * @param {int} rate  The speed in milliseconds that characters are deleted
 * @returns {Promise} Announces the function has finished deleting the targeted text 
 */
function delTextChar(id, rate) {
    return new Promise((resolve) => {
        const outText = document.getElementById(id + 'o');
        const text = document.getElementById(id).innerText;
    
        let i = text.length;
        const outStream = window.setInterval(function () {
            const l = text.substring(0, i - 1);
            // Keeping the text afterwards is required to keep any HTML elements (<br> tags) 
            // at the end before the element is fully removed when iteration terminates
            const r = outText.innerHTML.substring(i); 
            outText.innerHTML = l + r;

            i -= 1;
            if (i < 0) {
                clearInterval(outStream);
                outText.remove();
                return resolve(id);
            }
        }, rate);
    })
}

/**
 * Starting from the end, deletes the written output text word by word
 * @param {int} id    The id of the target text area to delete
 * @param {int} rate  The speed in milliseconds that characters are deleted
 * @returns {Promise} Announces the function has finished deleting the targeted text 
 */
function delTextWord(id, rate) {
    return new Promise((resolve) => {
        const outText = document.getElementById(id + 'o');
        const text = document.getElementById(id);

        console.log(text.innerHTML);
        console.log(text.childNodes);
        
        let textWords = [];
        text.childNodes.forEach(element => {
            if (element.nodeType == 3) {
                console.log(element.textContent);
                textWords = textWords.concat(element.textContent.split(' '));
            } else {
                console.log(element.outerHTML)
                const eName = element.nodeName
                textWords.push('<' + eName + '>');
                textWords = textWords.concat(element.innerText.split(' '));
                if (!element.nodeName.includes('BR')) {
                    textWords.push('</' + eName + '>');
                }
            }
        });

        console.log(textWords);
        let i = textWords.length;
        const outStream = window.setInterval(function () {
            if (!textWords[i] || textWords[i].startsWith("<")) {
                i -= 1;
            } else {
                outText.innerHTML = textWords.splice(i, 1).join(' ');
            }
            
            if (i < 0) {
                clearInterval(outStream);
                outText.remove();
                return resolve(id);
            }
        }, rate);
    })
}