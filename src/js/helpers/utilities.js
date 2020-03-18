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