import Vue from 'vue';
import { mask, masked } from 'vue-the-mask';
import moment from 'moment';
import Datepicker from 'vuejs-datepicker';
import $ from 'jquery';

import { ValidationProvider, ValidationObserver } from 'vee-validate'

import Countries from '../../spa-assets/json/msig-countries.json';

const baseUrl = 'https://takeiteasy.msig.com.my';

$(function() {
    if ($('#motorcycle-form').length > 0) {
        const motorcycleForm = new Vue({
            el: '#motorcycle-form',
            data: {
                productCode: 'MCY',
                partnerCode: 'msigonline',
                productName: 'Motorcycle',
                steps: [
                    { stepNum: '1', title: 'Get Started', completed: false, showPrescreen: true },
                    { stepNum: '2', title: 'Fill In Details', completed: false },
                    { stepNum: '3', title: 'Choose Add-Ons', completed: false },
                    { stepNum: '4', title: 'REVIEW', completed: false },
                    { stepNum: '5', title: 'PAY', completed: false }
                ],
                formData: {
                    '1': {
                        policyHolderIdType: 'nric',
                        country: '',
                        policyHolderNric: '',
                        motorRegistrationNo: '',
                        agreement: false
                    }
                },
                countries: Countries,
                currStep: null,
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
                ValidationObserver
            },
            directives: {
                mask,
                masked
            },
            methods: {
                setPrescreen(value) {
                    this.steps[0].showPrescreen = value;
                },
                scrollTop() {
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
                async onSubmit() {
                    console.log('submitting')
                    console.log(this.currStep)

                    if (this.currStep.stepNum == '1') {
                        this.checkNCD()
                    }
                    await this.scrollTop();
                    this.currStep.completed = true;
                    this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
                },
                async goToPrevStep() {
                    if (this.steps.indexOf(this.currStep) == 0) {
                        return;
                    }
                    await this.scrollTop();
                    this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                },
                async checkNCD() {
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
                        }
                    }).promise()
                },
                async findVehicleModel(motorMakeCode) {
                    const apiResponse = await $.ajax({
                        method: 'POST',
                        url: baseUrl + '/dotCMS/purchase/buynow',
                        data: {
                            action: 'findCarModel',
                            motorMakeCode: motorMakeCode,
                            productCode: this.productCode
                        }
                    }).promise()

                    // [{"modelDescription":"YZF","productCode":"MCY","modelCode":"05","allowForRenewal":"Y","makeCode":"42","allowForNewBusiness":"Y"}, ...]

                    console.log(apiResponse)
                },
                async findVehicleSumInsured() {
                    const apiResponse = await $.ajax({
                        type: "POST",
                        url: '/dotCMS/purchase/buynow',
                        data: {
                            action: "findMotorcycleSumInsured",
                            partnerCode: this.partnerCode,
                            productCode: $('input[name=productCode]').val(),
                            productName: $('input[name=productName]').val(),
                            motorNxtNcdLevel: $('input[name=motorNxtNcdLevel]').val(),
                            motorNvic: $('input[name=motorNvic]').val(),
                            motorVehicleLocation: $('select[name=motorVehicleLocation]').val(),
                            coverageStartDate : $('input[name=coverageStartDate]').val(),
                            motorCc: $('select[name=motorCc]').val(),
                            motorMakeCode: $('select[name=motorMakeCode]').val(),
                            motorYearOfMake: $('select[name=motorYearOfMake]').val(),
                            motorModelCode: $('select[name=motorModelCode]').val(),
                            motorChassisNo: $('input[name=motorChassisNo]').val(),
                            motorRegistrationNo: $('input[name=motorRegistrationNo]').val(),
                            motorVehiclePremiumValue: $('select[name=motorVehiclePremiumValue]').val(),
                            certificateNo: $('input[name=certificateNo]').val(),
                            policyHolderMalaysian: $('input[name=policyHolderMalaysian]:checked').val(),
                            policyHolderNRIC: $('input[name=policyHolderNRIC]').val(),
                            staffId: $('input[name=staffID]').val(),
                            branchAbbr: $('input[name=branchCode]').val(),
                            staffRelationship: $('select[name=staffRelationship]').val()
                        }
                    }).promise()
                }
            },
            computed: {
                isIdNric: function() {
                    return this.formData['1'].policyHolderIdType === 'nric';
                }
            },
            created: function() {
                const self = this;

                // Initialization behavior
                // 1. get underwritten rules
                // 2. get postcodes
                $.ajax({
                    method: 'POST',
                    url: baseUrl + '/dotCMS/purchase/buynow',
                    data: {
                        action: 'underWrittenRule',
                        partnerCode: this.partnerCode,
                        productCode: this.productCode,
                        certificateNo: '',
                        motorSuminsured: ''
                    }
                }).done(function(data) {
                    self.underwrittenRules = JSON.parse(data);
                })

                $.ajax({
                    method: 'GET',
                    url: baseUrl + '/api/content/render/false/type/json/limit/0/query/+structureName:TieRefCity%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20+live:true/orderby/TieRefCity.postcode',
                }).done(function(data) {
                    console.log("this?", data)
                })
            },
            mounted: function() {
                this.currStep = this.steps[0]
                // this.steps[0].showPrescreen = false;
            }
        })
    }
})