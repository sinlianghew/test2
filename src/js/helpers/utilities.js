const baseUrl = $('input[name=tieBaseUrl]').val() || 'https://takeiteasy.msig.com.my';

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

    console.log(year, month, date)
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
export function createDotCMSQueryURL (structureName, queryObj, isLive) {
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