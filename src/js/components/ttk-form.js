import Vue from 'vue';
import {
    mask,
    masked
} from 'vue-the-mask';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';
import _ from 'lodash';
import $ from 'jquery';
import matchHeight from 'jquery-match-height';
import {
    ValidationProvider,
    ValidationObserver
} from 'vee-validate'
import Countries from '../../spa-assets/json/msig-countries.json';


$(function () {

    if ($('#ttk-form').length) {
        console.log("TTK")
        const ttkForm = new Vue({
            el: '#ttk-form',
            components: {
                Datepicker,
                ValidationProvider,
                ValidationObserver
            },
            directives: {
                mask,
                masked
            },
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
                        title: 'Event Details',
                        completed: false,
                        key: "event_details"
                    },
                    {
                        step: 3,
                        title: 'Personal Details',
                        completed: false,
                        key: "personal_details"
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
                    '1': {
                        pdpaAgreement: false,
                        country:''
                    },
                    '2': {
                        eventDetails: []
                    },
                    '3': {
                        country:'',
                        policyHolderIdType: 'nric',
                        policyHolderMalaysian: '',
                        policyHolderName: '',
                        policyHolderNRIC: '',
                        policyHolderEmail: '',
                        policyHolderMobileNo: '',
                        policyHolderAddressLine1: '',
                        policyHolderAddressLine2: '',
                        addressPostCode: '',
                        // malaysian
                        nationality1:'',
                        mName1:'',
                        mnric1:'',
                        //nonmalaysian
                        nmName1:'',
                        nmPassport1:'',
                        date1:''
                    }
                },
                calendar: {
                    disabledDates: {
                        to: new Date(Date.now() - 8640000)
                    },

                },

                currStep: null,
                showGetStartedConsent: true,
                countries: Countries,
                nomineeEditMode: false,
                personalEditMode: false,
                selectedPlan: "",
                selectedOptPlan: "",
                selectedCoverageType: "Single Trip",
                previousSelectedOptPlan: ""
            },
            computed: {
                isIdNric: function () {

                    return this.formData['3'].policyHolderIdType === 'nric';
                },
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
                    // console.log("AAAA", countryNames)
                    return countryNames
                },
                fullAddress: function () {
                    // return `${this.formData['3'].policyHolderAddressLine1}, ${this.formData['3'].policyHolderAddressLine2}, ${this.formData.postcode} ${this.formData.city}, ${this.formData.state}, ${this.formData.country}`;
                    return `${this.formData['3'].policyHolderAddressLine1}, ${this.formData['3'].policyHolderAddressLine2}`;
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
                onSubmit: async function () {
                    console.log('submitting')
                    console.log(this.currStep)

                    // if (this.currStep.stepNum == '1') {
                    //     this.checkNCD()
                    // }
                  
                    await this.scrollTop();
                    this.currStep.completed = true;
                    this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
                
                },

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
                goToNextStep() {
                    // if (this.currStep.step === 1 && !this.formData.pdpaAgreement) {
                    //     return;
                    // }
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
                    const offset = $("#ttk-form").offset().top;
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
                // addFamilyMember() {
                //     console.log("yes family")
                //     let fields = {
                //         relationToCustomer: 'Spouse',
                //         nationality: 'Malaysian',
                //         country: '',
                //         name: '',
                //         nric: '',
                //         dateOfBirth: ''
                //     }
                //     this.formData['3'].familyMembers.push(fields)
                // },
                // removeFamilyMember(familyMember) {
                //     this.formData['3'].familyMembers = this.formData['3'].familyMembers.filter(m => m !== familyMember)
                // },
                addEventDetails: function () {
                    console.log("yes details")
                    let fields = {
                        eventName: '',
                        // eventDate: null,
                        eventAddressLine1: '',
                        eventAddressLine2: '',
                        eventPostCode: '',
                        eventCity: '',
                        eventState: ''
                    }
                    this.formData['2'].eventDetails.push(fields)
                },
                removeEventDetails: function (eventDetails) {
                    // need to ensure that the first event is not removed
                    if (this.formData['2'].eventDetails.length === 1) return;

                    this.formData['2'].eventDetails = this.formData['2'].eventDetails.filter(m => m !== eventDetails)
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
                'formData.eventDate'(val) {
                    console.log('eventDate', this.formData.eventDate);
                },
                selectedCoverageType(val) {
                    console.log('selectedCoverageType Changed, reset selectedOptPlan')
                    this.selectedOptPlan = ""
                }
            },
            mounted: function () {


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

                document.getElementById("ttk-form").style.opacity = "1";


                // By default, one event needs to be added
                this.addEventDetails()

            }
        })
    }

})

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

        console.log("sidebar?")
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