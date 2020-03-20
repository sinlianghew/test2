import { extend } from "vee-validate";
import { required, min, max, integer, email } from "vee-validate/dist/rules";
import moment from 'moment';
import { extractDOB } from '../helpers/utilities';

extend('required', {
    ...required,
    message: function (fieldName, placeholders) {
        return `* Complete the ${fieldName} field.`
    }
});

extend('min', min)
extend('max', max)
extend('integer', integer)
extend('email', email)

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
        const regex = /^[((a-zA-Z)*)(@)(/)(')(\s)(\-)]+$/g;
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

extend('isPostcodeExist', {
    validate: async function (value) {

    }
})
