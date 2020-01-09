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
        formData: {
            idType: 'Passport',
            nric: '',
            country: '',
            passport: '',
            pdpaAgreement: false,
            dateOfBirth: ''
        },
        currStep: null,
        showGetStartedConsent: false
    },
    methods: {
        changeStep(step) {
            this.currStep = step;
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
        },
        goToPrevStep() {
            if (this.currStep.step === 1) {
                return;
            }
            const prevStep = this.steps.find(s => s.step === this.currStep.step - 1);
            this.currStep = prevStep;
        },
        customDateFormatter(date) {
            return moment(date).format('DD/MM/YYYY')
        },
        customDateFormatterWithDay(date) {
            return moment(date).format('DD/MM/YYYY (ddd)')
        }
    },
    mounted() {
        this.currStep = this.steps[0]
    }
})