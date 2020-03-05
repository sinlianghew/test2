import Vue from 'vue';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';
import Countries from '../../spa-assets/json/countries.json';
import _ from 'lodash';
// import StickySidebar from 'sticky-sidebar'; 
import $ from 'jquery';
import matchHeight from 'jquery-match-height';
// import VueStickyDirective from '@renatodeleao/vue-sticky-directive'

if ($('#travel-form').length) {


    const travelForm = new Vue({
        el: '#travel-form',
        components: {
            Datepicker
        },
        // directives: {
        //     'sticky': VueStickyDirective
        // },
        data: {
            parameter: {
                get_started: 0,
                choose_a_plan: 1,
                fill_in_details: 2,
                review: 3,
                pay: 4,

            },
            steps: [{
                    step: 1,
                    title: 'Get Started',
                    completed: false,
                    key: "get_started"
                },
                {
                    step: 2,
                    title: 'Choose a Plan',
                    completed: false,
                    key: "choose_a_plan"
                },
                {
                    step: 3,
                    title: 'Fill In Details',
                    completed: false,
                    key: "fill_in_details"
                },
                {
                    step: 4,
                    title: 'Review',
                    completed: false,
                    key: "review"
                },
                {
                    step: 5,
                    title: 'Pay',
                    completed: false,
                    key: "pay"
                }
            ],
            coverageAreas: [{
                    name: 'Area 1',
                    countries: 'Australia, Brunei, Cambodia, China, Hong Kong, India, Indonesia, Japan, Korea, Laos, Macau, Maldives, Myanmar, New Zealand, Pakistan, Philippines, Singapore, Sri Lanka, Taiwan, Thailand and Vietnam.'
                },
                {
                    name: 'Area 2',
                    countries: 'Europe, Tibet, Nepal, Mongolia, Bhutan and Countries in Area 1.'
                },
                {
                    name: 'Area 3',
                    countries: 'Worldwide and countries in Area 1 and 2 but excluding Afghanistan, Cuba, Democratic Republic of Congo, Iran, Iraq, Sudan and Syria.'
                },
                {
                    name: 'Area 4',
                    countries: 'Malaysia (single trip between Peninsular and East Malaysia and vice versa).'
                }
            ],
            coverageAreasAnnual: [{
                    name: 'Area 1',
                    countries: 'Australia, Brunei, Cambodia, China, Hong Kong, India, Indonesia, Japan, Korea, Laos, Macau, Maldives, Myanmar, New Zealand, Pakistan, Philippines, Singapore, Sri Lanka, Taiwan, Thailand and Vietnam.'
                },
                {
                    name: 'Area 2',
                    countries: 'Europe, Tibet, Nepal, Mongolia, Bhutan and Countries in Area 1.'
                },
                {
                    name: 'Area 3',
                    countries: 'Worldwide and countries in Area 1 and 2 but excluding Afghanistan, Cuba, Democratic Republic of Congo, Iran, Iraq, Sudan and Syria.'
                },
            ],
            banks: [{
                    img: 'maybank.jpg',
                    name: 'Maybank2U'
                },
                {
                    img: 'maybank.jpg',
                    name: 'Maybank2E'
                },
                {
                    img: 'ocbc.jpg',
                    name: 'OCBC Bank'
                },
                {
                    img: 'rhb.jpg',
                    name: 'RHB'
                },
                {
                    img: 'standard-chartered.jpg',
                    name: 'Standard Chartered'
                },
                {
                    img: 'uob.jpg',
                    name: 'UOB Bank'
                },
                {
                    img: 'ambank.jpg',
                    name: 'AmBank'
                },
                {
                    img: 'bank-islam.jpg',
                    name: 'Bank Islam'
                },
                {
                    img: 'bank-rakyat.jpg',
                    name: 'Bank Rakyat'
                },
                {
                    img: 'bank-muamalat.jpg',
                    name: 'Bank Muamalat'
                },
                {
                    img: 'bsn.jpg',
                    name: 'BSN'
                },
                {
                    img: 'cimb.jpg',
                    name: 'CIMB Clicks'
                },
                {
                    img: 'hlb.jpg',
                    name: 'Hong Leong Bank'
                },
                {
                    img: 'hsbc.jpg',
                    name: 'HSBC Bank'
                },
                {
                    img: 'kuwait.jpg',
                    name: 'KFH'
                },
                {
                    img: 'public.jpg',
                    name: 'Public Bank'
                },
                {
                    img: 'alliance.jpg',
                    name: 'Alliance Bank'
                },
                {
                    img: 'affin.jpg',
                    name: 'Affin Bank'
                },
            ],
            formData: {
                idType: 'N',
                nric: '901010-14-5021',
                country: 'Malaysia',
                passport: '',
                pdpaAgreement: false,
                dateOfBirth: '',
                areaOfCoverage: 'Area 1',
                startDate: null,
                endDate: null,
                customerName: 'Henry Teo',
                email: 'henryto@gmail.com',
                mobileNo: '012-216 2534',
                gender: '',
                addressLine1: '7, Lorong Bahagia 2',
                addressLine2: 'Taman Tun Dr Ismail',
                postcode: '60000',
                city: 'Kuala Lumpur',
                state: 'Wilayah Persekutuan',
                familyMembers: [],
                nomineeName: 'Teo Wei Ming',
                nomineeNric: '801116-14-5497',
                nomineeMobileNo: '017-216 2534',
                nomineeRelationToCustomer: 'Father',
                tncAgreement: false,
                paymentMethod: 'Online Banking',
            },
            calendar: {
                disabledDates: {
                    to: new Date(Date.now() - 8640000)
                },

            },
            currStep: null,
            showGetStartedConsent1: true,
            showGetStartedConsent2: false,
            showGetStartedConsent: false,
            countries: Countries,
            nomineeEditMode: false,
            personalEditMode: false,
            selectedPlan: "",
            selectedOptPlan: "",
            selectedCoverageType: "Single Trip",
            previousSelectedOptPlan: ""
        },
        computed: {
            countriesForCurrArea: function () {
                return this.coverageAreas.find(a => a.name === this.formData.areaOfCoverage).countries;
            },
            allCountries: function () {
                let self = this;
                let keys = Object.keys(this.countries);
                let countryNames = keys.map(function (k) {
                    return self.countries[k].trim()
                })
                countryNames = _.orderBy(countryNames, null, ['asc'])
                return countryNames
            },
            fullAddress: function () {
                return `${this.formData.addressLine1}, ${this.formData.addressLine2}, ${this.formData.postcode} ${this.formData.city}, ${this.formData.state}, ${this.formData.country}`;
            },
            endDateDisabledDates: function () {
                return {
                    to: this.formData.startDate
                }
            },
        },
        updated() {
            if (window.matchMedia('(min-width: 992px)').matches) {
                this.rowMatchHeight();
            }
        },
        methods: {
            rowMatchHeight() {
                let group = document.querySelectorAll('.selection-infobox-group');
                group.forEach((item) => {
                    let heights = []
                    item.querySelectorAll('.header-match-height').forEach((elem, i) => {
                        elem.style.removeProperty('height');
                        let height = elem.clientHeight;
                        heights.push(height);
                    });

                    let max = Math.max(...heights);

                    item.querySelectorAll('.header-match-height').forEach((elem, i) => {
                        elem.style.height = max + 'px';
                    });
                })
            },
            changeStep(step) {
                if (typeof step === 'number') {
                    this.currStep = this.steps.find(s => s.step === step);
                    this.scrollTop();
                }
                if (typeof step === 'object') {
                    this.currStep = step;
                }
            },
            setShowGetStartedConsent(value) {
                this.showGetStartedConsent = value;
            },
            setShowGetStartedConsent1(value) {
                this.showGetStartedConsent1 = value;
            },
            setShowGetStartedConsent2(value) {
                this.showGetStartedConsent2 = value;
            },
            goToNextStep() {
                if (this.currStep.step === 1 && !this.formData.pdpaAgreement) {
                    return;
                }
                this.scrollTop().then(function () {
                    if (this.currStep.step === this.steps.length) {
                        return;
                    }
                    const nextStep = this.steps.find(s => s.step === this.currStep.step + 1);
                    this.currStep.completed = true;
                    this.currStep = nextStep;
                }.bind(this))
            },
            goToPrevStep() {
                this.scrollTop().then(function () {
                    if (this.currStep.step === 1) {
                        return;
                    }
                    const prevStep = this.steps.find(s => s.step === this.currStep.step - 1);
                    this.currStep = prevStep;
                    this.currStep.completed = false;

                }.bind(this))
            },
            customDateFormatter(date) {
                return moment(date).format('DD/MM/YYYY')
            },
            customDateFormatterWithDay(date) {
                return moment(date).format('DD/MM/YYYY (ddd)')
            },
            scrollTop() {
                let defer = $.Deferred()
                const offset = $("#travel-form").offset().top;
                if (window.scrollY < 100) {
                    return defer.resolve()
                }
                $("body, html").animate({
                    scrollTop: offset
                }, 800, function () {
                    defer.resolve()
                })
                return defer;
            },
            addFamilyMember() {
                let fields = {
                    relationToCustomer: 'Spouse',
                    nationality: 'Malaysian',
                    country: '',
                    name: '',
                    nric: '',
                    dateOfBirth: ''
                }
                this.formData.familyMembers.push(fields)
            },
            removeFamilyMember(familyMember) {
                this.formData.familyMembers = this.formData.familyMembers.filter(m => m !== familyMember)
            },
            setNomineeEditMode(value) {
                this.nomineeEditMode = value;
            },
            setPersonalEditMode(value) {
                this.personalEditMode = value;
            },
            getUrlParamValue() {
                var vars = {};
                var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
                    vars[key] = value;
                });
                return vars;
            },
            uncheck(val) {
                if (val === this.previousSelectedOptPlan) {
                    this.selectedOptPlan = "";
                }
                this.previousSelectedOptPlan = this.selectedOptPlan;
            }
        },
        watch: {
            selectedPlan(val) {
                this.selectedOptPlan = ""
                console.log('selectedPlan', this.selectedPlan)
            },
            'formData.startDate'(val) {
                console.log('startDate', this.formData.startDate);
            },
            'formData.endDate'(val) {
                console.log('endDate', this.formData.endDate);
            },
            selectedCoverageType(val) {
                console.log('selectedCoverageType Changed, reset selectedOptPlan')
                this.selectedOptPlan = ""
            }
        },
        mounted() {
            window.onbeforeunload = null;
            let currentSlide = this.getUrlParamValue()['slide'];


            if (currentSlide) {
                for (let i = 0, len = this.steps.length; i < len; i++) {
                    this.steps[i].completed = true;
                    if (this.steps[i].key === currentSlide) {
                        this.steps[i].completed = false;
                        break;
                    }
                }
                this.currStep = this.steps[this.parameter[currentSlide]];
            } else {
                this.currStep = this.steps[0];
            }

            document.getElementById("travel-form").style.opacity = "1";

        }
    })
}

$(document).ready(function () {
    // $('[data-toggle="tooltip"]').tooltip();
    $("body").tooltip({
        selector: '[data-toggle=tooltip]'
    });

    if ($('.popup-wrapper').length) {
        $(".btn-close").click(function () {
            $(".popup-wrapper").hide();
        });
    }

    if ($('#sidebar').length) {

        //#sidebar have to be wrapped in #main-content 
        const stickySidebar = new StickySidebar('#sidebar', {
            topSpacing: 0,
            bottomSpacing: 0,
            containerSelector: false,
            innerWrapperSelector: '.sidebar__inner',
            resizeSensor: true,
            stickyClass: 'is-affixed',
            minWidth: 0
        });
    }


    //changes the footer to fix only in homepage
    if ($('.homepage-wrapper').length) {
        $(".footer-wrapper").css('position', 'fixed');
    }

    //nav menu
    $(".hamburger-menu").click(function () {
        $('#newNavMenu').addClass('showMenu');
    });
     
    $(".nav-menu .btn-close").click(function () {
        $('#newNavMenu').removeClass('showMenu');
    });
    

});