import Vue from 'vue';
import $ from 'jquery';
import _ from 'lodash';
import { mask, masked } from 'vue-the-mask';
import moment from 'moment';
import VueBootstrapTypeahead from 'vue-typeahead-bootstrap/dist/VueBootstrapTypeahead.umd';

// import Datepicker from 'vuejs-datepicker';


import { ValidationProvider, ValidationObserver } from 'vee-validate'
const baseUrl = document.querySelector('input[name=tieBaseUrl]').value;

/**
 * Staff Relation: ['Direct Relationship']
 */
$(function() {
    if ($('#motorcycle-form').length > 0) {
        const motorcycleForm = new Vue({
            el: '#motorcycle-form',
            data: {
                baseUrl,
                productCode: 'MCY',
                partnerCode: $('input[name="partnerCode"]').val(),
                productName: 'Motorcycle',
                steps: [
                    { stepNum: '1', title: 'Get Started', completed: false, showPrescreen: true },
                    { stepNum: '2', title: 'Fill In Details', completed: false },
                    { stepNum: '3', title: 'Choose Add-Ons', completed: false },
                    { stepNum: '4', title: 'REVIEW', completed: false },
                    { stepNum: '5', title: 'PAY', completed: false }
                ],

                // Data pulled in from dotCMS on pageload
                countries: null,
                states: null,

                // Data used by the auto complete
                postcodeSearch: '',
                postcodeSuggestions: [],
                loanProviderSuggestions: [],

                formData: {
                    1: {
                        policyHolderIdType: 'nric',
                        country: '',
                        // policyHolderNric: '870523-06-6009',
                        // motorRegistrationNo: 'VBQ7136',
                        policyHolderNric: '',
                        motorRegistrationNo: '',
                        agreement: false
                    },
                    2: {
                        motorVehicleLocation: '', // a.k.a. state
                        curMktValue: 0,
                        motorLoanProvider: '',
                        policyHolderName: '',
                        policyHolderEmail: '',
                        policyHolderMobileNo: '',
                        policyHolderAddressLine1: '',
                        policyHolderAddressLine2: '',
                        policyHolderGender: '',
                        addressPostcode: '',
                        addressState: '',
                        addressCity: '',
                        policyHolderMaritalStatus: '',
                        policyHolderOccupation: ''
                    },
                    3: {}
                },
                currStep: null,
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
                setPrescreen: function (value) {
                    this.steps[0].showPrescreen = value;
                },
                scrollTop: function () {
                    let defer = $.Deferred()
                    const offset = $("#motorcycle-form").offset().top;
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
                onSubmit: async function () {
                    console.log('submitting')
                    console.log(this.currStep)

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
                        
                        // Find the make information e.g. Toyota, Honda etc
                        const motorMakesFound = await this.findVehicleMakeByCode(motorDetails.motorMakeCode)
                        this.currMotorMakeInfo = motorMakesFound[0]

                        // Find the model information e.g. LC, RC, Wave etc
                        const motorModelsFound = await this.findVehicleModelByCode(motorDetails.motorModelCode)
                        this.foundMotorModels = motorModelsFound;

                        // Might not be needed 
                        const motorNCD = await this.findVehicleNCD(motorDetails.nxtNCDLevel, motorDetails.nxtNCDDiscount)
                        console.log(motorNCD)
                        // Might not be needed

                        const motorSumInsured = await this.findVehicleSumInsured(motorDetails)
                        this.formData['2'] = {
                            ...this.formData['2'],
                            ...motorSumInsured
                        }
                        
                        if (!motorSumInsured.canProceed) {
                            // show the user the form
                            // ' The car sum insured is not available in the system.  Please download the application form <a style="width: auto; height: auto; display: inline-block; line-height: initial; background: transparent;text-decoration:underline" href="../../resource/Motor_ProposalForm.pdf" target="_blank"><b><u> here </u></b></a> and email to us.'
                        } else {
                            
                        }
                    }

                    await this.scrollTop();
                    this.currStep.completed = true;
                    this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
                },
                goToPrevStep: async function () {
                    if (this.steps.indexOf(this.currStep) == 0) {
                        return;
                    }
                    await this.scrollTop();
                    this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                },
                checkNCD: async function () {
                    // 002 server down, cant access info
                    // 005 cant renew due to validity more than 60 days
                    // 007 Please note that you can only purchase a new policy up to 60 days before your current policy renewal date. Please contact 1-800-88-6744 for assistance. For any further enquiries, please email us at msig_online@my.msig-asia.com
                    // 008 made year > 20 years
                    const apiResponse = await $.ajax({
                        method: 'POST',
                        url: baseUrl + '/dotCMS/purchase/buynow',
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
                findVehicleSumInsured: async function (motorDetails) {
                    const apiResponse = await $.ajax({
                        type: "POST",
                        url: baseUrl + '/dotCMS/purchase/buynow',
                        dataType: 'json',
                        data: {
                            action: "findMotorcycleSumInsured",
                            partnerCode: this.partnerCode,
                            productCode: this.productCode,
                            productName: this.productName,
                            motorNxtNcdLevel: this.formData['2'].nxtNCDLevel,
                            motorNvic: this.formData['2'].nvic,
                            motorVehicleLocation: this.formData['2'].motorVehicleLocation,
                            coverageStartDate: this.formData['2'].nxtNCDEffDt, // TODO: CHECK THIS!
                            motorCc: this.formData['2'].motorCc,
                            motorMakeCode: this.formData['2'].motorMakeCode,
                            motorYearOfMake: this.formData['2'].motorYearOfMake,
                            motorModelCode: this.formData['2'].motorModelCode,
                            motorChassisNo: this.formData['2'].motorRiskDataChassisNo,
                            motorRegistrationNo: this.formData['1'].motorRegistrationNo,
                            motorVehiclePremiumValue: '', // TODO: CHECK THIS!
                            certificateNo: '', // TODO: CHECK THIS --> seems to be returned from underwritten rule
                            policyHolderMalaysian: this.formData['1'].policyHolderIdType === 'nric' ? 'Y' : 'N',
                            policyHolderNRIC: this.formData['1'].policyHolderNric,
                            staffId: $('input[name=staffID]').val(),
                            branchAbbr: $('input[name=branchCode]').val(),
                            staffRelationship: $('select[name=staffRelationship]').val()
                        }
                    }).promise()

                    return apiResponse;
                },
                checkBlacklist: async function () {
                    const apiResp = await $.ajax({
                        method: 'POST',
                        url: baseUrl + '/dotCMS/purchase/buynow',
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
                createDotCMSQueryURL: function (structureName, queryObj, isLive) {
                    let endpoint = baseUrl + '/api/content/render/false/type/json/limit/0/query/+structureName:' + structureName;
                    endpoint += '%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)';

                    if (isLive) {
                        endpoint += '%20'
                    }
                    let queryString = ''
                    for (let key of Object.keys(queryObj)) {
                        queryString += `%20+${structureName}.${key}:${queryObj[key]}`
                    }

                    return endpoint + queryString;
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
                },
                getDayName: function (dateString) {
                    return moment(dateString, 'DD/MM/YYYY').format('ddd')
                },
                scrollToError: function () {
                    let $errors = $('.wizard-section-' + this.currStep.stepNum).find('.is-invalid, .error-input');
                    if ($errors.length && $errors.first()) {
                        $("body, html").animate({
                            scrollTop: $errors.first().offset().top - 10
                        }, 500)
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
                }
            },
            watch: {
                "formData.2.addressPostcode": _.debounce(function (postcode) {
                    this.getPostcodesAsync(postcode)
                }, 500),
                "formData.1.policyHolderNric": function (value) {
                    if (this.isIdNric) {
                        this.formData['2'].policyHolderGender = this.nricGender;
                    }
                },
                "formData.2.motorLoanProvider": _.debounce(function (name) {
                    this.getLoanProvidersAsync(name)
                }, 500)
            },
            created: function() {
                const self = this;

                // Initialization behavior
                // 1. get underwritten rules
                // 2. get postcodes
                // 3. get countries
                $.ajax({
                    method: 'POST',
                    url: baseUrl + '/dotCMS/purchase/buynow',
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

                // $.ajax({
                //     method: 'GET',
                //     url: this.createDotCMSQueryURL('TieRefState', {}, true),
                //     dataType: 'json'
                // }).done((data) => {
                //     this.states = _.orderBy(
                //             data.contentlets.reduce((acc, content) => {
                //                 acc.push(content.stateDescription)
                //                 return acc;
                //             }, []),
                //             'asc'
                //         )
                // })

                // $.ajax({
                //     method: 'GET',
                //     url: baseUrl + '/api/content/render/false/type/json/limit/0/query/+structureName:TieRefCity%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20+live:true/orderby/TieRefCity.postcode',
                // }).done(function(data) {
                //     console.log("this?", data)
                // })

                
            },
            mounted: function() {
                this.currStep = this.steps[0]
                // this.steps[0].showPrescreen = false;
            }
        })
    }
})