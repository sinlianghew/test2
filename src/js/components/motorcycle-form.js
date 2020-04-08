import Vue from 'vue';
import $ from 'jquery';
import _ from 'lodash';
import { mask, masked } from 'vue-the-mask';
import moment from 'moment';
import VueBootstrapTypeahead from 'vue-typeahead-bootstrap/dist/VueBootstrapTypeahead.umd';
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { extractDOB, createDotCMSQueryURL, getCardType, scrollTo } from '../helpers/utilities';
// import Datepicker from 'vuejs-datepicker';
import MotorcycleSummaryPane from '../components/motorcycle-summary-pane';
Vue.component('motor-summary-pane', MotorcycleSummaryPane)

/**
 * Staff Relation: ['Direct Relationship']
 */

$(function() {
    const baseUrl = document.querySelector('input[name=tieBaseUrl]').value;

    if ($('#motorcycle-form').length > 0) {
        const motorcycleForm = new Vue({
            el: '#motorcycle-form',
            data: {
                developmentMode: false,
                baseUrl,
                productCode: 'MCY',
                partnerCode: $('input[name="partnerCode"]').val(),
                productName: 'Motorcycle',
                staffId: $('input[name="staffId"]').val(),
                staffRelationship: $('input[name="staffRelationship"]').val(),
                supportTel: $('input[name="supportTel"]').val(),
                thankYouPageUrl: $('input[name="thankYouPageUrl"]').val(),

                steps: [
                    { stepNum: '1', title: 'Get Started', completed: false, showPrescreen: true },
                    { stepNum: '2', title: 'Fill In Details', completed: false },
                    { stepNum: '3', title: 'Choose Add-Ons', completed: false },
                    { stepNum: '4', title: 'REVIEW', completed: false },
                    { stepNum: '5', title: 'PAY', completed: false }
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
        
                formData: {
                    1: {
                        policyHolderIdType: 'nric',
                        country: '',
                        policyHolderNric: '870523-06-6009',
                        motorRegistrationNo: 'VBQ7136',
                        // policyHolderNric: '',
                        // motorRegistrationNo: '',
                        agreement: false
                    },
                    2: {
                        motorVehicleLocation: {
                            code:"B",
                            name:"Selangor",
                            vpmsStateCode:"SEL",
                        }, // a.k.a. vpmsStateCode
                        curMktValue: 0,
                        motorLoanProvider: '',
                        policyHolderName: 'Testing',
                        policyHolderEmail: 'test@test.asia',
                        policyHolderMobileNo: '0171234567',
                        policyHolderAddressLine1: '123 jalan impian',
                        policyHolderAddressLine2: 'jalan impian saujana',
                        policyHolderGender: '', // remember to use computed property instead
                        addressPostcode: '47810',
                        addressState: 'Selangor',
                        addressStateCode: 'B',
                        addressCity: 'SUNWAY DAMANSARA, PJ',
                        policyHolderMaritalStatus: 'Single',
                        policyHolderOccupation: 'Developer'
                    },
                    3: {
                        // motorPlusPlan: null,
                        motorPlanType: 'comprehensive',
                        motorPlusPlan: 'Y',
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
                        paymentMethod: 'onlineBanking',
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
                },
        
                motorDetails: null, // assigned from Motor NCD Check
        
                currMotorMakeInfo: null, // assigned after looking up the makeCode
                foundMotorModels: [], // assigned after looking up the modelCode
                currMotorNCDInfo: null, // assigned after looking up the ncdLevel
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
                setPrescreen: function (value) {
                    this.steps[0].showPrescreen = value;
                },
                scrollTop: function () {
                    let defer = $.Deferred()
                    const offset = $("#motorcycle-form").offset().top;
                    if (window.scrollY < 100) {
                        return defer.resolve()
                    }
                    scrollTo(offset).then(() => defer.resolve())
                    return defer;
                },
                onSubmit: async function () {
                    this.loading = true;
                    if (this.currStep.stepNum == '1') {
                        
                        const isBlacklisted = await this.checkBlacklist();
                        if (isBlacklisted) {
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
                            
                            // if (!this.developmentMode) {
                            //     return this.canProceed = false;
                            // }
                        }
                        // // Find the make information e.g. Toyota, Honda etc
                        // const motorMakesFound = await this.findVehicleMakeByCode(motorDetails.motorMakeCode)
                        // this.currMotorMakeInfo = motorMakesFound[0]
        
                        // // Find the model information e.g. LC, RC, Wave etc
                        // const motorModelsFound = await this.findVehicleModelByCode(motorDetails.motorModelCode)
                        // this.foundMotorModels = motorModelsFound;
        
                        // // Might not be needed 
                        // const motorNCD = await this.findVehicleNCD(motorDetails.nxtNCDLevel, motorDetails.nxtNCDDiscount)
                        // console.log(motorNCD)
                        // // Might not be needed
        
                        const motorSumInsured = await this.findVehicleSumInsured()
                        this.formData['2'] = {
                            ...this.formData['2'],
                            ...motorSumInsured
                        }
                        this.formData['2'].sumInsuredType = this.formData['2'].sumInsuredType === 'MarketValue' ? 'marketValue' : 'recomendedValue';
                        
                        if (!motorSumInsured.canProceed) {
                            
                            // show the user the form
                            // ' The car sum insured is not available in the system.  Please download the application form <a style="width: auto; height: auto; display: inline-block; line-height: initial; background: transparent;text-decoration:underline" href="../../resource/Motor_ProposalForm.pdf" target="_blank"><b><u> here </u></b></a> and email to us.'
                        } else {
                            
                        }
                    } else if (this.currStep.stepNum == '2') {
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
                    } else if (this.currStep.stepNum == '5') {
                        return window.location.href = this.thankYouPageUrl;
                    }
        
                    await this.scrollTop();
                    this.currStep.completed = true;
                    this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
                    this.loading = false;
                },
                goToPrevStep: async function () {
                    if (this.steps.indexOf(this.currStep) == 0) {
                        return;
                    }
                    await this.scrollTop();
                    this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                },
                checkNCD: async function () {
                    let apiUrl = baseUrl + '/dotCMS/purchase/buynow';
                    if (this.developmentMode) {
                        apiUrl = 'https://www.mocky.io/v2/5e748d7b300000d431a5f463'
                    }
        
                    const apiResponse = await $.ajax({
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
        
                    return apiResponse;
                },
                findVehicleModelByCode: async function (modelCode) {
                    const query = {
                        modelCode,
                        productCode: this.productCode
                    }
                    const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefBancaMotorModel', query)
        
                    const apiResponse = await $.ajax({
                        method: 'GET',
                        url: dotCMSQueryURL,
                        dataType: 'json'
                    }).promise()
        
                    return apiResponse.contentlets;
                },
                findVehicleMakeByCode: async function (makeCode) {
                    // makeCode, productCode
                    const query = {
                        makeCode,
                        productCode: this.productCode
                    }
                    const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefBancaMotorMake', query)
        
                    const apiResponse = await $.ajax({
                        method: 'GET',
                        url: dotCMSQueryURL,
                        dataType: 'json'
                    }).promise()
        
                    return apiResponse.contentlets;
                },
                findVehicleNCD: async function (ncdLevel, ncdDiscount) {
                    const query = {
                        ncdLevel,
                        ncdDiscount,
                        product: this.productName
                    }
                    const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefBancaMotorNCD', query)
        
                    const apiResponse = await $.ajax({
                        method: 'GET',
                        url: dotCMSQueryURL,
                        dataType: 'json'
                    }).promise()
        
                    return apiResponse.contentlets;
                },
                findVehicleSumInsured: async function () {
        
                    let apiUrl = baseUrl + '/dotCMS/purchase/buynow';
                    if (this.developmentMode) {
                        apiUrl = 'https://www.mocky.io/v2/5e748c373000007e00a5f455'
                    }
        
                    const apiResponse = await $.ajax({
                        type: "POST",
                        url: apiUrl,
                        dataType: 'json',
                        data: {
                            action: "findMotorcycleSumInsured",
                            partnerCode: this.partnerCode,
                            productCode: this.productCode,
                            productName: this.productName,
                            motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                            motorNvic: this.formData['2'].nvic,
                            motorVehicleLocation: this.formData['2'].motorVehicleLocation.vpmsStateCode,
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
                            branchAbbr: $('input[name=branchCode]').val(),
                            staffRelationship: this.staffRelationship
                        }
                    }).promise()
        
                    
        
                    return apiResponse;
                },
                findErrorByErrorCodeAsync: async function (errorCode) {
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
                checkBlacklist: async function () {
                    let apiUrl = baseUrl + '/dotCMS/purchase/buynow';
                    if (this.developmentMode) {
                        apiUrl = 'https://www.mocky.io/v2/5e7492493000006800a5f49f'
                    }
                    const apiResp = await $.ajax({
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
        
                    return apiResp.isBlacklisted;
                },
                getPostcodesAsync: async function (postcode) {
                    const dotCMSQueryURL = baseUrl +
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
                    const dotCMSQueryURL = baseUrl +
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
                    let $errors = $('.wizard-section-' + this.currStep.stepNum).find('.is-invalid, .error-input');
                    if ($errors.length && $errors.first()) {
                        let offset = $errors.first().offset().top - 10
                        scrollTo(offset)
                    }
                },
                scrollToPosition: function (pos, speed) {
                    let defer = $.Deferred()
                    $("body, html").animate({
                        scrollTop: pos
                    }, speed, function() {
                        defer.resolve()
                    })
                    return defer;
                },
                calculatePremiumAsync: async function () {
                    
                    const apiResp = await $.ajax({
                        method: 'POST',
                        url: this.baseUrl + '/dotCMS/purchase/buynow',
                        // url: 'https://www.mocky.io/v2/5e7200e33300004f0044c5a1',
                        dataType: 'json',
                        data: {
                            action: 'calculatePremium',
                            memberRelationship: 'Driver',
                            motorNvic: this.formData['2'].nvic,
                            motorVehicleLocation: this.formData['2'].motorVehicleLocation.vpmsStateCode,
                            motorNxtNcdLevel: this.formData['2'].nxtNCDDiscount,
                            motorAddLegalLiabilityToPassengers: '', // TODO: CHECK THIS!
                            motorAddLegalLiabilityOfPassengers: this.formData['3'].motorAddLegalLiabilityOfPassengers ? 'Y' : 'N',
                            motorAddSpecialPerils: this.formData['3'].motorAddSpecialPerils ? 'Y': 'N',
                            motorAddSRCC: this.formData['3'].motorAddSRCC ? 'Y': 'N',
                            motorAddRiderPA: this.formData['3'].motorAddRiderPA ? 'Y' : 'N',
                            allRiderPlan: this.formData['3'].allRiderPlan ? 'Y' : 'N',
                            productCode: this.productCode,
                            partnerCode: this.partnerCode,
                            coverageStartDate: this.formData['2'].nxtNCDEffDt,
                            coverageExpiryDate: this.formData['2'].nxtNCDExpDt,
                            policyHolderNRIC: this.formData['1'].policyHolderNric,
                            policyHolderGender: this.policyHolderGender,
                            policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
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
                            staffId: this.staffId,
                            staffRelationship: this.staffRelationship,
                            productName: this.productName,
                            addressState: this.formData['2'].addressStateCode
                        }
                    })
        
                    this.formData['3'] = {
                        ...this.formData['3'],
                        ...apiResp
                    }
        
                    return;
                },
                formatAsCurrency: function (number) {
                    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                },
                initializeTooltips: function () {
                    this.$nextTick().then(() => {
                        console.log(currStepNum)
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
                handleRoadtaxAddrSameChange: function () {
                    if (this.formData['3'].roadtaxDelAddrSameAsMotor) {
                        const applicantCity = this.formData['2'].addressCity;
                        
                        let region = 'West';
                        if (['sabah', 'sarawak'].includes(applicantCity)) {
                            region = 'East';
                        }
        
                        this.formData['3'].roadtaxDelRegion = region;
                        this.formData['3'].roadtaxAddressLine1 = this.formData['2'].policyHolderAddressLine1;
                        this.formData['3'].roadtaxAddressLine2 = this.formData['2'].policyHolderAddressLine2;
                        this.formData['3'].roadtaxPostcode = this.formData['2'].addressPostcode;
                        this.formData['3'].roadtaxCity = this.formData['2'].addressCity;
                    } else {
                        this.formData['3'].roadtaxDelRegion = '';
                        this.formData['3'].roadtaxAddressLine1 = '';
                        this.formData['3'].roadtaxAddressLine2 = '';
                        this.formData['3'].roadtaxPostcode = '';
                        this.formData['3'].roadtaxCity = '';
                    }
                },
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
                }
            },
            watch: {
                "formData.2.addressPostcode": _.debounce(async function (postcode) {
                    console.log(postcode)
                    await this.getPostcodesAsync(postcode)
        
                    if (postcode.length === 5 && this.currSelectedPostcode && this.currSelectedPostcode.postcode != postcode) {
                        this.currSelectedPostcode = null;
                    }
        
                    if (postcode.length === 5 && !this.currSelectedPostcode) {
                        let suggestion = this.postcodeSuggestions.find(s => s.postcode == postcode);
                        if (!suggestion) {
                            console.log('postcode not found in suggestions')
                            return;
                        }
                        
                        this.formData['2'].addressCity = suggestion.cityDescription;
                        this.formData['2'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
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
            created: function() {
                const self = this;
        
                // Initialization behavior
                // 1. get underwritten rules
                // 2. get postcodes
                // 3. get countries
                let apiUrl = baseUrl + '/dotCMS/purchase/buynow';
                if (this.developmentMode) {
                    apiUrl = 'https://www.mocky.io/v2/5e7492c13000006800a5f4a3'
                }
        
                $.ajax({
                    method: 'POST',
                    url: apiUrl,
                    dataType: 'json',
                    data: {
                        action: 'underWrittenRule',
                        partnerCode: this.partnerCode,
                        productCode: this.productCode,
                        certificateNo: '',
                        motorSuminsured: ''
                    }
                }).done(function(data) {
                    self.underwrittenRules = data;
                })
        
                $.ajax({
                    method: 'GET',
                    url: this.createDotCMSQueryURL('TieRefCountry', {}, true),
                    dataType: 'json'
                }).done((data) => {
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
                })
        
                $.ajax({
                    method: 'GET',
                    url: this.createDotCMSQueryURL('TieRefState', {}, true),
                    dataType: 'json'
                }).done((data) => {
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
                })
        
                $.ajax({
                    method: 'GET',
                    url: this.createDotCMSQueryURL('TieFPXBank', {}, true),
                    dataType: 'json'
                }).done((data) => {
                    this.banks = _.sortBy(
                        data.contentlets.reduce((acc, content) => {
                            const { bankId, bankName, bankDisplayName, bankImage } = content;
                            acc.push({
                                bankId,
                                bankName,
                                bankDisplayName,
                                bankImage
                            })
                            return acc;
                        }, []),
                        'bankDisplayName'
                    )
                })
                
            },
            mounted: function() {
                this.currStep = this.steps[0]
                this.onSubmit()
                    .then(() => this.onSubmit())
                    .then(() => this.onSubmit())
                    .then(() => this.onSubmit())
                // this.steps[0].showPrescreen = false;
        
                $('.page-loader').fadeOut()
            }
        })
    }
})