// Import the main styles
import "../scss/main.scss"

// Polyfills for Internet Explorer
import "core-js/stable";
import "regenerator-runtime/runtime";

// SVG Polyfill for Internet Explorer
import svg4everybody from 'svg4everybody';
svg4everybody()

// Import the bootstrap client library
import "bootstrap"


// Vue Related Stuff
import Vue from 'vue';
import VueTheMask from 'vue-the-mask';
Vue.use(VueTheMask);
import "./directives/uppercase";

// Import the JS components
import "./components/validations"
import "./components/motorcycle-form"

// import "./components/sticky-sidebar.min"
 