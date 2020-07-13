import { extend } from "vee-validate";
import { required, min, max, integer, email, length } from "vee-validate/dist/rules";
import moment from 'moment';
import { extractDOB, getCardType, checkLuhn } from '../helpers/utilities';

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
extend('length', length)

extend('mustBeTrue', {
    validate: function (value) {
        if (value !== true) {
            return false;
        }
        return true;
    }
})

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

extend('isCreditCardValid', {
    validate: function (value) {
        if (value.length === 0) return true;

        let cardNumber = value.replace(/\D/g, '');
        if (cardNumber.length < 16) return false;

        if (getCardType(cardNumber) === null) return false;

        if (!checkLuhn(cardNumber)) return false;

        return true;
    }
})

extend('isCreditCardExpiryValid', {
    validate: function (value) {
        if (value.length === 0) return true;

        const pattern = /[0-9]{2}\/[0-9]{2}/g;
        if (!pattern.test(value)) return false;

        const expiryDate = moment(value, 'MM/YY');
        if (!expiryDate.isValid()) return false;

        if (!expiryDate.isAfter(moment(), 'month')) return false;

        return true;
    }
})

extend('mobileNumber', {
    validate: function (value) {
        if (!value.length) return true;
        const number = value.replace(/[\s-]*/g, '');
        return /^\d*$/.test(number) && number.length <= 11
    }
})