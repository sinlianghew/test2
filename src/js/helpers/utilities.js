import $ from 'jquery'
const baseUrl = $('input[name=tieBaseUrl]').val();

/**
 * Given an NRIC, return a Date object representing
 * the date of birth.
 * @param {String} nric 
 * @returns {Date}
 */
export function extractDOB(nric) {
    const today = new Date();

    const currentYYYY = today.getFullYear();
    const currentMM = today.getMonth();
    const currentDD = today.getDate();

    const yymmdd = nric.substring(0, 6);
    const year = yymmdd.substring(0, 2);
    const month = yymmdd.substring(2, 4);
    const date = yymmdd.substring(4, 6);
    const currentYY = currentYYYY.toString().substring(2, 4);
    let ageYearPrefix;

    if ((currentYY - year) < 0) {
        ageYearPrefix = 19;
    }
    else {
        if ((currentYY - year) == 0) {
            if ((currentMM - (month - 1)) < 0) {
                ageYearPrefix = 19;
            } else {
                if ((currentMM - (month - 1)) == 0) {
                    if ((currentDD - date) < 0) {
                        ageYearPrefix = 19;
                    } else {
                        ageYearPrefix = 20;
                    }
                } else {
                    ageYearPrefix = 20;
                }
            }
        } else {
            ageYearPrefix = 20;
        }
    }

    return new Date(ageYearPrefix + year, month - 1, date);
}

/**
 * Creates a dotCMS lucene query URL
 * @param {*} baseUrl
 * @param {*} structureName 
 * @param {*} queryObj 
 * @param {*} isLive
 * @returns {String}
 */
export function createDotCMSQueryURL(structureName, queryObj, isLive) {
    let endpoint = baseUrl + '/api/content/render/false/type/json/limit/0/query/+structureName:' + structureName;
    endpoint += '%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)';

    if (isLive) {
        endpoint += '%20'
    }
    let queryString = ''
    for (let key of Object.keys(queryObj)) {
        queryString += `%20+${structureName}.${key}:${queryObj[key]}`
    }

    return endpoint + queryString;
}

/**
 * Given a credit card number, detect the type of card.
 * Sample format: 'XXXX XXXX XXXX XXXX'
 * Returns 'MASTER' or 'VISA' or null
 * @param {String} creditCardNumber 
 * @returns {String}
 */
export function getCardType(creditCardNumber) {
    let cardNum = creditCardNumber.trim().replace(/\s/g, '')

    const patterns = {
        'MASTER': /^5[1-5][0-9]{14}$|^2(?:2(?:2[1-9]|[3-9][0-9])|[3-6][0-9][0-9]|7(?:[01][0-9]|20))[0-9]{12}$/,
        'VISA': /^4[0-9]{12}(?:[0-9]{3})?$/
    }

    let cardType = null;
    Object
        .keys(patterns)
        .forEach(key => {
            if (patterns[key].test(cardNum)) {
                cardType = key
            }
        })

    return cardType;
}

/**
 * Validates a credit card number according to the Luhn's algorithm
 * @param {String} value the credit card number
 */
export function checkLuhn(value) {
    // remove all non digit characters
    var value = value.replace(/\D/g, '');
    var sum = 0;
    var shouldDouble = false;
    // loop through values starting at the rightmost side
    for (var i = value.length - 1; i >= 0; i--) {
        var digit = parseInt(value.charAt(i));

        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) == 0;
}

/**
 * Native scrollTo with callback
 * @param offset - offset to scroll to
 */
export function scrollTo(offset) {
    return new Promise((resolve, reject) => {
        const onScroll = function () {
            if (window.pageYOffset <= offset + 1) {
                resolve()
                window.removeEventListener('scroll', onScroll)
            }
        }
        window.addEventListener('scroll', onScroll)
        onScroll()
        window.scrollTo({
            top: offset,
            behavior: 'smooth'
        })
    })
}

export function getInputValueOrEmpty (inputName) {
    const input = document.querySelector(`#motorcycle-form input[name=${inputName}]`)
    if (input) return input.value;
    return ''
}