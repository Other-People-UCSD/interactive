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
    const shortPause = document.getElementById('shortPause').value;         // 1000*1;
    const longPause =  document.getElementById('longPause').value;         // 1000*3;
    const normalType = document.getElementById('normal').value;         // 60;
    const slowType =   document.getElementById('slow').value;         // normalType*2;
    const slowerType = document.getElementById('slower').value;         // normalType*4;


    const w1    = await writeTextChar(1, normalType, shortPause);
    const w2    = await writeTextChar(2, normalType, longPause);
    const w3    = await writeTextChar(3, normalType, shortPause);

    const w21   = await writeTextChar(21, slowType, shortPause);
    const d3    = await delTextChar(3, 50);
    const d2    = await delTextChar(2, 50);
    const d1    = await delTextChar(1, 50);
    const d21   = await delTextChar(21, 50, shortPause);
    
    const w31    = await writeTextChar(31, normalType, shortPause);
    const d31    = await delTextChar(31, 50, longPause);
    
    const w41    = await writeTextChar(41, slowType, shortPause);
    const w42    = await writeTextChar(42, normalType, shortPause);
    const w43    = await writeTextChar(43, normalType, longPause);
    const w44    = await writeTextChar(44, slowType, shortPause);
    
    const w51    = await writeTextChar(51, normalType, shortPause);
    const w52    = await writeTextChar(52, normalType);
    const w53    = await writeTextChar(53, slowerType, shortPause);
    const w54    = await writeTextChar(54, slowType);
    const w55    = await writeTextChar(55, normalType);

    const w61    = await writeTextChar(61, normalType, longPause);
    const w62    = await writeTextChar(62, normalType);

    const w71    = await writeTextChar(71, slowType, longPause);
    
    const w81    = await writeTextChar(81, slowType, shortPause);
    const w82    = await writeTextChar(82, normalType, longPause);
    const w83    = await writeTextChar(83, normalType, shortPause);
    const w84    = await writeTextChar(84, normalType, shortPause);
    const w85    = await writeTextChar(85, normalType);
    const w86    = await writeTextChar(86, slowerType);
    const w87    = await writeTextChar(87, normalType);
    const w88    = await writeTextChar(88, slowType, longPause);
    const w89    = await writeTextChar(89, normalType);

    const w91    = await writeTextChar(91, normalType, shortPause);
    const w92    = await writeTextChar(92, normalType, shortPause);
    const w93    = await writeTextChar(93, normalType);
    const w94    = await writeTextChar(94, slowType);
    const w95    = await writeTextChar(95, normalType, longPause);
    const w96    = await writeTextChar(96, normalType);

    const w101   = await writeTextChar(101, normalType);
    const w102   = await writeTextChar(102, slowerType);
    const w103   = await writeTextChar(103, normalType, shortPause);
    const w104   = await writeTextChar(104, normalType, shortPause);
    const w105   = await writeTextChar(105, normalType, shortPause);
    const w106   = await writeTextChar(106, normalType);
    const w107   = await writeTextChar(107, slowType, longPause);
    const w108   = await writeTextChar(108, slowType, shortPause);
    const w109   = await writeTextChar(109, slowType);

    const w111   = await writeTextChar(111, normalType, longPause);

    const delOut = await delPassage('output-text', longPause);

    const w121   = await writeTextChar(121, slowType. shortPause);
    const d121   = await delTextChar(121, slowerType, longPause);

    const final = document.getElementById('final');
    final.classList.remove('hidden');
    return 0;
}

/**
 * Writes the target text character by character
 * @param {int} id    The id of the text area to write
 * @param {int} rate  The speed in milliseconds that characters are written
 * @param {int} delay The delay, in milliseconds, before the function finally ends
 * @returns {Promise} Announces the function has finished writing the targeted text 
 */
function writeTextChar(id, rate, delay) {
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
            refId = parseInt(refId.match(/\d+/g));
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
                setTimeout(() => { return resolve(id)}, delay);
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
function delTextChar(id, rate, delay) {
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
                const outParent = outText.parentElement;
                outText.remove();
                console.log(outParent.id);
                if (outParent.children.length == 0) {
                    outParent.remove();
                }
                setTimeout(() => { return resolve(id) }, delay);
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
    });
}

function delPassage(id, delay) {
    return new Promise((resolve) => {
        const passage = document.getElementById(id);
        passage.style.backgroundColor = '#ffb7b7';
        setTimeout(() => { 
            if (id == 'output-text') {
                passage.innerHTML = '';
                passage.style.backgroundColor = null;

            } else {
                passage.remove();
            }
            return resolve(id);
        }, delay);
    });
}

