import { extend } from "vee-validate";
import { required, min, max, integer, email, length } from "vee-validate/dist/rules";
import moment from 'moment';
import { extractDOB, getCardType, checkLuhn, getDateUnitWithS } from '../helpers/utilities';
const prefixMobile = $('input[name=prefixMobile]').val();
const productMinAge = $('input[name=productMinAge]').val();
const productMaxAge = $('input[name=productMaxAge]').val();

const additionalCoverageSpouseMaxAge = $('input[name=additionalCoverageSpouseMaxAge]').val() || 69;
const additionalCoverageSpouseMaxAgeUnit = $('input[name=additionalCoverageSpouseMaxAgeUnit]').val();
const additionalCoverageSpouseMinAge = $('input[name=additionalCoverageSpouseMinAge]').val() || 18;
const additionalCoverageSpouseMinAgeUnit = $('input[name=additionalCoverageSpouseMinAgeUnit]').val();

const additionalCoverageChildMaxAge = $('input[name=additionalCoverageChildMaxAge]').val() || 17;
const additionalCoverageChildMaxAgeUnit = $('input[name=additionalCoverageChildMaxAgeUnit]').val();
const additionalCoverageChildMinAge = $('input[name=additionalCoverageChildMinAge]').val() || 31;
const additionalCoverageChildMinAgeUnit = $('input[name=additionalCoverageChildMinAgeUnit]').val();


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

extend('alpha_num', {
    validate: function(value){
        if(value.length === 0)return true;
        const regex = /^[a-zA-Z0-9]*$/g;
        return regex.test(value)
    }
})
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
        
        //const thisYear = new Date().getFullYear();
        const thisYear = parseInt(value.substr(0, 2));
        const month = parseInt(value.substr(2, 2));
        if (month > 12) return false;

        const day = parseInt(value.substr(4, 2));
        return moment(`${thisYear} ${month} ${day}`, 'YYYY MM DD').isValid();      
    }
})

extend('nonMalaysianMinAge', {
    validate: function (value) {
        if (value.length === 0) return true;
        console.log("nM value : "+value);
        var value1= value;
        if(value1 instanceof Date){
            // do nothing
        }
        else{
            //value1 = new Date(Date.parse(value1));
            value1 = moment(value1).toDate();
        }
        console.log("nM value1 : "+value1);
        const dob = value1.getFullYear();
        const thisYear = new Date().getFullYear();
        return (thisYear - dob >= productMinAge) && (thisYear - dob <= productMaxAge); 
    }
})

extend('nricAge18AndAbove', {
    validate: function (value) {
        if (value.length === 0) return true;
        const today = new Date();
        const dob = extractDOB(value);
        return (today.getFullYear() - dob.getFullYear() >= productMinAge) && (today.getFullYear() - dob.getFullYear() <= productMaxAge);
    }
})

extend('spouseMalaysiaAgeYear', {
    validate: function (value) {
        if (value.length === 0) return true;
        const today = new Date();
        const dob = extractDOB(value);
        return (today.getFullYear() - dob.getFullYear() >= additionalCoverageSpouseMinAge) && (today.getFullYear() - dob.getFullYear() <= additionalCoverageSpouseMaxAge);
    }
})

extend('spouseNonMalaysiaAgeYear', {
    validate: function (value) {
        if (value.length === 0) return true;
        var value1= value;
        if(value1 instanceof Date){
            // do nothing
        }
        else{
            //value1 = new Date(Date.parse(value1));
            value1 = moment(value1).toDate();
        }
        const dob = value1.getFullYear();
        const thisYear = new Date().getFullYear();
        return (thisYear - dob >= additionalCoverageSpouseMinAge) && (thisYear - dob <= additionalCoverageSpouseMaxAge); 
    }
})

extend('childMalaysiaAge', {
    validate: function (value) {
        if (value.length === 0) return true;
        //const today = new Date();
        const today = moment();
        const dob = extractDOB(value);
        const momentDob = moment(dob);
        const maxAgeUnit = getDateUnitWithS(additionalCoverageChildMaxAgeUnit);//year
        const minAgeUnit = getDateUnitWithS(additionalCoverageChildMinAgeUnit); // day
        return (today.diff(momentDob, minAgeUnit) >= additionalCoverageChildMinAge) && (today.endOf('year').diff(momentDob, maxAgeUnit)  <= additionalCoverageChildMaxAge);
        //return (today.diff(momentDob, 'years') >= productMinAge) && (today.year() - dob <= productMaxAge);
        //return (today.getFullYear() - dob.getFullYear() >= productMinAge) && (today.getFullYear() - dob.getFullYear() <= productMaxAge);
    }
})

extend('childNonMalaysiaAge', {
    validate: function (value) {
        if (value.length === 0) return true;
        var value1= value;
        if(value1 instanceof Date){
        }
        else{
            //value1 = new Date(Date.parse(value1));
            value1 = moment(value1).toDate();
        }
        const today = moment();
        const dobDates= moment(value1);
        const maxAgeUnit = getDateUnitWithS(additionalCoverageChildMaxAgeUnit);// year
        const minAgeUnit = getDateUnitWithS(additionalCoverageChildMinAgeUnit); //day
        return (today.diff(dobDates, minAgeUnit) >= additionalCoverageChildMinAge) && (today.endOf('year').diff(dobDates, maxAgeUnit)  <= additionalCoverageChildMaxAge);
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
       
        var oRegEx = new RegExp("^(" + prefixMobile + ")[-]{0,1}[0-9]{3}\\s[0-9]{4,7}$");
        return oRegEx.test(value);
    
        //const number = value.replace(/[\s-]*/g, '');
        //return /^\d*$/.test(number) && number.length <= 11 && number.length >= 10
    }
})

extend('validStartDate', {
    validate: function (value) {
        console.log("value: "+value)
        if (value.length === 0) return true;
        const today = new Date();
        const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, today.getDate());
        var value1= value;
        if(value1 instanceof Date){
            // do nothing
        }
        else{
            //value1 = new Date(Date.parse(value1));
            value1 = moment(value1).toDate();
        }
        console.log("value1: "+value1)
        //const within60Days = (value.valueOf() - today.valueOf() <= 1000*60*60*24*60) ? true : false;
        return (value1 >= today) && (value1 <= maxDate);      
    }
})