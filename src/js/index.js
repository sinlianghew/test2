// Import the main styles
import "../scss/main.scss"

// Polyfills for Internet Explorer
import "core-js/stable";

// SVG Polyfill for Internet Explorer
import svg4everybody from 'svg4everybody';
svg4everybody()

// Import the bootstrap client library
import "bootstrap"

// Vue Related Stuff
import Vue from 'vue';
import Vuelidate from 'vuelidate';
Vue.use(Vuelidate);

// Import the JS components
import "./components/travel-form"