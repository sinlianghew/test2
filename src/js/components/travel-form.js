import Vue from 'vue';
import Datepicker from 'vuejs-datepicker';
import moment from 'moment';
import Countries from '../../assets/json/countries.json';
import _ from 'lodash';

if ($('#travel-form').length) {
    const travelForm = new Vue({
        el: '#travel-form',
        components: {
            Datepicker
        },
        data: {
            steps: [
                { step: 1, title: 'Get Started', completed: false },
                { step: 2, title: 'Choose a Plan', completed: false },
                { step: 3, title: 'Fill In Details', completed: false },
                { step: 4, title: 'Nominee Details', completed: false },
                { step: 5, title: 'Review', completed: false },
                { step: 6, title: 'Pay', completed: false }
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
                idType: 'NRIC',
                nric: '901010-14-5021',
                country: 'Malaysia',
                passport: '',
                pdpaAgreement: false,
                dateOfBirth: '',
                areaOfCoverage: 'Area 1',
                startDate: null  ,
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
                paymentMethod: 'Credit/Debit Card',
            },
            currStep: null,
            showGetStartedConsent: true,
            countries: Countries,
            nomineeEditMode: false,
            personalEditMode: false
        },
        computed: {
            countriesForCurrArea: function () {
                return this.coverageAreas.find(a => a.name === this.formData.areaOfCoverage).countries;
            },
            allCountries: function () {
                let self = this;
                let keys = Object.keys(this.countries);
                let countryNames = keys.map(function(k) {
                    return self.countries[k].trim()
                })
                countryNames = _.orderBy(countryNames, null, ['asc'])
                return countryNames
            },
            fullAddress: function() {
                return `${this.formData.addressLine1}, ${this.formData.addressLine2}, ${this.formData.postcode} ${this.formData.city}, ${this.formData.state}, ${this.formData.country}`;
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
                this.scrollTop().then(function() {
                    if (this.currStep.step === this.steps.length) {
                        return;
                    }
                    const nextStep = this.steps.find(s => s.step === this.currStep.step + 1);
                    this.currStep.completed = true;
                    this.currStep = nextStep;
                }.bind(this))
            },
            goToPrevStep() {
                this.scrollTop().then(function() {
                    if (this.currStep.step === 1) {
                        return;
                    }
                    const prevStep = this.steps.find(s => s.step === this.currStep.step - 1);
                    this.currStep = prevStep;
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
                }, 800, function() {
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
            }
        },
        mounted() {
            this.currStep = this.steps[0];
        }
    })
}
