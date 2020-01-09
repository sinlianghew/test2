import Vue from 'vue';

const travelForm = new Vue({
    el: '#travel-form',
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
            },
        ],
        formData: {
            idType: 'NRIC',
            nric: '',
            country: '',
            passport: '',
            pdpaAgreement: false
        },
        currStep: null,
        showGetStartedConsent: true
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
        }
    },
    mounted() {
        this.currStep = this.steps[0]
    }
})