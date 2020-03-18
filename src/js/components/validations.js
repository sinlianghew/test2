import { extend } from "vee-validate";
import { required, min, max } from "vee-validate/dist/rules";
import moment from 'moment';

/**
 * Given an NRIC, return a Date object representing
 * the date of birth.
 * @param {String} nric 
 * @returns {Date}
 */
function extractDOB(nric) {
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

extend('required', {
    ...required,
    message: function (fieldName, placeholders) {
        return `* Complete the ${fieldName} field.`
    }
});

extend('min', min)
extend('max', max)

extend('mustBeTrue', {
    validate: function (value) {
        if (value !== true) {
            return false;
        }
        return true;
        
    },
    message:function(fieldName,placeholders){
        return `* wow the ${fieldName} field.`
    }
});

extend('validName', {
    validate: function (value) {
        // Sample: Kelvin Lee @ Rogers A/L T'Challa
        if (value.length === 0) return true;
        const regex = /^[(\w*)(@)(/)(')(\s)(\-)]+$/g;
        return regex.test(value)
    }
})

extend('nricValidDob', {
    validate: function (value) {
        if (value.length === 0 || value.length < 4) return true;
        
        const thisYear = new Date().getFullYear();

        const month = parseInt(value.substr(2, 2));
        if (month > 12) return false;

        const day = parseInt(value.substr(4, 2));
        return moment(`${thisYear} ${month} ${day}`, 'YYYY MM DD').isValid();      
    }
})

extend('nricAge18AndAbove', {
    validate: function (value) {
        if (value.length === 0) return true;
        const today = new Date();
        const dob = extractDOB(value);
        return today.getFullYear() - dob.getFullYear() >= 18;
    }
})
