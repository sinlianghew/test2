import Vue from 'vue';
import $ from 'jquery';
import _ from 'lodash';
import { mask, masked } from 'vue-the-mask';
import moment from 'moment';
import VueBootstrapTypeahead from 'vue-typeahead-bootstrap/dist/VueBootstrapTypeahead.umd';
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { extractDOB, createDotCMSQueryURL, getCardType, scrollTo } from '../helpers/utilities';
import MotorcycleSummaryPane from '../components/motorcycle-summary-pane';
Vue.component('motor-summary-pane', MotorcycleSummaryPane)

/**
 * Staff Relation: ['Direct Relationship']
 */

const m3paform = new Vue({
    el: '#motorcycle-form',
    data: {
        stage: document.querySelector('#motorcycle-form input[name=stage]').value,
        baseUrl: document.querySelector('#motorcycle-form input[name=tieBaseUrl]').value,
        productCode: document.querySelector('#motorcycle-form input[name="productCode"]').value,
        partnerCode: document.querySelector('#motorcycle-form input[name="partnerCode"]').value,
        productName: document.querySelector('#motorcycle-form input[name="productName"]').value,
        branchCode: document.querySelector('#motorcycle-form input[name="branchCode"]').value,
        staffId: document.querySelector('#motorcycle-form input[name="staffId"]').value,
        staffRelationship: document.querySelector('#motorcycle-form input[name="staffRelationship"]').value,
        supportTel: document.querySelector('#motorcycle-form input[name="supportTel"]').value,
        thankYouPageUrl: document.querySelector('#motorcycle-form input[name="thankYouPageUrl"]').value,
        formula: document.querySelector('#motorcycle-form input[name=formula]').value,
        paymentUrl: document.querySelector('#motorcycle-form input[name="paymentUrl"]').value,
        summaryUrl: document.querySelector('#motorcycle-form input[name="summaryUrl"]').value,
        wishToRestoreSession: false,

        steps: [
            { stepNum: '1', title: 'Get Started', completed: false, showPrescreen: true, hash: 'prescreen' },
            { stepNum: '2', title: 'Fill In Details', completed: false, hash: 'fillindetails' },
            { stepNum: '3', title: 'Choose Add-Ons', completed: false, hash: 'planselection' },
            { stepNum: '4', title: 'REVIEW', completed: false, hash: '' },
            { stepNum: '5', title: 'PAY', completed: false, hash: '' }
        ],
        currStep: null,

        loading: false, // this controls the spinner
        canProceed: true,
        errorMessage: null,

        // Data pulled in from dotCMS on pageload
        countries: null,
        states: null,
        banks: null,
        
        // Data used by the auto complete
        postcodeSearch: '',
        postcodeSuggestions: [],
        currSelectedPostcode: '',
        loanProviderSuggestions: [],
        isNotKnownPostcode: false,

        // Data used for motorcycle information
        allModelsByMake: [],
        allModelVariants: [],
        allCcVariants: [],

        formData: {
            1: {
                policyHolderIdType: 'nric',
                country: '',
                policyHolderNric: '750820-14-5815',
                motorRegistrationNo: 'WQN5666',
                agreement: true
            },
            2: {
                motorVehicleLocation: '', // a.k.a. vpmsStateCode, it's inside an object
                curMktValue: 0,
                motorLoanProvider: '',
                policyHolderName: '',
                policyHolderEmail: '',
                policyHolderMobileNo: '',
                policyHolderAddressLine1: '',
                policyHolderAddressLine2: '',
                policyHolderGender: '', // remember to use computed property instead
                addressPostcode: '',
                addressState: '',
                addressStateCode: '',
                addressCity: '',
                policyHolderMaritalStatus: '',
                policyHolderOccupation: ''
            },
            3: {
                motorPlanType: '',
                motorPlusPlan: 'Y', // consider removing
                motorAddRiderPA: '',
                motorAddLegalLiabilityToPassengers: '',
                motorAddLegalLiabilityOfPassengers: '',
                motorAddSpecialPerils: '',
                motorAddSRCC: '',
                allRiderPlan: false,
                
                isRenewRoadtax: null,
                roadtaxCollectionMethod: 'homeOfficeDelivery',
                roadtaxDelAddrSameAsMotor: false,
                roadtaxDelRegion: '',
                roadtaxAddressLine1: '',
                roadtaxAddressLine2: '',
                roadtaxPostcode: '',
                roadtaxCity: ''
            },
            4: {
                tncAgreement: false,
                isMotorDetailsEditMode: false,
                isRiderDetailsEditMode: false,
                purchaseTempId: '',

                // Motorcycle Details Edit
                motorVehicleLocation: '',

                // Rider Details Edit
                policyHolderName: '',
                policyHolderEmail: '',
                policyHolderMobileNo: '',
                policyHolderAddressLine1: '',
                policyHolderAddressLine2: '',
                addressPostcode: '',
                addressState: '',
                addressStateCode: '',
                addressCity: '',
                policyHolderMaritalStatus: '',
                policyHolderOccupation: '',

            },
            5: {
                paymentMethod: 'fpxPaymentGateway',
                bankId: '',
                fpxEmail: '',
                cardHolderName: '',
                ccNo: '',
                expiry: '',
                cvv: '',
                ewalletVendor: null
            }
        },
        
        underwrittenRules: {},
        hexTokens: {
            F: {
                pattern: /[0-9A-Za-z]/,
                transform: v => v.toLocaleUpperCase()
            }
        }
    },
    components: {
        ValidationProvider,
        ValidationObserver,
        VueBootstrapTypeahead
    },
    directives: {
        mask,
        masked
    },
    methods: {
        createDotCMSQueryURL,
        saveSession () {
            const state = {
                allModelsByMake: this.allModelsByMake,
                allModelVariants: this.allModelVariants,
                allCcVariants: this.allCcVariants,
                canProceed: this.canProceed,
                steps: this.steps,
                currStep: this.currStep,
                formData: this.formData,
                postcodeSearch: this.postcodeSearch,
                postcodeSuggestions: this.postcodeSuggestions,
                currSelectedPostcode: this.currSelectedPostcode,
                loanProviderSuggestions: this.loanProviderSuggestions,
            }
            window.sessionStorage.setItem('m3pa_data', JSON.stringify(state))
        },
        async maybeRestoreSession () {
            const state = JSON.parse(window.sessionStorage.getItem('m3pa_data'))
            if (state) {
                if (state.canProceed /*&& state.steps.filter(s => s.stepNum !== '1').some(s => s.completed === true)*/) {
                    const shouldRestore = await this.promptRestoreSession()
                    if (shouldRestore) {
                        this.allModelsByMake = state.allModelsByMake;
                        this.allModelVariants = state.allModelVariants;
                        this.allCcVariants = state.allCcVariants;
                        this.canProceed = state.canProceed;
                        this.steps = state.steps;
                        this.currStep = state.steps.find(s => s.stepNum === state.currStep.stepNum);
                        this.formData = state.formData;
                        this.postcodeSearch = state.postcodeSearch;
                        this.postcodeSuggestions = state.postcodeSuggestions;
                        this.currSelectedPostcode = state.currSelectedPostcode;
                        this.loanProviderSuggestions = state.loanProviderSuggestions;
                        this.$nextTick(() => this.rowMatchHeight())
                        return;
                    }
                }
            }
            this.currStep = this.steps[0]
            window.location.hash = this.currStep.hash;
            sessionStorage.removeItem('m3pa_data')
        },
        setPrescreen: function (value) {
            this.steps[0].showPrescreen = value;
        },
        scrollTop () {
            return new Promise((resolve, reject) => {
                const offset = $("#motorcycle-form").offset().top;
                if (window.scrollY < 100) {
                    return resolve()
                }
                scrollTo(offset).then(() => resolve())
            })
        },
        onSubmit: async function () {
            this.loading = true;
            if (this.currStep.stepNum == '1') {
                
                const isBlacklisted = (await this.checkBlacklist()).isBlacklisted;
                if (isBlacklisted) {
                    this.errorMessage = "Sorry, we are unable to proceed with your application.";
                    this.canProceed = false;
                    return;
                }

                // Check the vehicle's NCD
                const motorDetails = await this.checkNCD()
                this.formData['2'] = {
                    ...this.formData['2'],
                    ...motorDetails
                }

                if (!motorDetails.canProceed) {
                    if (motorDetails.errorCode) {
                        let errorMessage = await this.findErrorByErrorCodeAsync(motorDetails.errorCode)
                        let $errorMessage = $('<p>' + errorMessage + '</p>')
                        $errorMessage.find('a').attr('href', 'tel:' + this.supportTel).html(this.supportTel)
                        this.errorMessage = $errorMessage.html();
                    }
                    this.canProceed = false;
                    window.killUnloadM3PA && window.killUnloadM3PA()
                    return;
                }

                // Don't take the Cubic Capacity from here, it is not valid
                const { motorMakeCode, motorModelCode, motorYearOfMake, nxtNCDEffDt } = motorDetails;
                this.allModelsByMake = await this.findAllMotorMakeVehicleModels(motorMakeCode)

                this.allCcVariants = await this.findMotorcycleCCVariants(motorMakeCode, motorModelCode, motorYearOfMake, nxtNCDEffDt)
                this.formData['2'].motorCc = this.allCcVariants[0];
                this.allModelVariants = await this.findMotorcycleModelVariants(motorMakeCode, motorModelCode, motorYearOfMake, this.formData['2'].motorCc, nxtNCDEffDt)
                this.formData['2'].motorModel = this.allModelVariants[0];

                // By right not supposed to set like this..
                this.handleMotorModelChanged()
            } else if (this.currStep.stepNum == '2') {
                this.formData['3'].motorPlanType = "comprehensive"
                await this.calculatePremiumAsync()
            } else if (this.currStep.stepNum == '3') {
                if (this.formData['3'].motorPlusPlan === null) {
                    $('#information-modal .content-container').html(
                        `<p>You have not selected a plan yet</p>`
                    )
                    this.loading = false;
                    $('#information-modal').modal('show')
                    $('#information-modal').one('hidden.bs.modal', () => {
                        let position = $('.motorcycle-selection').offset().top - 10;
                        this.scrollToPosition(position, 800)
                    })
                    return;
                }

                // Copy the values over. This is needed for the cancel functionality
                this.formData['4'].motorVehicleLocation = this.formData['2'].motorVehicleLocation;
                this.formData['4'].policyHolderName = this.formData['2'].policyHolderName;
                this.formData['4'].policyHolderEmail = this.formData['2'].policyHolderEmail;
                this.formData['4'].policyHolderMobileNo = this.formData['2'].policyHolderMobileNo;
                this.formData['4'].policyHolderAddressLine1 = this.formData['2'].policyHolderAddressLine1;
                this.formData['4'].policyHolderAddressLine2 = this.formData['2'].policyHolderAddressLine2;
                this.formData['4'].addressPostcode = this.formData['2'].addressPostcode;
                this.formData['4'].addressState = this.formData['2'].addressState;
                this.formData['4'].addressStateCode = this.formData['2'].addressStateCode;
                this.formData['4'].addressCity = this.formData['2'].addressCity;
                this.formData['4'].policyHolderMaritalStatus = this.formData['2'].policyHolderMaritalStatus;
                this.formData['4'].policyHolderOccupation = this.formData['2'].policyHolderOccupation;
                
                this.saveSession();
                window.killUnloadM3PA && window.killUnloadM3PA()
                await this.scrollTop();
                window.location.href = "/msigonline/products/motorcycle/summary.html"
                return;
            } else if (this.currStep.stepNum == '4') {
                const response = await this.initiatePayment()
                const $errorFormWrapper = $(`<div id="error-form-wrapper">${response}</div>`)
                $errorFormWrapper.find('form').attr('action', this.paymentUrl)
                $(this.$el).find('#error-form-placeholder').html($errorFormWrapper.html())

                this.formData['4'].purchaseTempId = $errorFormWrapper.find('input[name="purchaseTempId"]').val()
                this.saveSession()
                // console.log(window)
                // window.killUnloadM3PA && window.killUnloadM3PA()
                // setTimeout(() => $(this.$el).find('#error-form-placeholder form').trigger('submit'), 200)
            } else if (this.currStep.stepNum == '5') {
                window.killUnloadM3PA && window.killUnloadM3PA()
                $('form#thePaymentForm').trigger('submit');
                return
            }

            await this.scrollTop();
            
            this.currStep.completed = true;
            this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
            window.location.hash = this.currStep.hash;
            
            this.loading = false;
            this.initializeTooltips()
            this.$nextTick(() => this.rowMatchHeight())
        },
        goToPrevStep: async function () {
            if (this.steps.indexOf(this.currStep) == 0) {
                return;
            }
            await this.scrollTop();
            this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
            window.location.hash = this.currStep.hash;
            this.initializeTooltips()
            this.$nextTick(() => this.rowMatchHeight())
        },
        checkNCD: async function () {
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';

            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'motorNcdCheck',
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                    motorChassisNo: '',
                    partnerCode: this.partnerCode,
                    productCode: this.productCode,
                    productName: this.productName,
                    policyHolderNRIC: this.formData['1'].policyHolderNric
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Returns a list of models produced by a make (e.g. Yamaha).
         * @param {string} motorMakeCode 
         */
        findAllMotorMakeVehicleModels (motorMakeCode) {
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'findCarModel',
                    motorMakeCode,
                    productCode: this.productCode
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Returns a list of cubic capacity for a particular model.
         * @param {string} motorMakeCode 
         * @param {string} motorModelCode 
         * @param {string} motorYearOfMake 
         * @param {string} coverageStartDate 
         */
        findMotorcycleCCVariants (motorMakeCode, motorModelCode, motorYearOfMake, coverageStartDate) {
            // action: findCarCc
            // motorMakeCode: 42
            // motorModelCode: 28
            // motorYearOfMake: 2019
            // coverageStartDate: 03/07/2020
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'findCarCc',
                    motorMakeCode,
                    motorModelCode,
                    motorYearOfMake,
                    coverageStartDate
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Returns a list of model variants for a particular model of motorcycle.
         */
        findMotorcycleModelVariants (motorMakeCode, motorModelCode, motorYearOfMake, motorCc, coverageStartDate) {
            // action: findCarVariants
            // motorMakeCode: 42
            // motorModelCode: 28
            // motorYearOfMake: 2019
            // motorCc: 113
            // coverageStartDate: 03/07/2020
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            return $.ajax({
                method: 'POST',
                url: apiUrl,
                data: {
                    action: 'findCarVariants',
                    motorMakeCode,
                    motorModelCode,
                    motorYearOfMake,
                    motorCc,
                    coverageStartDate
                },
                dataType: 'json'
            }).promise()
        },
        /**
         * Used in template to handle a change in the Cubic Capacity's field's value
         */
        async handleCcChanged () {
            const { motorMakeCode, motorModelCode, motorYearOfMake, motorCc, nxtNCDEffDt } = this.formData['2'];
            this.allModelVariants = await this.findMotorcycleModelVariants(motorMakeCode, motorModelCode, motorYearOfMake, motorCc, nxtNCDEffDt)
            this.formData['2'].motorModel = this.allModelVariants[0];
            this.handleMotorModelChanged()
        },
        /**
         * Used in template to handle a change in the variant of the motorcycle
         */
        handleMotorModelChanged() {
            this.formData['2'].motorModelCode = this.formData['2'].motorModel.modelCode;
            this.formData['2'].make = this.formData['2'].motorModel.make;
            this.formData['2'].family = this.formData['2'].motorModel.family;
        },
        async handleMotorcycleLocationChanged () {
            const motorSumInsured = await this.findVehicleSumInsured()
            this.formData['2'] = {
                ...this.formData['2'],
                ...motorSumInsured
            }
            this.formData['2'].sumInsuredType = this.formData['2'].sumInsuredType === 'MarketValue' ? 'marketValue' : 'recomendedValue';
            
            if (!motorSumInsured.canProceed) {
                this.errorMessage = '<p>The car sum insured is not available in the system.  Please download the application form <a style="width: auto; height: auto; display: inline-block; line-height: initial; background: transparent;text-decoration:underline" href="../../resource/Motor_ProposalForm.pdf" target="_blank"><b><u> here </u></b></a> and email to us.</p>'
                this.canProceed = false;
                sessionStorage.removeItem('m3pa_data')
            }
        },
        findVehicleSumInsured () {
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            return $.ajax({
                type: "POST",
                url: apiUrl,
                dataType: 'json',
                data: {
                    action: "findMotorcycleSumInsured",
                    partnerCode: this.partnerCode,
                    productCode: this.productCode,
                    productName: this.productName,
                    motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                    motorNvic: this.formData['2'].motorModel.nvic,
                    motorVehicleLocation: this.formData['2'].motorVehicleLocation ? this.formData['2'].motorVehicleLocation.vpmsStateCode : '',
                    coverageStartDate: this.formData['2'].nxtNCDEffDt,
                    motorCc: this.formData['2'].motorCc,
                    motorMakeCode: this.formData['2'].motorMakeCode,
                    motorYearOfMake: this.formData['2'].motorYearOfMake,
                    motorModelCode: this.formData['2'].motorModelCode,
                    motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                    motorVehiclePremiumValue: '',
                    certificateNo: '', // According to Inventech, this is applicable when it is a renewal with MSIG
                    policyHolderMalaysian: this.formData['1'].policyHolderIdType === 'nric' ? 'Y' : 'N',
                    policyHolderNRIC: this.formData['1'].policyHolderNric,
                    staffId: this.staffId,
                    branchAbbr: this.branchCode,
                    staffRelationship: this.staffRelationship
                }
            }).promise()
        },
        async findErrorByErrorCodeAsync (errorCode) {
            const queryObj = {
                errorCode
            }
            const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefBancaMotorErrorMessage', queryObj, true)
            const apiResp = await $.ajax({
                method: 'GET',
                dataType: 'json',
                url: dotCMSQueryURL
            })
            return apiResp.contentlets[0].errorMessage
        },
        checkBlacklist () {
            let apiUrl = this.baseUrl + '/dotCMS/purchase/buynow';
            return $.ajax({
                method: 'POST',
                url: apiUrl,
                dataType: 'json',
                data: {
                    action: "blackListedCheck",
                    productCode: this.productCode,
                    policyHolderNRIC: this.formData['1'].policyHolderNric,
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo
                }
            }).promise()
        },
        getPostcodesAsync: async function (postcode) {
            const dotCMSQueryURL = this.baseUrl +
                '/api/content/render/false/type/json/limit/0/query/' + 
                '+structureName:TieRefCity%20' +
                '+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20' +
                '+TieRefCity.postcode:' + postcode + '*' +
                '/orderby/TieRefCity.postcode'

            const apiResp = await $.ajax({
                method: 'GET',
                url: dotCMSQueryURL,
                dataType: 'json'
            }).promise()

            this.postcodeSuggestions = apiResp.contentlets;
        },
        getLoanProvidersAsync: async function (name) {
            const dotCMSQueryURL = this.baseUrl +
                '/api/content/render/false/type/json/limit/0/query/' + 
                '+structureName:TieRefBancaLoanProvider%20' +
                '+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20' +
                '+live:true%20' +
                '+TieRefBancaLoanProvider.financeName:' + name + '*' +
                '/orderby/TieRefBancaLoanProvider.financeName'

            const apiResp = await $.ajax({
                method: 'GET',
                url: dotCMSQueryURL,
                dataType: 'json'
            }).promise()

            this.loanProviderSuggestions = apiResp.contentlets;
        },
        handlePostcodeHit: async function (cityObj) {
            this.formData['2'].addressPostcode = cityObj.postcode;
            this.formData['2'].addressCity = cityObj.cityDescription;
            
            const stateQuery = {
                'stateCode': cityObj.stateCode
            }
            const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefState', stateQuery, true)
            const stateApiResp = await $.ajax({
                method: 'GET',
                dataType: 'json',
                url: dotCMSQueryURL
            }).promise()

            this.formData['2'].addressState = stateApiResp.contentlets[0].stateDescription;
            this.currSelectedPostcode = cityObj;
        },
        getDayName: function (dateString) {
            return moment(dateString, 'DD/MM/YYYY').format('ddd')
        },
        scrollToError: function () {
            const isMobile = window.innerWidth < 768;
            let $errors = $('.wizard-section-' + this.currStep.stepNum).find('.is-invalid, .error-input');
            if (isMobile) {
                $errors = $errors.filter(function() { return $(this).parents('.d-none').length === 0 })
            }
            if ($errors.length && $errors.first()) {
                let offset = $errors.first().offset().top - 10
                scrollTo(offset)
            }
        },
        scrollToPosition: function (pos, speed) {
            return new Promise((resolve, reject) => {
                $("body, html").animate({
                    scrollTop: pos
                }, speed, () => resolve())
            })
        },
        calculatePremiumAsync: async function () {
            this.loading = true;
            const apiResp = await $.ajax({
                method: 'POST',
                url: this.baseUrl + '/dotCMS/purchase/buynow',
                // url: 'https://www.mocky.io/v2/5e7200e33300004f0044c5a1',
                dataType: 'json',
                data: {
                    action: 'calculatePremium',
                    memberRelationship: 'Driver',
                    motorNvic: this.formData['2'].motorModel.nvic,
                    motorVehicleLocation: this.formData['2'].motorVehicleLocation.vpmsStateCode,
                    motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                    motorAddLegalLiabilityToPassengers: '', // TODO: CHECK THIS!
                    motorAddLegalLiabilityOfPassengers: this.formData['3'].motorAddLegalLiabilityOfPassengers ? 'Y' : '',
                    motorAddSpecialPerils: this.formData['3'].motorAddSpecialPerils ? 'Y': '',
                    motorAddSRCC: this.formData['3'].motorAddSRCC ? 'Y': '',
                    motorAddRiderPA: this.formData['3'].motorAddRiderPA ? 'Y' : '',
                    productCode: this.productCode,
                    partnerCode: this.partnerCode,
                    coverageStartDate: this.formData['2'].nxtNCDEffDt,
                    coverageExpiryDate: this.formData['2'].nxtNCDExpDt,
                    policyHolderNRIC: this.formData['1'].policyHolderNric,
                    policyHolderGender: this.policyHolderGender,
                    policyHolderMalaysian: this.isIdNric ? 'Y' : '',
                    policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                    motorCc: this.formData['2'].motorCc,
                    motorMakeCode: this.formData['2'].motorMakeCode,
                    motorYearOfMake: this.formData['2'].motorYearOfMake,
                    motorModelCode: this.formData['2'].motorModelCode,
                    motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                    motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                    motorSeat: this.formData['2'].seat,
                    motorStyle: this.formData['2'].style,
                    motorVariant: this.formData['2'].variant,
                    motorTransmission: this.formData['2'].transmission,
                    motorFamily: this.formData['2'].family,
                    motorMake: this.formData['2'].make,
                    motorVehiclePremiumValue: this.formData['2'].sumInsuredType, // confusing naming here
                    dpfstatus: this.formData['2'].dpfStatus, // this passed back during NCD checking
                    productName: this.productName,
                    addressState: this.formData['2'].addressStateCode,
                    staffRelationship: this.staffRelationship,
                    staffId: this.staffId,
                    motorPlusPlan: this.formData['3'].motorPlanType === 'comprehensive' ? '' : 'Y',
                    allRiderPlan: this.formData['3'].allRiderPlan ? 'Y' : '',
                }
            })

            this.formData['3'] = {
                ...this.formData['3'],
                ...apiResp
            }

            const { maxSumInsured, minSumInsured } = this.underwrittenRules;
            if (this.formData['3'].sumInsured > maxSumInsured) {
                this.formData['3'].sumInsured = maxSumInsured;
            }
            
            if (this.formData['3'].sumInsured < minSumInsured) {
                this.formData['3'].sumInsured = minSumInsured;
            }

            this.loading = false;
        },
        formatAsCurrency: function (number) {
            return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        initializeTooltips: function () {
            this.$nextTick().then(() => {
                const currStepNum = this.currStep.stepNum;
                const $tooltips = $(this.$el).find(`.wizard-section-${currStepNum} [data-toggle=tooltip]`);
                $tooltips.each(function() {
                    if (!$(this).hasClass('tooltip-initialized')) {
                        $(this).tooltip()
                        $(this).addClass('tooltip-initialized')
                    } else {
                        $(this).tooltip('update')
                    }
                })
            })
        },

        // Step 4 Related
        cancelEditMotorDetails: function () {
            this.formData['4'].motorVehicleLocation = this.formData['2'].motorVehicleLocation;
            this.formData['4'].isMotorDetailsEditMode = false;
        },
        saveEditMotorDetails: function () {
            this.formData['2'].motorVehicleLocation = this.formData['4'].motorVehicleLocation;
            this.formData['4'].isMotorDetailsEditMode = false;
            this.calculatePremiumAsync()
        },
        cancelEditRiderDetails: function () {
            this.formData['4'].policyHolderName = this.formData['2'].policyHolderName;
            this.formData['4'].policyHolderEmail = this.formData['2'].policyHolderEmail;
            this.formData['4'].policyHolderMobileNo = this.formData['2'].policyHolderMobileNo;
            this.formData['4'].policyHolderAddressLine1 = this.formData['2'].policyHolderAddressLine1;
            this.formData['4'].policyHolderAddressLine2 = this.formData['2'].policyHolderAddressLine2;
            this.formData['4'].addressPostcode = this.formData['2'].addressPostcode;
            this.formData['4'].addressState = this.formData['2'].addressState;
            this.formData['4'].addressStateCode = this.formData['2'].addressStateCode;
            this.formData['4'].addressCity = this.formData['2'].addressCity;
            this.formData['4'].policyHolderMaritalStatus = this.formData['2'].policyHolderMaritalStatus;
            this.formData['4'].policyHolderOccupation = this.formData['2'].policyHolderOccupation;
            this.formData['4'].isRiderDetailsEditMode = false;
        },
        saveEditRiderDetails: function () {
            this.formData['2'].policyHolderName = this.formData['4'].policyHolderName;
            this.formData['2'].policyHolderEmail = this.formData['4'].policyHolderEmail;
            this.formData['2'].policyHolderMobileNo = this.formData['4'].policyHolderMobileNo;
            this.formData['2'].policyHolderAddressLine1 = this.formData['4'].policyHolderAddressLine1;
            this.formData['2'].policyHolderAddressLine2 = this.formData['4'].policyHolderAddressLine2;
            this.formData['2'].policyHolderMaritalStatus = this.formData['4'].policyHolderMaritalStatus;
            this.formData['2'].policyHolderOccupation = this.formData['4'].policyHolderOccupation;
            this.formData['4'].isRiderDetailsEditMode = false;
            this.calculatePremiumAsync()
        },

        // Step 5
        initiatePayment: function () {
            return $
                .ajax({
                    method: 'POST',
                    url: this.baseUrl + '/dotCMS/purchase/buynow',
                    data: {
                        action: "processPurchase",
                        actionType: "Step2",
                        partnerCode: this.partnerCode,
                        productCode: this.productCode,
                        productName: this.productName,
                        prescreenYesNo: 'Y',
                        staffRelationship: this.staffRelationship,
                        isInIframe: '${isInIframe}',
                        gstRate: 'N',
                        sstRate: 'N',
                        destSelect: 'N',
                        formula: 'motor',
                        certificateNo: '', // to check if needed
                        motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                        motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                        dpfStatus: 'false',
                        motorMakeCode: this.formData['2'].motorMakeCode,
                        motorModelCode: this.formData['2'].motorModelCode,
                        enableCcDropDown: this.formData['2'].enableCcDropDown,
                        motorCc: this.formData['2'].motorCc,
                        motorYearOfMake: this.formData['2'].motorYearOfMake,
                        motorStyle: this.formData['2'].style,
                        motorSeat: this.formData['2'].seat,
                        motorVariant: this.formData['2'].variant,
                        motorTransmission: this.formData['2'].transmission,
                        motorFamily: this.formData['2'].family,
                        motorMake: this.formData['2'].make,
                        motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                        motorNxtNcdEffDate: this.formData['2'].nxtNCDEffDt,
                        motorCurNcdLevel: this.formData['2'].curNCDLevel,
                        motorCurNcdEffDate: this.formData['2'].curNCDEffDt,
                        motorCurNcdExpDate: this.formData['2'].curNCDExpDate,
                        motorNvic: this.formData['2'].motorModel.nvic,
                        motorVehicleLocation: this.formData['2'].motorVehicleLocation.vpmsStateCode,
                        motorVehicleLocationStateCode: this.formData['2'].motorVehicleLocation.code,
                        motorVehiclePremiumValue: '',
                        motorDisplayNxtNcd: this.formData['2'].nxtNCDDiscount + '%',
                        motorSumInsured: this.formData['2'].marketValue,
                        ISMEngineNo: this.formData['2'].ISMEngine,
                        motorEngineNo: this.formData['2'].motorEngineNo,
                        motorLoanProvider: this.formData['2'].motorLoanProvider && this.loanProviderSuggestions.find(l => l.financeName === this.formData['2'].motorLoanProvider).financeCode || '',
                        motorLoanProviderDescription: this.formData['2'].motorLoanProvider,
                        motorAddLegalLiabilityToPassengers: this.formData['3'].motorAddLegalLiabilityToPassengers ? 'Y' : '',
                        motorAddLegalLiabilityOfPassengers: this.formData['3'].motorAddLegalLiabilityOfPassengers ? 'Y' : '',
                        motorAddSpecialPerils: this.formData['3'].motorAddSpecialPerils ? 'Y' : '',
                        motorAddWindscreen: '',
                        motorAddWindscreenSumInsured: 0,
                        motorAddSRCC: this.formData['3'].motorAddSRCC ? 'Y' : '',
                        motorAddRiderPA: this.formData['3'].motorAddRiderPA ? 'Y' : '',
                        motorAddUnlimitedTowing: '',
                        motorAddWaiverCompulsoryExcess: '',
                        motorAddEHailing: '',
                        motorAddOnEHailing: '',
                        motorAddBetterment: '',
                        motorAddBettermentEndorsementCode: '',
                        motorAddSmartKeyShield: '',
                        motorAddSmartKeyShieldSumInsured: 0,
                        motorAddDriverPersonalAccident: '',
                        motorAddDriverPersonalAccidentSumInsured: 0,
                        motorAdditonalDriver: 0,
                        motorAdditonalDriverPremium: 0,
                        motorAddLimitedSpecialPerils: '',
                        motorAddNcdRelief: '',
                        motorPlusPlan: this.formData['3'].motorPlanType === 'comprehensive' ? '' : 'Y',
                        motorPlusPlanPremium: this.formData['3'].motorPlanType === 'comprehensive' ? '' : '0',
                        allRiderPlan: this.formData['3'].allRiderPlan ? 'Y' : '',
                        flexiPlan: '',
                        additionalPlanA: '',
                        additionalPlanB: '',
                        additionalPlanC: '',
                        motorAddCART: '',
                        motorAddCARTSumInsured: 0,
                        additionalPlan07: '',
                        additionalPlan14: '',
                        additionalPlan21: '',
                        agreeToTnC: 'Y',
                        coverageStartDate: this.formData['3'].coverageStartDate,
                        coverageExpiryDate: this.formData['3'].coverageExpiryDate,
                        policyHolderName: this.formData['2'].policyHolderName,
                        policyHolderNRIC: this.formData['1'].policyHolderNric,
                        policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                        policyHolderGender: this.policyHolderGender,
                        policyHolderDrivingExp: '',
                        policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                        policyHolderNationality: this.formData['1'].country,
                        policyHolderEmail: this.formData['2'].policyHolderEmail,
                        policyHolderMobileNo: this.formData['2'].policyHolderMobileNo,
                        policyHolderMaritalStatus: this.formData['2'].policyHolderMaritalStatus === 'Married' ? 'M' : 'S',
                        policyHolderOccupation: this.formData['2'].policyHolderOccupation,
                        photo: '',
                        policyHolderAddressLine1: this.formData['2'].policyHolderAddressLine1,
                        policyHolderAddressLine2: this.formData['2'].policyHolderAddressLine2,
                        refAddress1: '',
                        refAddress2: '',
                        addressOverwriteIndicator: '',
                        addressPostcode: this.formData['2'].addressPostcode,
                        addressState: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['2'].addressCity).stateCode,
                        addressCity: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['2'].addressCity).cityCode,
                        propertyPostcode: '',
                        propertyAddressLine1: '',
                        propertyAddressLine2: '',
                        locationAddressLine1: '',
                        locationAddressLine2: '', 
                        propertyState: '', 
                        propertyCity: '', 
                        studentId: '', 
                        staffId: this.staffId, 
                        staffRelationship: this.staffRelationship,
                        campus: '',
                        coveragePlan: 'Basic',
                        coveragePremiumRate: 0,
                        branchAbbr: this.branchCode,
                        staffName: '',
                        agentNumber: '',
                        coveragePremiumType: 'default',
                        travelPlan: '',
                        travelArea: '',
                        travelBenefitPlan: '',
                        coveragePremiumDiscount: this.formData['3'].discountAmount,
                        coverageStampDuty: this.formData['3'].stampDuty,
                        noDaysCovered: this.formData['3'].daysOfCoverage,
                        totalPremium: this.formData['3'].totalPayable,
                        memberName: this.formData['2'].policyHolderName,
                        memberIdNo: this.formData['1'].policyHolderNric,
                        memberIsMalaysian: this.isIdNric ? 'Y' : 'N',
                        memberGender: this.policyHolderGender,
                        memberRelationship: 'Driver',
                        driverRelationship: '00',
                        memberDOB: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                        memberMotorDrivingExperience: '',
                        memberOccupation: this.formData['2'].policyHolderOccupation,
                        memberPetBreed: '',
                        memberPetMicrochipId: '',
                        memberPhoto: '',
                        basicPremium: this.formData['3'].basePremium,
                        ncdAmount: this.formData['3'].ncdAmount,
                        netNcdAmount: this.netNCDAmount,
                        annualPremium: this.grossPremium,
                        excess: this.formData['3'].motorPlanType === 'comprehensive' ? this.formData['3'].excess : '',
                        discount: this.formData['3'].discountAmount,
                        sst: this.formData['3'].sst,
                        sstVal: this.formData['3'].sstAmount,
                        stampDuty: this.formData['3'].stampDuty,
                        grandTotal: this.formData['3'].totalPayable,
                        additionalPremium: this.formData['3'].totalAdditionalCoveragePremium,
                        driverQuantity: '',
                        driverPremium: '',
                        allRiderPlanPremium: this.formData['3'].allRiderPlanPremium || '',
                        ncdReliefPremium: this.formData['3'].addNcdReliefPremium || '',
                        legalLiabilityToPassengersPremium: this.formData['3'].addLegalLiabilityToPassengersPremium || '',
                        legalLiabilityOfPassengersPremium: this.formData['3'].addLegalLiabilityOfPassengersPremium,
                        specialPerilsPremium: this.formData['3'].addSpecialPerilsPremium || '',
                        limitedSpecialPerilsPremium: '',
                        unlimitedTowingPremium: '',
                        waiverCompulsoryExcessPremium: '', 
                        srccPremium: this.formData['3'].addSRCCPremium || '',
                        riderPAPremium: this.formData['3'].addRiderPAPremium || '',
                        eHailingPremium: '',
                        bettermentPremium: '',
                        windscreenSumInsured: '',
                        smartKeyShieldSumInsured: '',
                        driverPersonalAccidentSumInsured: '',
                        cartSumInsured: '',
                    },
                    success: function (data) {
                        console.log(JSON.stringify(data))
                    }
                })
                .promise()
        },

        async getUnderWrittenRules () {
            const data = await $.ajax({
                method: 'POST',
                url: this.baseUrl + '/dotCMS/purchase/buynow',
                dataType: 'json',
                data: {
                    action: 'underWrittenRule',
                    partnerCode: this.partnerCode,
                    productCode: this.productCode,
                    certificateNo: '',
                    motorSuminsured: ''
                }
            }).promise()
            this.underwrittenRules = data;
        },
        async getCountries () {
            const data = await $.ajax({
                method: 'GET',
                url: this.createDotCMSQueryURL('TieRefCountry', {}, true),
                dataType: 'json'
            }).promise()
            this.countries = _.sortBy(
                data.contentlets.reduce((acc, content) => {
                    acc.push({
                        name: content.name,
                        code: content.countryCode
                    })
                    return acc;
                }, []),
                'name'
            )
        },
        async getMalaysiaStates () {
            const data = await $.ajax({
                method: 'GET',
                url: this.createDotCMSQueryURL('TieRefState', {}, true),
                dataType: 'json'
            }).promise()

            this.states = _.sortBy(
                data.contentlets.reduce((acc, content) => {
                    acc.push({
                        name: content.stateDescription,
                        code: content.stateCode,
                        vpmsStateCode: content.vpmsStateCode
                    })
                    return acc;
                }, []),
                'name'
            )
        },
        async getBankList () {
            const data = await $.ajax({
                method: 'GET',
                url: this.baseUrl + '/dotCMS/purchase/paynow/banklist',
                dataType: 'json'
            })
            this.banks = data.filter(b => b.bankOnlineStatus === true);
        },
        promptRestoreSession () {
            const $modal = $('#session-modal');
            return new Promise ((resolve, reject) => {
                $modal.one('hidden.bs.modal', () => {
                    resolve(this.wishToRestoreSession)
                })
                $modal.modal('show')
            })
        },
        rowMatchHeight () {
            let $group = $(this.$el).find('.selection-infobox-group');
            let $rows = $group.find('.row-match-height');

            let rowsByRowNum = {}
            $rows.each(function () {
                const rowNum = $(this).data('row-num')
                if (!rowsByRowNum[rowNum]) {
                    rowsByRowNum[rowNum] = [this]
                } else {
                    rowsByRowNum[rowNum].push(this)
                }
            })

            Object
                .values(rowsByRowNum)
                .forEach(rows => {
                    const tallest = Math.max(...rows.map(r => r.clientHeight))
                    rows.forEach(r => r.style.height = tallest + 'px')
                })
        },
        checkAndSetHash() {
            let currHash = window.location.hash;
            if (currHash === '') {

            }
        }
    },
    computed: {
        isIdNric: function() {
            return this.formData['1'].policyHolderIdType === 'nric';
        },
        policyHolderGender: {
            get: function () {
                const last4Digits = this.formData['1'].policyHolderNric.split('-')[2]
                return last4Digits % 2 === 1 ? 'M' : 'F'
            },
            set: function (value) {
                if (this.isIdNric) {
                    this.formData['2'].policyHolderGender = value
                }
            }
        },
        policyHolderDob: function () {
            const nric = this.formData['1'].policyHolderNric;
            return extractDOB(nric);
        },
        fullAddress: function () {
            return `${this.formData['2'].policyHolderAddressLine1}, ${this.formData['2'].policyHolderAddressLine2}, ${this.formData['2'].addressPostcode} ${this.formData['2'].addressCity}, ${this.formData['2'].addressState}`
        },
        cardType: function () {
            return getCardType(this.formData['5'].ccNo)
        },
        netNCDAmount: function () {
            let additionalAddOns = 0;
            if (this.formData['3'].allRiderPlanPremium) {
                additionalAddOns += this.formData['3'].allRiderPlanPremium;
            }
            return this.formData['3'].basePremium + additionalAddOns - this.formData['3'].ncdAmount
        },
        grossPremium: function () {
            return this.netNCDAmount + this.formData['3'].totalAdditionalCoveragePremium;
        }
    },
    watch: {
        "formData.2.addressPostcode": _.debounce(async function (postcode) {
            await this.getPostcodesAsync(postcode)

            if (postcode.length === 5 && this.currSelectedPostcode && this.currSelectedPostcode.postcode != postcode) {
                this.currSelectedPostcode = null;
            }

            if (postcode.length === 5 && !this.currSelectedPostcode) {
                let suggestion = this.postcodeSuggestions.find(s => s.postcode == postcode);
                if (!suggestion) {
                    console.log('postcode not found in suggestions')
                    this.isNotKnownPostcode = true;
                    return;
                }
                
                this.formData['2'].addressCity = suggestion.cityDescription;
                this.formData['2'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
                this.isNotKnownPostcode = false;
                return;
            }
        }, 500),
        "formData.1.policyHolderNric": function (value) {
            if (this.isIdNric) {
                this.formData['2'].policyHolderGender = this.nricGender;
            }
        },
        "formData.2.motorLoanProvider": _.debounce(function (name) {
            this.getLoanProvidersAsync(name)
        }, 500),
        "formData.3.motorPlanType": function (value) {
            if (value === 'm3pa') {
                this.formData['3'].motorAddRiderPA = true;
                this.formData['3'].motorAddSRCC = false
                this.formData['3'].motorAddSpecialPerils = false
            } else {
                this.formData['3'].motorAddRiderPA = false;
            }
            this.calculatePremiumAsync()
        },
        loading: function (value) {
            if (value) {
                return $('.page-loader').fadeIn()
            }
            $('.page-loader').fadeOut()
        }
    },
    mounted: async function() {
        this.loading = true;
        $(window).on('unload', () => this.saveSession())
        this.getUnderWrittenRules()
        this.getCountries()
        this.getMalaysiaStates()
        this.getBankList()
        await this.maybeRestoreSession()
        this.initializeTooltips()
        this.loading = false;
    }
})