import { extend } from "vee-validate";
import { required } from "vee-validate/dist/rules";

extend('required', {
    ...required,
    message: function(fieldName, placeholders) {
        return `* Complete the ${fieldName} field.`
    }
});

extend('mustBeTrue', {
    validate: function(value) {
        if (value !== true) {
            return false;
        }
        return true;
    }
})

// similar to how merchant code is done, we need to restrict concessions
// this is for maybank, we need to tie concessions to merchant code