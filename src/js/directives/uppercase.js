import Vue from 'vue';

Vue.directive('uppercase', {
    update: function (el) {
        el.value = el.value.toUpperCase();
    }
})