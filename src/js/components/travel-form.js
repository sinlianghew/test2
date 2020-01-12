import Vue from 'vue';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';


const travelForm = new Vue({
    el: '#travel-form',
    components: {
        Datepicker
    },
    data: {
        steps: [
            { 
                step: 1,
                title: 'Get Started',
                completed: false,
            },
            { 
                step: 2,
                title: 'Choose a Plan',
                completed: false 
            },
            { 
                step: 3,
                title: 'Fill In Details',
                completed: false 
            },
            { 
                step: 4,
                title: 'Nominee Details',
                completed: false 
            },
            { 
                step: 5,
                title: 'Review',
                completed: false 
            },
            { 
                step: 6,
                title: 'Pay',
                completed: false 
            }
        ],
        coverageAreas: [
            {
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
        formData: {
            idType: 'Passport',
            nric: '',
            country: '',
            passport: '',
            pdpaAgreement: false,
            dateOfBirth: '',
            areaOfCoverage: 'Area 1',
            startDate: null,
            endDate: null,
            tncAgreement: false,
            paymentMethod: 'Credit/Debit Card'
        },
        currStep: null,
        showGetStartedConsent: true
    },
    computed: {
        countriesForCurrArea: function () {
            return this.coverageAreas.find(a => a.name === this.formData.areaOfCoverage).countries;
        }
    },
    methods: {
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
            if (this.currStep.step === this.steps.length) {
                return;
            }
            const nextStep = this.steps.find(s => s.step === this.currStep.step + 1);
            this.currStep.completed = true;
            this.currStep = nextStep;
            this.scrollTop();
        },
        goToPrevStep() {
            if (this.currStep.step === 1) {
                return;
            }
            const prevStep = this.steps.find(s => s.step === this.currStep.step - 1);
            this.currStep = prevStep;
            this.scrollTop();
        },
        customDateFormatter(date) {
            return moment(date).format('DD/MM/YYYY')
        },
        customDateFormatterWithDay(date) {
            return moment(date).format('DD/MM/YYYY (ddd)')
        },
        scrollTop() {
            const offset = $("#travel-form").offset().top;
            $("body, html").animate({
                scrollTop: offset
            }, 800)
        }
    },
    mounted() {
        this.currStep = this.steps[1];
    }
})