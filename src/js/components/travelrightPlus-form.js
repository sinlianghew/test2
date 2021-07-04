import Vue from 'vue';
import $ from 'jquery';
import _ from 'lodash';
import { mask, masked } from 'vue-the-mask';
import moment from 'moment';
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap/dist/VueTypeaheadBootstrap.common';

import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { extractDOB, createDotCMSQueryURL, getCardType, scrollTo, getInputValueOrEmpty, getDateUnitWithS} from '../helpers/utilities';
import travelrightPlusSummaryPane from './travelrightPlus-summary-pane';
import Datepicker from 'vuejs-datepicker';
import Swiper from 'swiper/js/swiper.js';
//import Multiselect from 'vue-multiselect';
import MultipleSectionSearch from './MultipleSelection.js';
Vue.component('travelrightplus-summary-pane', travelrightPlusSummaryPane)
//Vue.component('multiselect', Multiselect)
Vue.filter('uppercase', function (value) {
	return value.toUpperCase()
})
const m3paform = new Vue({
    el: '#travelrightPlus-form',
    data: {
        stage: getInputValueOrEmpty("stage"),
        isInIframe: getInputValueOrEmpty("isInIframe"),
        baseUrl: getInputValueOrEmpty("tieBaseUrl"),
        productCode: getInputValueOrEmpty("productCode"),
        partnerCode: getInputValueOrEmpty("partnerCode"),
        prefixMobile: getInputValueOrEmpty("prefixMobile"),
        productName: getInputValueOrEmpty("productName"),
        productGroup: getInputValueOrEmpty("productGroup"),
        branchCode: getInputValueOrEmpty("branchCode"),
        staffId: getInputValueOrEmpty("staffId"),
        staffRelationship: getInputValueOrEmpty("staffRelationship"),
        supportTel: getInputValueOrEmpty("supportTel"),
        thankYouPageUrl: getInputValueOrEmpty("thankYouPageUrl"),
        formula: getInputValueOrEmpty("formula"),
        registrationUrl: getInputValueOrEmpty("registrationUrl"),
        paymentUrl: getInputValueOrEmpty("paymentUrl"),
        summaryUrl: getInputValueOrEmpty("summaryUrl"),
        certificateNo: getInputValueOrEmpty("certificateNo"),
        productMinAge: getInputValueOrEmpty("productMinAge"),
        productMinAgeUnit: getInputValueOrEmpty("productMinAgeUnit"),
        productMaxAge: getInputValueOrEmpty("productMaxAge"),
        productMaxAgeUnit: getInputValueOrEmpty("productMaxAgeUnit"),
        maxCoverDuration: getInputValueOrEmpty("maxCoverDuration"),
        maxCoverDurationUnit: getInputValueOrEmpty("maxCoverDurationUnit"),
        coveragePlan: getInputValueOrEmpty("coveragePlan"),
        coveragePremiumRate: getInputValueOrEmpty("coveragePremiumRate"),
        coveragePremiumUpgradeRate: getInputValueOrEmpty("coveragePremiumUpgradeRate"),
        coveragePremiumType: getInputValueOrEmpty("coveragePremiumType"),
        commissionRate: getInputValueOrEmpty("commissionRate"),
        partnerName: getInputValueOrEmpty("partnerName"),
        productDisclosurePDFUri: getInputValueOrEmpty("productDisclosurePDFUri"),
        isFPXPaymentGateway: getInputValueOrEmpty("isFPXPaymentGateway"),
        isBoostPaymentGateway: getInputValueOrEmpty("isBoostPaymentGateway"), 
        isCreditCardPaymentGateway: getInputValueOrEmpty("isCreditCardPaymentGateway"),          
        partnerUrlTitle: getInputValueOrEmpty("partnerUrlTitle"),
        partnerEmail: getInputValueOrEmpty("partnerEmail"),
        additionalCoverageSpouse:getInputValueOrEmpty("additionalCoverageSpouse"),
        additionalCoverageSpouseMaxAge:getInputValueOrEmpty("additionalCoverageSpouseMaxAge"),
        additionalCoverageSpouseMaxAgeUnit:getInputValueOrEmpty("additionalCoverageSpouseMaxAgeUnit"),
        additionalCoverageSpouseMinAge:getInputValueOrEmpty("additionalCoverageSpouseMinAge"),
        additionalCoverageSpouseMinAgeUnit:getInputValueOrEmpty("additionalCoverageSpouseMinAgeUnit"),
        additionalCoverageSpouseMaxPax:getInputValueOrEmpty("additionalCoverageSpouseMaxPax"),
        additionalCoverageChildMaxAge:getInputValueOrEmpty("additionalCoverageChildMaxAge"),
        additionalCoverageChildMaxAgeUnit:getInputValueOrEmpty("additionalCoverageChildMaxAgeUnit"),
        additionalCoverageChildMinAge:getInputValueOrEmpty("additionalCoverageChildMinAge"),
        additionalCoverageChildMinAgeUnit:getInputValueOrEmpty("additionalCoverageChildMinAgeUnit"),
        additionalCoverageChildMaxPax:getInputValueOrEmpty("additionalCoverageChildMaxPax"),

        wishToRestoreSession: false,
        staffIDInvalid: false,

        // Check for duplicate NRIC or passport
        invalidNricList:[],
        invalidNric: false,  
        errorList:["Invalid NRIC or passport number.", "Invalid phone number"],

        steps: [{
                stepNum: '1',
                title: 'Get Started',
                completed: false,
                showStaffVerification: getInputValueOrEmpty("partnerCode") === 'msigstaff' ? true : false,
                hash: 'prescreen'
            },
            { stepNum: '2', title: 'Plan Selection', completed: false, hash: 'planselection' },
            { stepNum: '3', title: 'Fill in Details', completed: false, hash: 'fillindetails' },
            { stepNum: '4', title: 'Review', completed: false, hash: '' },
            { stepNum: '5', title: 'Pay', completed: false, hash: '' }
        ],
        currStep: null,

        loading: false, // this controls the spinner
        canProceed: true,
        errorMessage: null,
        firstScreenError: '',

        // Data pulled in from dotCMS on pageload
        countries: null,
        states: null,
        banks: null,
        pidm:null,
        otherClaims:['Personal Accident','Medical Expenses','Travel Cancellation/Curtailment','Travel/Luggage Delay','Loss/Damage to Luggage & Personal','Others'],
        travelRightPlusCountries:null,

        // Data used by the auto complete
        postcodeSearch: '',
        postcodeSuggestions: [],
        currSelectedPostcode: '',
        isNotKnownPostcode: false,

        currentPreScreen:1,
        newBusinessOrRenewal:'',
        promoCodeInvalid:false,
        
        // dont add enter or next line in formData, will getting error
        formData: {
            1: {
                policyHolderIdType: 'nric',
                policyHolderCountry: '',
                policyHolderNric: '',
                policyHolderDateOfBirth: '',
                displayDateOfBirth: '',
                policyHolderGender:'',
                agreement: false,
            },
            2: {               
                coverageStartDate: '',
                coverageEndDate: '',
                //formattedCoverageStartDate: '',
                //formattedCoverageEndDate: '',
                
                daysOfCoverage: '365',
                planName:'',

                planOption:'',
                basePremium: '0',

                discountAmount: '0',   
                discountRate: getInputValueOrEmpty("discountRate"), 
                serviceTaxRate: getInputValueOrEmpty("serviceTaxRate"),             
                subTotal:'',
                serviceTax:'',
                stampDuty:'0.00',

                totalPayable:'0.00',
                //planCode:'',
                sst: 'N',
                coverageType:'single',
                coverageArea:'',
                //dayInsuredNum: '1',
                destinationDesc: [],
                destinationDescValid:true,
            },
            3: {
                policyHolderName:'',
                policyHolderEmail:'',
                policyHolderMobileNo:'',
                policyHolderAddressLine1:'',
                policyHolderAddressLine2:'',
                addressPostcode:'',
                addressCity:'',
                addressState:'',
                addressStateCode: '',
                policyHolderCountry:'',
                policyHolderGender:'',
                policyHolderDateOfBirth:'',
                familyMembers: [],
                personInsuredNum: 1,
            },
            4: {
                tncAgreement: '',
                isRiderDetailsEditMode: false,
                purchaseTempId: '',
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

                // extra for foreigner
                policyHolderCountry:'',
                policyHolderGender:'',
                policyHolderDateOfBirth:'',
                membershipID: '',
                staffId: '',
                staffRelationship: '',
                commission: '',
                commissionAgreement: '',
                bankerName: '',
                bankerBranch: '',
                promoCode: '',
                successApplyPromo:false,
                otherHealthcareInsurance: [],
                insuranceClaims: [],
                otherClaimType: '',
                claimDescCharNum: 50,
                benefitConditionAgreement: '',
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

        copyOfNricOrPassport: null,
        copyOfVehicleRegNum: null,

        plan1DisplayPremium:'',
        plan2DisplayPremium:'',

        question1Valid:true,
        question2Valid:true,
        question1DescValid:true,
        question2DescValid:true,

        multipleSelection:null,  //country
        otherInsurancePIDMListMultiSelect: null,
        otherClaimListMultiSelect: null,

    },
    components: {
        ValidationProvider,
        ValidationObserver,
        VueTypeaheadBootstrap,
        Datepicker,
    },
    directives: {
        mask,
        masked
    },
    created() {
        window.addEventListener('resize',this.matchHeightElement);
    },
    destroyed() {
        window.removeEventListener('resize', this.matchHeightElement);
    },
    methods: {
        addFamily: function(){
            var spouseMaxPax = parseInt(this.additionalCoverageSpouseMaxPax) || 0;
            var childMaxPax = parseInt(this.additionalCoverageChildMaxPax) || 0;
            var totalMaxPax =  spouseMaxPax + childMaxPax
            console.log("see total max pax: "+totalMaxPax);
            if(this.formData['3'].personInsuredNum <= totalMaxPax){
                this.formData['3'].personInsuredNum += 1;
                var fields = {
                    relationToCustomer: this.isSpouse ? 'Child' : 'Spouse',
                    nationality: 'Y',
                    country: '',
                    name: '',
                    nric: '',
                    dateOfBirth: ''
                };
                this.formData['3'].familyMembers.push(fields);   
    
                //calculate premium
                this.calculatePremium();
            }
            else{
                $(this.$el).find('#family-member-limit').modal('show')
                //console.log("You may only have a maximum of 6 family members including yourself under the plan.")
                return;
            }

            
        },
        removeFamily: function(val){
            if(this.formData['3'].personInsuredNum > 1){
                this.formData['3'].personInsuredNum -= 1;
                if(this.formData['3'].familyMembers.length>0){
                    this.formData['3'].familyMembers.splice(val, 1);
                }
    
                //calculate premium
                this.calculatePremium();
            }
            else{
                return;
            }
          
        },

        openDateFamilyMembers: function(relation){
			var date = new Date();
			if(relation=="Spouse"){
				date = new Date(date.getFullYear() -35, date.getMonth(), date.getDate()-1);
			}
			else if(relation=="Child"){
				date = new Date(date.getFullYear() -9, date.getMonth(), date.getDate()-1);
			}
			return date;
		},
		 disabledDateFamilyMembers: function(relation){
    	    var date = new Date();
    	    var date2 = new Date();
    	    var coverageStartDate= this.formData['2'].coverageStartDate;

            console.log("relation is: "+relation);
    		if(relation=="Spouse"){
                var spouseMaxAge = parseInt(this.additionalCoverageSpouseMaxAge) || 70;
                var spouseMinAge = parseInt(this.additionalCoverageSpouseMinAge) || 18;
    		    return {
                    from: moment().endOf('year').subtract(spouseMinAge, getDateUnitWithS(this.additionalCoverageSpouseMinAgeUnit)).toDate(),
                    to: moment().startOf('year').subtract(spouseMaxAge, getDateUnitWithS(this.additionalCoverageSpouseMaxAgeUnit)).toDate()
    		    }
    		    
    		}
    		else if(relation=="Child"){
                var childMaxAge = parseInt(this.additionalCoverageChildMaxAge) || 17;
                var childMinAge = parseInt(this. additionalCoverageChildMinAge) || 31;
    			date = new Date(coverageStartDate.getFullYear() - childMaxAge, coverageStartDate.getMonth(), coverageStartDate.getDate());
                if(this.additionalCoverageChildMinAgeUnit == "years" || this.additionalCoverageChildMinAgeUnit =="year"){
                    date2 = new Date(coverageStartDate.getFullYear() - childMinAge, coverageStartDate.getMonth(), coverageStartDate.getDate());
                }else{
    			    date2 = new Date(coverageStartDate.getFullYear(), coverageStartDate.getMonth(), coverageStartDate.getDate() - childMinAge);
                }
    		    return {
                    from: moment().subtract(childMinAge, getDateUnitWithS(this.additionalCoverageChildMinAgeUnit)).toDate(),
                    to: moment().startOf('year').subtract(childMaxAge, getDateUnitWithS(this.additionalCoverageChildMaxAgeUnit)).toDate()
    		    }
    		}
    	  },
        callMultipleSelect:function(){ // this is for country
            this.multipleSelection.setupEvents();
            var vueThis = this;	
            if(this.formData['2'].destinationDesc.length > 0){	
                this.formData['2'].destinationDesc.forEach(function(item){	
                    vueThis.multipleSelection.selected.push(item)	
                });	
                this.multipleSelection.hideSelectedCountry();	
            }	
            if($( "#country-wrapper" )){	
                $( "#country-wrapper" ).on("focusin",function() {	
                    $( "#country-input" ).on("input",function(){	
                        if(!vueThis.formData['2'].destinationDescValid){	
                            vueThis.formData['2'].destinationDescValid = true;	
                        }	
                    })
                });
                console.log("vue this destination desc: "+this.formData['2'].destinationDesc.length)
                $( "#country-wrapper" ).on("focusout",function() {	
                    vueThis.$nextTick(function(){	
                        console.log("jquery this destination desc: "+vueThis.formData['2'].destinationDesc.length)
                        if(vueThis.formData['2'].destinationDesc.length > 0){	
                            vueThis.formData['2'].destinationDescValid = true;	
                        }else{	
                            console.log("focus out: "+vueThis.formData['2'].destinationDesc.length);
                            vueThis.formData['2'].destinationDescValid = false;	
                        }
                    });
                });	
            }	
                
            this.$nextTick(function(){	
                if(this.formData['2'].destinationDesc.length > 0){	
                    $("#section-country-container #input-wrapper #country-input").addClass("hidePlaceHolder");	
                }	
            });
        },
        callOtherInsurancePidmMultiSelect:function(){
            this.otherInsurancePIDMListMultiSelect.setupEvents();
            var vueThis = this;	
            if(this.formData['4'].otherHealthcareInsurance.length>0){
                this.formData['4'].otherHealthcareInsurance.forEach(function(item){
                    vueThis.otherInsurancePIDMListMultiSelect.selected.push(item);
                });
                this.otherInsurancePIDMListMultiSelect.hideSelectedCountry();	
            }
        },
        addSelectCountry: function(val) {
            //this.formData.selectedCountries.push(val);
            this.formData['2'].destinationDesc.push(val);
         },
         removeSelectCountry: function(val) {
            this.formData['2'].destinationDesc = this.formData['2'].destinationDesc.filter(function(country) {
                return country.toLowerCase() !== val.toLowerCase();
             })
         },
        addSelectOtherInsurance:function(val){
            this.formData['4'].otherHealthcareInsurance.push(val);
        },
        removeSelectOtherInsurance:function(val){
            this.formData['4'].otherHealthcareInsurance = this.formData['4'].otherHealthcareInsurance.filter(function(l){
                return l.toLowerCase() !== val.toLowerCase();
            })
        },
        addSelectTypeOfClaims:function(val){
            this.formData['4'].insuranceClaims.push(val);
        },
        removeSelectTypeOfClaims:function(val){
            this.formData['4'].insuranceClaims = this.formData['4'].insuranceClaims.filter(function(c){
                return c.toLowerCase() !== val.toLowerCase();
            })
        },
        setNextPrescreenQuestion:async function(){
            if(this.currentPreScreen == 1){
                this.steps[0].showPrescreen = false;
                
            }else if(this.currentPreScreen == 2){
               const valid = await this.$refs.form.validate();
               if(valid){
                   this.loading = true;
               }else{
                   return;
               }
            }else if(this.currentPreScreen == 3){
                const valid = await this.$refs.form.validate();
                if(valid && this.formData['1'].prescreenYesNo != ""){
                    this.loading = true;
                }else{
                    this.question1Valid=false;
                    return;
                }
                if(this.formData['1'].prescreenYesNo == "Y"){
                    this.canProceed = false;
                    this.firstScreenError= false;
                    return;
                }
                
            }else if(this.currentPreScreen == 4){
                if($(".forceSetHeightMobileMultiSelect")){
                    $(".forceSetHeightMobileMultiSelect").css("height","auto");
                }
                if(this.formData['1'].prescreenYesNo2 != ""){
                    this.loading = true;
                }else{
                    this.question2Valid=false;
                    return;
                }

                if(this.formData['1'].prescreenYesNo2 == "Y"){
                    if(this.formData['1'].otherHealthcareInsurance.length<1){
                        this.question2DescValid=false;
                        this.loading = false;
                        return;
                    }
                }
            }

            if(this.currentPreScreen < 4){
                this.$nextTick(function(){
                    this.currentPreScreen = this.currentPreScreen + 1;
                    this.loading = false;
                });     
            }
        },
        setPrevPreScreenQuestion:function(){
            if(this.currentPreScreen == 4){
                if($(".forceSetHeightMobileMultiSelect")){
                    $(".forceSetHeightMobileMultiSelect").css("height","auto");
                }
            }
            if(this.currentPreScreen <= 4 && this.currentPreScreen > 0){
                this.currentPreScreen = this.currentPreScreen - 1;
                this.loading = false;
            }

        },
        openDate:function (){
            //moment().subtract(16, "years").toDate()
            var date = new Date();
            date = new Date(date.getFullYear() - 35, date.getMonth(),date.getDate() - 1);
            return date;
        },
        fpxMaintenance:function(){
            // wj - FPX hide
            if (this.isFPXPaymentGateway === "false") {
                if(this.isCreditCardPaymentGateway === "true"){
                    this.formData['5'] = {
                        //abmbGateway msigCentralizedMastercardPaymentGateway
                        paymentMethod: 'msigCentralizedMastercardPaymentGateway',// temporary put abmb
                        bankId: '',
                        fpxEmail: '',
                        cardHolderName: '',
                        ccNo: '',
                        expiry: '',
                        cvv: '',
                        ewalletVendor: null,
                    }
                }
                else{
                    this.formData['5'] = {
                        //abmbGateway msigCentralizedMastercardPaymentGateway
                        paymentMethod: 'ewalletPaymentMethod',// temporary put abmb
                        bankId: '',
                        fpxEmail: '',
                        cardHolderName: '',
                        ccNo: '',
                        expiry: '',
                        cvv: '',
                        ewalletVendor: null,
                    }
                }
            } else {
                this.formData['5'] = {
                    paymentMethod: 'fpxPaymentGateway',
                    bankId: '',
                    fpxEmail: '',
                    cardHolderName: '',
                    ccNo: '',
                    expiry: '',
                    cvv: '',
                    ewalletVendor: null,
                }
            }
            // wj - FPX hide end
        },
        checkNric (){
            if (this.invalidNricList.includes(this.formData['1'].policyHolderNric.replace(/-/g,""))) this.invalidNric = true;
            else this.invalidNric = false;
        },

        updateDateOfBirth (){
            let tempDob = new Date (this.policyHolderDob);
            this.formData['1'].displayDateOfBirth = String(tempDob.getDate()).padStart(2,'0') + '/' + String(tempDob.getMonth()+1).padStart(2,'0') + '/' + tempDob.getFullYear();
        },

        updatePolicyHolderGender(){
            if (this.isIdNric) {
                const last4Digits = this.formData['1'].policyHolderNric.split('-')[2]
                if (last4Digits % 2 === 1){
                    this.formData['3'].policyHolderGender = 'M'
                }else{
                    this.formData['3'].policyHolderGender = 'F'
                }
            }
        },
        togglePolicyHolderDetailsEditMode() {
            this.formData['4'].isRiderDetailsEditMode = true;
            $(".summaryBack").addClass("disabled");
            $(".summaryCheckout").addClass("disabled");            
            
        },

        // Function for swiper start
        initializeSwiper(){
            var _this = this;

            this.swiperData = new Swiper('.swiper-container', {    
                simulateTouch: false,

                slidesPerView: this.slidesPerView,
                slidesPerGroup: this.slidesPerGroup,
                slidesOffsetAfter: this.slidesOffsetAfter,
                spaceBetween: this.spaceBetween,

                preventClicks: true,
                preventClicksPropagation: false,

                breakpoints: {
                    0: {
                        slidesPerView: 'auto',
                        slidesPerGroup: 1,
                        slidesOffsetAfter: 62,
                        spaceBetween: 11
                    },
                    360: {
                        slidesPerView: 'auto',
                        slidesPerGroup: 1,
                        slidesOffsetAfter: 68,
                        spaceBetween: 11
                    },
                    400: {
                        slidesPerView: 'auto',
                        slidesPerGroup: 1,
                        slidesOffsetAfter: 68,
                        spaceBetween: 11
                    },
                    745: {
                        slidesPerView: 2.23,
                        slidesPerGroup: 2,
                        slidesOffsetAfter: 72,
                        spaceBetween: 8
                    },
                    974: {
                        slidesPerView: 2.23,
                        slidesPerGroup: 2,
                        slidesOffsetAfter: 64,
                        spaceBetween: 8
                    },
                    1186: {
                        slidesPerView: 3.32,
                        slidesPerGroup: 3,
                        slidesOffsetAfter: 73,
                        spaceBetween: 15
                    }
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                on:{
                    init: function(){
                        _this.$nextTick(function(){
                            // for swiper with 3 plans in 1 page
                            if($(window).width() > 1186 && _this.swiperData.params.slidesPerGroup == 3){
                                /* sl temp comment
                                if(_this.swiperData.realIndex == 0){
                                    _this.swiperData.slides[2].classList.add('swiper-slide-third');
                                    _this.swiperData.slides[5].classList.remove('swiper-slide-third');
                                }
                                else if(_this.swiperData.realIndex == 3){
                                    _this.swiperData.slides[2].classList.remove('swiper-slide-third');
                                    _this.swiperData.slides[5].classList.add('swiper-slide-third');
                                }
                                */
                            }

                            var index = parseInt(_this.formData['2'].optAddOnName) - 1;
                            if(index < 0){
                                index = 0;
                            }
                            _this.swiperData.slideTo(index);
                        });
                    },
                    resize: function(){
                        // for swiper with 3 plans in 1 page
                        /* sl temp comment
                        if($(window).width() > 1186 && _this.swiperData.params.slidesPerGroup == 3){
                            if(_this.swiperData.realIndex == 0){
                                _this.swiperData.slides[2].classList.add('swiper-slide-third');
                                _this.swiperData.slides[5].classList.remove('swiper-slide-third');
                            }
                            else if(_this.swiperData.realIndex == 3){
                                _this.swiperData.slides[2].classList.remove('swiper-slide-third');
                                _this.swiperData.slides[5].classList.add('swiper-slide-third');
                            }
                        }
                        else if($(window).width() <= 1186 && _this.swiperData.params.slidesPerGroup != 3){
                            _this.swiperData.slides[2].classList.remove('swiper-slide-third');
                            _this.swiperData.slides[5].classList.remove('swiper-slide-third');
                        }
                        */
                        var index = parseInt(_this.formData['2'].optAddOnName) - 1;
                        if(index < 0){
                            index = 0;
                        }
                        _this.swiperData.slideTo(index);
                    },
                    realIndexChange: function(){
                        // for swiper with 3 plans in 1 page
                        if($(window).width() > 1186 && _this.swiperData.params.slidesPerGroup == 3){
                            if(_this.swiperData.realIndex == 0){
                                _this.swiperData.slides[2].classList.add('swiper-slide-third');
                                _this.swiperData.slides[5].classList.remove('swiper-slide-third');
                            }
                            else if(_this.swiperData.realIndex == 3){
                                _this.swiperData.slides[2].classList.remove('swiper-slide-third');
                                _this.swiperData.slides[5].classList.add('swiper-slide-third');
                            }
                        }
                    }
                },
            });
        },
        // Function for swiper end

        calculatePremium: function () {
            var memberRelArr = new Array();
            if(this.formData['3'].familyMembers.length>0){
                this.formData['3'].familyMembers.map(function(f){
                    console.log(f.relationToCustomer);
                    memberRelArr.push(f.relationToCustomer)
                })
                console.log("zzz: "+memberRelArr.toString());
            }
            var _this = this;
            return $
                .ajax({
                    method: 'POST',
                    url: this.baseUrl + '/dotCMS/purchase/buynow',
                    data: {
                        action: "calculatePremium",
                        partnerCode: this.partnerCode,
                        productCode: this.productCode,
                        productName: this.productName,
                        policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                        policyHolderNRIC: this.formData['1'].policyHolderNric,
                        policyHolderDateOfBirth: this.policyHolderDOBStringFormat,

                        memberRelationship:memberRelArr.join(),
                        //staffRelationship: this.staffRelationship,
                        travelBenefitPlan: this.formData['2'].planName,
                        travelPlan: this.formData['2'].coverageType,
                        travelArea: "area"+this.formData['2'].coverageArea,

                        //promotionCode: this.formData['4'].promoCode,
                        formula: 'travelright-plus',
                        certificateNo: this.certificateNo, // to check if needed
                        policyHolderGender: this.policyHolderGender,
                        coverageStartDate:this.covertToStringFormatDate(this.formData['2'].coverageStartDate),//this.formData['2'].formattedCoverageStartDate,
                        coverageExpiryDate: this.covertToStringFormatDate(this.formData['2'].coverageEndDate),//this.formData['2'].formattedCoverageEndDate      
                    },
                }).done(function( data ) {
                    if(data){
                        var dataParse = JSON.parse(data);
                        _this.formData['2'].basePremium = dataParse.grossPremium.toFixed(2);
                        _this.formData['2'].subTotal = dataParse.discountablePremium.toFixed(2);
                        _this.formData['2'].serviceTax = dataParse.sstAmount.toFixed(2);
                        _this.formData['2'].serviceTaxRate = dataParse.sst.toFixed(0);
                        _this.formData['2'].stampDuty = dataParse.stampDuty.toFixed(2);
                        _this.formData['2'].totalPayable = dataParse.totalPayable.toFixed(2);
                        _this.formData['2'].discountAmount = dataParse.discountAmount ? dataParse.discountAmount.toFixed(2):0;
                    }else{
                        console.log("%c no data la","color:red");
                    }
                  }).fail(function() {
                        console.log( "error on calculate premium" );
                  });
        },

        calculateTravelPlanPremium: async function (plan) {
            var _this = this;
            return $
                .ajax({
                    method: 'POST',
                    url: this.baseUrl + '/dotCMS/purchase/buynow',
                    data: {
                        action: "calculatePremium",
                        partnerCode: this.partnerCode,
                        productCode: this.productCode,
                        productName: this.productName,
                        policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                        policyHolderNRIC: this.formData['1'].policyHolderNric,
                        policyHolderDateOfBirth: this.policyHolderDOBStringFormat,
                        travelBenefitPlan: plan,
                        travelPlan: this.formData['2'].coverageType,
                        travelArea: "area"+this.formData['2'].coverageArea,

                        formula: 'travelright-plus',
                        coverageStartDate:this.covertToStringFormatDate(this.formData['2'].coverageStartDate),//this.formData['2'].formattedCoverageStartDate,
                        coverageExpiryDate: this.covertToStringFormatDate(this.formData['2'].coverageEndDate),//this.formData['2'].formattedCoverageEndDate      
                    },
                }).done(function( data ) {
                    if(data){
                        var dataParse = JSON.parse(data);
                        console.log("see calculateTravelPlanPremium")
                        console.log(data);
                        if(dataParse.coveragePlan == "1"){
                            _this.plan1DisplayPremium = dataParse.grossPremium.toFixed(2);
                        }else if(dataParse.coveragePlan == "2"){
                            _this.plan2DisplayPremium = dataParse.grossPremium.toFixed(2);
                        }
                    }else{
                        console.log("%c no data la - calculateTravelPlanPremium","color:red");
                    }
                  }).fail(function() {
                        console.log( "error on calculateTravelPlanPremium" );
                  });
        },
        covertToStringFormatDate: function(inputDate){
            if(inputDate){
                let tempDate = new Date (inputDate);
                return String(tempDate.getDate()).padStart(2,'0') + '/' + String(tempDate.getMonth()+1).padStart(2,'0') + '/' + tempDate.getFullYear();
            }else{
                return "";
            }
        },
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
                        prescreenYesNo: this.formData['1'].prescreenYesNo, //hardcode
                        prescreenYesNo2: this.formData['1'].prescreenYesNo2, //hardcode 

                        otherHealthcareInsurance:this.formData['1'].otherHealthcareInsurance.toString(),
                        destinationDesc: this.formData['2'].destinationDesc.toString(),

                        staffRelationship: this.staffRelationship,
                        isInIframe: this.isInIframe,
                        gstRate: 'N',
                        sstRate: 'N',
                        destSelect: 'N',
                        formula: 'travelright-plus',
                        certificateNo: this.certificateNo, // to check if needed
                        dpfStatus: 'false',
                        flexiPlan: '',
                        additionalPlanA: '',
                        additionalPlanB: '',
                        additionalPlanC: '',
                       
                        additionalPlan07: '',
                        additionalPlan14: '',
                        additionalPlan21: '',
                        agreeToTnC: 'Y',

                        membershipID:this.formData['4'].membershipID,
                        staffId: this.formData['4'].staffId,
                        staffRelationship: this.formData['4'].staffRelationship,

                        coverageStartDate: this.covertToStringFormatDate(this.formData['2'].coverageStartDate),//this.formData['2'].formattedCoverageStartDate, 
                        coverageExpiryDate: this.covertToStringFormatDate(this.formData['2'].coverageEndDate),//this.formData['2'].formattedCoverageEndDate, 
                        policyHolderName: this.formData['3'].policyHolderName, //
                        policyHolderNRIC: this.formData['1'].policyHolderNric,

                        policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                        policyHolderGender: this.policyHolderGender,
                        policyHolderDrivingExp: '',
                        policyHolderDateOfBirth: this.policyHolderDOBStringFormat,
                        policyHolderNationality: this.formData['1'].policyHolderCountry ? this.formData['1'].policyHolderCountry : 'MAL',
                        policyHolderEmail: this.formData['3'].policyHolderEmail, //
                        policyHolderMobileNo: this.mobileNumber,
                        policyHolderMaritalStatus: '',
                        
                        photo: '',
                        policyHolderAddressLine1: this.formData['3'].policyHolderAddressLine1, //
                        policyHolderAddressLine2: this.formData['3'].policyHolderAddressLine2, //
                
                        refAddress1: '',
                        refAddress2: '',
                        addressOverwriteIndicator: '',
                        addressPostcode: this.formData['3'].addressPostcode, //
                        addressState: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).stateCode, //
                        addressCity: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).cityCode, //
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
                        
                        coveragePlan: this.formData['2'].planName,
                        
                        coveragePremiumRate: 0,
                        branchAbbr: this.branchCode,
                        employeeBranch: this.formData['4'].bankerBranch,
                        //staffName: '',
                        agentNumber: '',
                        coveragePremiumType: 'default',
                        travelPlan: '',
                        travelArea: '',
                        travelBenefitPlan: '',
                        coveragePremiumDiscount: this.formData['2'].discountAmount, //
                        coverageStampDuty: this.formData['2'].stampDuty, //
                        noDaysCovered: this.formData['2'].daysOfCoverage, //
                        totalPremium: this.formData['2'].totalPayable, //
                        //memberName: this.formData['3'].policyHolderName, //
                        //memberIdNo: this.formData['1'].policyHolderNric,
                        //memberIsMalaysian: this.isIdNric ? 'Y' : 'N',
                        memberName: '',
                        memberIdNo: '',
                        memberIsMalaysian: '',
                        //memberGender: this.policyHolderGender,
                        memberGender: '',
                        memberRelationship: '',
                        driverRelationship: '',
                        //memberDOB: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                        memberDOB: '',
                        memberMotorDrivingExperience: '',
                        memberOccupation: '',
                        memberPetBreed: '',
                        memberPetMicrochipId: '',
                        memberPhoto: '',
                        basicPremium: this.formData['2'].basePremium, //
                        ncdAmount: '',
                        netNcdAmount: '',
                        annualPremium: '',
                        excess: '',
                        sst: '',
                        sstVal: '',
                        
                        stampDuty: this.formData['2'].stampDuty,//
                        grandTotal: this.formData['2'].totalPayable, //

                        commissionAgreement: this.formData['4'].commissionAgreement,

                        staffName: this.formData['4'].bankerName,
                        employeeBranch: this.formData['4'].bankerBranch,
                        promotionCode: this.formData['4'].promoCode,
                    },
                    success: function (data) {
                        console.log("data obtained from initiatePayment");
                        console.log(data)
                        //window.location.href = "http://localhost:8080/miniPA-payment.html?action=processPurchase&actionType=Step1";
                    }
                })
                .promise()
        },

         
        /* jw - mini PA end */
        createDotCMSQueryURL,
        findCountryByCode(code) {
            if (!this.countries) return ''
            return this.countries.find(c => c.code === code)
        },

        saveSession() {
            const state = {
                canProceed: this.canProceed,
                steps: this.steps,
                currStep: this.currStep,
                formData: this.formData,

                //multipleSelection: this.multipleSelection,
                
                postcodeSearch: this.postcodeSearch,
                postcodeSuggestions: this.postcodeSuggestions,
                currSelectedPostcode: this.currSelectedPostcode,
                
                loanProviderSuggestions: this.loanProviderSuggestions,
                currentPreScreen: this.currentPreScreen,

                plan1DisplayPremium: this.plan1DisplayPremium,
                plan2DisplayPremium: this.plan2DisplayPremium,

            }
            window.sessionStorage.setItem('m3pa_data', JSON.stringify(state));
        },
        async maybeRestoreSession() {
            const state = JSON.parse(window.sessionStorage.getItem('m3pa_data'))
            if (this.stage !== 'registration' && !state) return this.canProceed = false;
            if (state && !state.canProceed) {
                return this.canProceed = false

            } else {
                let activeStep
                if (state) {
                    activeStep = this.getActiveStep(state.steps);
                }
                if (activeStep) {
                    const prevStep = state.steps.find(s => parseInt(activeStep.stepNum) - 1 === parseInt(s.stepNum))
                    if (prevStep && prevStep.completed) {
                        this.canProceed = state.canProceed;
                        this.steps = state.steps;
                        this.currStep = activeStep;
                        this.formData = state.formData;

                        //this.multipleSelection = state.multipleSelection;

                        this.postcodeSearch = state.postcodeSearch;
                        this.postcodeSuggestions = state.postcodeSuggestions;
                        this.currSelectedPostcode = state.currSelectedPostcode;
                        
                        this.currentPreScreen = state.currentPreScreen;
                        
                        this.plan1DisplayPremium = state.plan1DisplayPremium;
                        this.plan2DisplayPremium = state.plan2DisplayPremium;

                        this.$nextTick(() => this.rowMatchHeight())
                        this.$nextTick(function(){this.matchHeightElement();});
                        return;
                    }
                }
            }

            this.currStep = this.steps[0]
            window.location.hash = this.currStep.hash;
            sessionStorage.removeItem('m3pa_data')
        },
        getActiveStep(steps) {
            const hash = window.location.hash.replace('#', '');
            const stage = this.stage;

            if (hash && stage === 'registration') {
                return steps.find(s => s.hash === hash)
            } else {
                switch (stage) {
                    case 'summary':
                        return steps.find(s => s.stepNum === '4')
                    case 'payment':
                        return steps.find(s => s.stepNum === '5')
                }
            }
        },
        customDateFormatter: function customDateFormatter(){
            return moment().format('DD/MM/YYYY');
        },
        customDateFormatterWithDay: function customDateFormatterWithDay(){
            return moment().format('DD/MM/YYYY (ddd)');
        },
        scrollTop() {
            return new Promise((resolve, reject) => {
                const offset = $("#travelrightPlus-form").offset().top;
                if (window.scrollY < 100) {
                    return resolve()
                }
                scrollTo(offset).then(() => resolve())
            })
        },
        resetForm: function() {
            this.steps
                .filter(step => !['1'].includes(step.stepNum))
                .forEach(step => step.completed = false)

            this.postcodeSearch = '';
            this.postcodeSuggestions = [];
            this.currSelectedPostcode = '';
            this.isNotKnownPostcode = false;

            this.question1Valid = true;
            this.question2Valid = true;
            this.question1DescValid = true;
            this.question2DescValid = true;
            
            this.formData['2'] = {
                coverageStartDate: '',
                coverageEndDate:'',
                daysOfCoverage: '365',
                
                planName:'',
                basePremium:'0',
                discountAmount:'0',
                planCode:'',
                discountRate: getInputValueOrEmpty("discountRate"),
                serviceTaxRate: getInputValueOrEmpty("serviceTaxRate"),             

                subTotal:'',
                serviceTax:'',
                stampDuty:'0.00',

                totalPayable:'',

                coverageType:'single',
                coverageArea:'',
                //dayInsuredNum:'1',
                destinationDesc:[],
                destinationDescValid:true,
            }

            this.formData['3'] = {
                // jw - mini PA
                policyHolderName:'',
                policyHolderEmail:'',
                policyHolderMobileNo:'',
                policyHolderAddressLine1:'',
                policyHolderAddressLine2:'',
                addressPostcode:'',
                addressCity:'',
                addressState:'',
                addressStateCode: '',

                // extra for foreigner
                policyHolderCountry:'',
                policyHolderGender:'',
                policyHolderDateOfBirth:'',

                personInsuredNum: 1,
                familyMembers: [],
                personInsuredNum: 1
            }

            this.formData['4'] = {
                tncAgreement: "",
                isRiderDetailsEditMode: false,
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

                // extra for foreigner
                policyHolderCountry:'',
                policyHolderGender:'',
                policyHolderDateOfBirth:'',

                purchaseTempId:'',

                commissionAgreement: '',

                bankerName: '',
                bankerBranch: '',
                promoCode: '',

                otherHealthcareInsurance: [],
                insuranceClaims: [],
                otherClaimType: '',
                claimDescCharNum: 50,
                benefitConditionAgreement: '',
            }
           this.fpxMaintenance();
            this.saveSession()
        },
        onSubmit: async function () {
            this.loading = true;

            if (this.currStep.stepNum == '1') {

                 if (this.copyOfNricOrPassport !== this.formData['1'].policyHolderNric) {
                    this.resetForm();
                    this.formData['3'].policyHolderCountry = this.formData['1'].policyHolderCountry;       
                }
                if(this.formData['1'].policyHolderIdType !== 'nric'){
                    this.formData['3'].policyHolderDateOfBirth = this.formData['1'].policyHolderDateOfBirth;
                }

                this.checkNric();
                this.updatePolicyHolderGender();

            } else if (this.currStep.stepNum == '2') {
                this.updateDateOfBirth();

                if(this.formData['2'].destinationDesc.length < 1){
                    this.formData['2'].destinationDescValid = false;
                    this.loading = false;
                    return;
                }

            } else if (this.currStep.stepNum == '3') {
                this.formData['4'].policyHolderName = this.formData['3'].policyHolderName;
                this.formData['4'].policyHolderEmail = this.formData['3'].policyHolderEmail;
                this.formData['4'].policyHolderMobileNo = this.formData['3'].policyHolderMobileNo;
                this.formData['4'].policyHolderAddressLine1 = this.formData['3'].policyHolderAddressLine1;
                this.formData['4'].policyHolderAddressLine2 = this.formData['3'].policyHolderAddressLine2;
                this.formData['4'].addressPostcode = this.formData['3'].addressPostcode;
                this.formData['4'].addressState = this.formData['3'].addressState;
                this.formData['4'].addressStateCode = this.formData['3'].addressStateCode;
                this.formData['4'].addressCity = this.formData['3'].addressCity;
                
                this.formData['4'].policyHolderGender = this.formData['3'].policyHolderGender;
                if (!this.isIdNric){
                // extra for foreigner
                this.formData['4'].policyHolderCountry = this.formData['3'].policyHolderCountry;
                //new Date(moment(this.formData['3'].policyHolderDateOfBirth).format('DD/MM/YYYY'));
                this.formData['4'].policyHolderDateOfBirth = this.formData['3'].policyHolderDateOfBirth;
                this.formData['1'].policyHolderCountry = this.formData['3'].policyHolderCountry;
                
                }

                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep.completed = true;
                this.saveSession();
                // no need purchase yet for mini PA
                this.processPurchaseStep1();
                await this.scrollTop();
                return;

            } else if (this.currStep.stepNum == '4') {
                //window.location.href = "http://localhost:8080/miniPA-payment.html?action=processPurchase&actionType=Step1";// tempo uncomment
                const response = await this.initiatePayment();   
                console.log(response);             
                const $errorFormWrapper = $(`<div id="error-form-wrapper">${response}</div>`);                

                if ($($errorFormWrapper).find('form').length == 0){
                    let tempError = $($errorFormWrapper).find('li').html();
                    if(tempError){
                        //let startSlice = tempError.indexOf('.')+1;
                        //this.errorMessage = tempError.substr(tempError.indexOf('.')+1, tempError.length-(startSlice+3));
                        this.errorMessage = tempError;
                    }
                    this.canProceed = false;
                    sessionStorage.removeItem('m3pa_data');
                    return;
                }

                $errorFormWrapper.find('form').attr('action', this.paymentUrl);
                $(this.$el).find('#error-form-placeholder').html($errorFormWrapper.html());
                this.formData['4'].purchaseTempId = $errorFormWrapper.find('input[name="purchaseTempId"]').val();                

                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep.completed = true;
                this.saveSession();
                await this.scrollTop();
                $(this.$el).find('#error-form-placeholder form').trigger('submit');
                return;
            } else if (this.currStep.stepNum == '5') {
                window.killUnloadM3PA && window.killUnloadM3PA()
                $('form#thePaymentForm').trigger('submit');
                this.saveSession();
                return;
            }

            await this.scrollTop();
            this.currStep.completed = true;
            this.currStep = this.steps[this.steps.indexOf(this.currStep) + 1];
            window.location.hash = this.currStep.hash;

            this.loading = false;
            this.initializeTooltips()
            this.$nextTick(() => this.rowMatchHeight())
            this.$nextTick(function(){this.matchHeightElement();});

            this.saveSession()

        },
        goToPrevStep: async function () {
            this.loading = true;

            if (this.currStep.stepNum == '2') {
                this.copyOfNricOrPassport = this.formData['1'].policyHolderNric;
                this.copyOfVehicleRegNum = this.formData['1'].motorRegistrationNo;
            }else if(this.currStep.stepNum == '3'){
                
            }

            if (this.currStep.stepNum == '4' && !['registration', 'payment'].includes(this.stage)) {
                await this.scrollTop();
                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                this.currStep.completed = false;
                this.saveSession();
                window.location.href = this.registrationUrl + '#fillindetails';
                return;
            }

            if (this.currStep.stepNum == '5' && !['registration', 'summary'].includes(this.stage)) {
                await this.scrollTop();
                window.killUnloadM3PA && window.killUnloadM3PA()
                this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
                this.currStep.completed = false;
                this.saveSession();
                window.location.href = this.summaryUrl;
                return;
            }

            
            this.currStep = this.steps[this.steps.indexOf(this.currStep) - 1];
            this.currStep.completed = false;

            this.saveSession()
            await this.scrollTop();
            window.location.hash = this.currStep.hash;
            
            this.initializeTooltips()
            this.loading = false;
            this.$nextTick(() => this.rowMatchHeight())    
            this.$nextTick(function(){this.matchHeightElement();});
        },

         getPostcodesAsync: async function(postcode) {
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
        getLoanProvidersAsync: async function(name) {
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
            this.formData[this.currStep.stepNum].addressPostcode = cityObj.postcode;
            this.formData[this.currStep.stepNum].addressCity = cityObj.cityDescription;

            const stateQuery = {
                'stateCode': cityObj.stateCode
            }
            const dotCMSQueryURL = this.createDotCMSQueryURL('TieRefState', stateQuery, true)
            const stateApiResp = await $.ajax({
                method: 'GET',
                dataType: 'json',
                url: dotCMSQueryURL
            }).promise()

            this.formData[this.currStep.stepNum].addressState = stateApiResp.contentlets[0].stateDescription;
            this.currSelectedPostcode = cityObj;
        },
        getTravelrightPlusPremium: async function(){
            var planLength=$(".selection-infobox input[name=preferredPlan]").length;
            if($(".selection-infobox input[name=preferredPlan]")){
                for(var i = 0 ; i < planLength ; i++){
                    var plan = $(".selection-infobox input[name=preferredPlan]").eq(i).val();
                    this.calculateTravelPlanPremium(plan);
                }
            }
            /*
            var _this = this;
 
            const dotCMSQueryURL = this.baseUrl +
            "/api/content/render/false/query/-contentType:forms%20-baseType:6%20-basetype:3%20+"+
            "contentType:TieBancaTravelRateTableStructure%20+(conhost:ceaa0d75-448c-4885-a628-7f0c35d374bd%20conhost:SYSTEM_HOST)%20+"+
            "TieBancaTravelRateTableStructure.partnerCode:"+this.partnerCode+"%20+"+
            "TieBancaTravelRateTableStructure.plan:"+plan+"%20+"+
            "TieBancaTravelRateTableStructure.area:area"+area+"%20+"+
            "TieBancaTravelRateTableStructure.durationLowerBound:%5B0%20to%20"+age+"%5D%20+"+
            "TieBancaTravelRateTableStructure.durationUpperBound:%5B"+age+"%20to%209999%5D%20+"+
            "languageId:1%20+deleted:false%20+working:true/orderby/TieBancaTravelRateTableStructure.benefitPlan"; 
            
            const apiResp = await $.ajax({
                method: 'GET',
                url: dotCMSQueryURL,
                dataType: 'json'
            }).promise().done(function(data){
                console.log("get travel premium");
                console.log(data);
                _this.plan1DisplayPremium = parseFloat(data.contentlets[0].insuredOnlyRate).toFixed(2);
                _this.plan2DisplayPremium = parseFloat(data.contentlets[1].insuredOnlyRate).toFixed(2);
            });
            */
        },
        getDayName: function (dateString) {
            return moment(dateString, 'DD/MM/YYYY').format('ddd')
        },
        scrollToError: function () {
            const isMobile = window.innerWidth < 768;
            let $errors = $('.wizard-section-' + this.currStep.stepNum).find('.is-invalid, .error-input');
            if (isMobile) {
                $errors = $errors.filter(function () { return $(this).parents('.d-none').length === 0 })
            }
            if ($errors.length && $errors.first()) {
                //let offset = $errors.first().parent().children().first().offset().top - 10
                let offset = $errors.first().offset().top - 50;
                //let offset = $errors.first().offset().top - 10
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
        formatAsCurrency: function(number) {
            return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        formatAsNonDecimal: function (number) {
            return parseFloat(number).toFixed(0);
           
        },
        initializeTooltips: function () {
            this.$nextTick().then(() => {
                const currStepNum = this.currStep.stepNum;
                const $tooltips = $(this.$el).find(`.wizard-section-${currStepNum} [data-toggle=tooltip]`);
                $tooltips.each(function () {
                    if (!$(this).hasClass('tooltip-initialized')) {
                        $(this).tooltip()
                        $(this).addClass('tooltip-initialized')
                    } else {
                        $(this).tooltip('update')
                    }
                })
            })
        },

        cancelEditRiderDetails: function () {
            this.formData['4'].policyHolderName = this.formData['3'].policyHolderName;
            this.formData['4'].policyHolderEmail = this.formData['3'].policyHolderEmail;
            this.formData['4'].policyHolderMobileNo = this.formData['3'].policyHolderMobileNo;
            this.formData['4'].policyHolderAddressLine1 = this.formData['3'].policyHolderAddressLine1;
            this.formData['4'].policyHolderAddressLine2 = this.formData['3'].policyHolderAddressLine2;
            this.formData['4'].addressPostcode = this.formData['3'].addressPostcode;
            this.formData['4'].addressState = this.formData['3'].addressState;
            this.formData['4'].addressStateCode = this.formData['3'].addressStateCode;
            this.formData['4'].addressCity = this.formData['3'].addressCity;

             if (!this.isIdNric) {
            // extra for foreigner
            this.formData['4'].policyHolderCountry = this.formData['3'].policyHolderCountry;
            this.formData['4'].policyHolderGender = this.formData['3'].policyHolderGender;
            this.formData['4'].policyHolderDateOfBirth = this.formData['3'].policyHolderDateOfBirth;
            }

           
            this.formData['4'].isRiderDetailsEditMode = false;
            $(".summaryBack").removeClass("disabled");
            $(".summaryCheckout").removeClass("disabled");

        },
        saveEditRiderDetails: async function () {
            const isValid = await this.$refs.editRiderObserver.validate();
            if (!isValid) {
                this.scrollToError()
                return
            };

            this.formData['3'].policyHolderName = this.formData['4'].policyHolderName;
            this.formData['3'].policyHolderEmail = this.formData['4'].policyHolderEmail;
            this.formData['3'].policyHolderMobileNo = this.formData['4'].policyHolderMobileNo;
            this.formData['3'].policyHolderAddressLine1 = this.formData['4'].policyHolderAddressLine1;
            this.formData['3'].policyHolderAddressLine2 = this.formData['4'].policyHolderAddressLine2;
            this.formData['3'].addressPostcode = this.formData['4'].addressPostcode;
            this.formData['3'].addressState = this.formData['4'].addressState;
            this.formData['3'].addressStateCode = this.formData['4'].addressStateCode;
            this.formData['3'].addressCity = this.formData['4'].addressCity;
           
            // extra for foreigner
            this.formData['3'].policyHolderCountry = this.formData['4'].policyHolderCountry;
            this.formData['3'].policyHolderGender = this.formData['4'].policyHolderGender;
            this.formData['3'].policyHolderDateOfBirth = this.formData['4'].policyHolderDateOfBirth;

           
            this.formData['4'].isRiderDetailsEditMode = false;
            $(".summaryBack").removeClass("disabled");
            $(".summaryCheckout").removeClass("disabled");

        },
        processPurchaseStep1: function () {
            const $form = $(this.$el).find('form#summary-form-placeholder');
            $form.attr('action', this.summaryUrl);
            //$form.attr('method', 'post'); // temporary comment
            const data = {
                action: "processPurchase",
                actionType: "Step1",
                partnerCode: this.partnerCode,
                productCode: this.productCode,
                productName: this.productName,
                productGroup: this.productGroup,
                prefixMobile: this.prefixMobile,
                formula: 'travelright-plus',
                certificateNo: this.certificateNo,
               
                staffId: this.staffId,
                staffRelationship: this.staffRelationship,
                policyEndDate: '',
                policyStartDate: '',
                coverageStartDate: this.covertToStringFormatDate(this.formData['2'].coverageStartDate),//this.formData['2'].formattedCoverageStartDate,
                coverageExpiryDate: this.covertToStringFormatDate(this.formData['2'].coverageEndDate),//this.formData['2'].formattedCoverageEndDate,
                coveragePlan: this.formData['2'].planName,

                coveragePremiumRate: this.coveragePremiumRate,
                coveragePremiumDiscount: this.formData['2'].discountAmount,
                coverageStampDuty: this.formData['2'].stampDuty,
                totalPremium: this.formData['2'].totalPayable,
                noDaysCovered: this.formData['2'].daysOfCoverage,
                refAddress1: '',
                refAddress2: '',
                addressOverwriteIndicator: '',
                isInIframe: this.isInIframe,
                prescreenYesNo: this.formData['1'].prescreenYesNo, //hardcode  this.formData['1'].prescreenYesNo
                prescreenYesNo2: this.formData['1'].prescreenYesNo2, //hardcode  this.formData['1'].prescreenYesNo2
                
                //otherHealthcareInsurance:this.formData['1'].otherHealthcareInsurance.toString(),
                destinationDesc: this.formData['2'].destinationDesc.toString(),

                privacyNoticeCheckbox: 'Y', // to check if needed
               
                dpfStatus: '',
               
                policyHolderNationality: this.formData['1'].policyHolderCountry ? this.formData['1'].policyHolderCountry : 'MAL',
                
               
                policyHolderMalaysian: this.isIdNric ? 'Y' : 'N',
                policyHolderName: this.formData['3'].policyHolderName,
                policyHolderNRIC: this.isIdNric ? this.formData['1'].policyHolderNric : '',
                policyHolderPassport: this.isIdNric ? '' : this.formData['1'].policyHolderNric,
                policyHolderGender: this.policyHolderGender,
                //policyHolderDateOfBirth: moment(this.policyHolderDob).format('DD/MM/YYYY'),
                policyHolderDateOfBirth: this.policyHolderDOBStringFormat,
                policyHolderEmail: this.formData['3'].policyHolderEmail,
                policyHolderMobileNo: this.formData['3'].policyHolderMobileNo,
                policyHolderAddressLine1: this.formData['3'].policyHolderAddressLine1,
                policyHolderAddressLine2: this.formData['3'].policyHolderAddressLine2,
                addressPostcode: this.formData['3'].addressPostcode,
                addressState: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).stateCode,
                addressCity: this.postcodeSuggestions.find(a => a.cityDescription === this.formData['3'].addressCity).cityCode,
                policyHolderMaritalStatus: '',

                coverageType: this.formData['2'].coverageType,
               
                basicPremium: this.formData['2'].basePremium,
                discount: this.formData['2'].discountAmount,
                sst: this.formData['2'].sst,
                sstVal: this.formData['2'].serviceTax,
                stampDuty: this.formData['2'].stampDuty,
                grandTotal: this.formData['2'].totalPayable,

                commissionAgreement: this.formData['4'].commissionAgreement,
                staffName: this.formData['4'].bankerName,
                employeeBranch: this.formData['4'].bankerBranch,
                promotionCode: this.formData['4'].promoCode,

                additionalPremium: '',
               
                memberName: '',
                memberCountry: '',
                memberIdNo: '',
                memberRelationship: '',
                memberDOB: '',
                memberMotorDrivingExperience: '',
                memberIsMalaysian: '',
                memberIsMalaysian:'',
                memberOccupation: '',
                memberGender: '',

            };
            $form.append(
                Object
                    .keys(data)
                    .map(key => $(`<input type="hidden" name="${key}" value="${data[key]}">`))
            )
            $form.trigger('submit', data)
        },
         async getCountries() {
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
        async getTravelDeclarationAndCountryList() {
            const data = await $.ajax({
                method: 'GET',
                url: this.createDotCMSQueryURL('TieTravelDeclarationAndCountryList', {}, true),
                dataType: 'json'
            }).promise()
            this.travelRightPlusCountries = _.sortBy(
                data.contentlets.reduce((acc, content) => {
                    if(content.area !="Exclude" && content.area !="exclude"){
                        acc.push({
                            index:content.index,
                            countryName: content.countryName,
                            area: content.area
                        })
                    }else{
                        console.log("got eclude o : "+content.area);
                    }
                    return acc;
                }, []),
                'countryName'
            )
        },
        async getMalaysiaStates() {
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
        async getPIDMmember(){
            
            const data = await $.ajax({
                method: 'GET',
                url: this.createDotCMSQueryURL('TiePidmInsurerMembers', {}, true),
                dataType: 'json'
            }).promise()
            this.pidm = 
                data.contentlets.reduce((acc, content) => {
                    acc.push(content.pidmInsurerMember)
                    return acc;
                }, []).sort();          
        },
        async getBankList() {
            const data = await $.ajax({
                method: 'GET',
                url: this.baseUrl + '/dotCMS/purchase/paynow/banklist',
                dataType: 'json'
            })
            //this.banks = data.filter(b => b.bankOnlineStatus === true);
            console.log(data);
            this.banks = Array.isArray(data) ? data.filter(b => b.bankOnlineStatus === true) : []
        },
        promptRestoreSession() {
            const $modal = $('#session-modal');
            return new Promise((resolve, reject) => {
                $modal.one('hidden.bs.modal', () => {
                    resolve(this.wishToRestoreSession)
                })
                $modal.modal('show')
            })
        },
       
        rowMatchHeight() {
            let $group = $(this.$el).find('.selection-infobox-group');
            let $rows = $group.find('.row-match-height');

            let rowsByRowNum = {}
            $rows
                .filter(function () { return $(this).data('row-num') })
                .each(function () {
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

        matchHeightElement(){
            var matchHeightContainer = $(".match-Height-Container");
            console.log("matchHeightContainer.length: "+matchHeightContainer.length);
            if(matchHeightContainer.length > 0){
                //for(var k=0; k<matchHeightContainer.length;k++){
               
                var matchHeightChild = matchHeightContainer.find(".selection-infobox ul.list");
                matchHeightChild.css("height","auto");
                console.log("matchHeightChild length: "+matchHeightChild.length);
                if(screen.width > 600){
                    var highestHeight = 0;
                    for(var i =0 ; i< matchHeightChild.length; i++){
                        if(matchHeightChild[i].offsetHeight > highestHeight){
                            highestHeight = matchHeightChild[i].offsetHeight;
                        }
                    }
                    console.log("highest high: "+highestHeight);
                    matchHeightChild.height(highestHeight);
                //}
                }
                
            }
        },
        showTncModal() {
            $(this.$el).find('#tnc-modal').modal('show')
        },
        showFullBenefits() {
            $(this.$el).find('#full-benefits').modal('show')
        },
        differentDay: function differentDay (startDate, endDate){
            const oneDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay)) + 1;
            return diffDays;
        },
    },
    computed: {
        hidePlan:function(){
            if(this.formData['2'].coverageType != '' && this.formData['2'].coverageType != null &&
               this.formData['2'].coverageArea != '' && this.formData['2'].coverageArea != null &&
               this.formData['2'].coverageStartDate != '' &&
               this.formData['2'].coverageEndDate != '') {
                return true;
            }else{
                return false;
            }
        },
        isMobileScreen:function(){
            if(screen.width <= 600)
            {
                return true;
            }else{
                return false;
            }
        },

        policyHolderDOBStringFormat: function(){
            let tempDob = new Date (this.policyHolderDob);
            return String(tempDob.getDate()).padStart(2,'0') + '/' + String(tempDob.getMonth()+1).padStart(2,'0') + '/' + tempDob.getFullYear();
        },
        displayDateFormat: function(){
            return moment(this.formData['3'].policyHolderDateOfBirth).format('DD/MM/YYYY')
        },
        step4PassportOrNric:function(){
            if(this.formData['1'].policyHolderIdType == 'nric'){
                return 'NRIC';
            }
            else{
                return 'Passport';
            }
        },
        isIdNric: function () {
            return this.formData['1'].policyHolderIdType === 'nric';
        },
        policyHolderGender: {
            cache: false,
            get() {
                if (!this.isIdNric) {
                    if(this.formData['1'].policyHolderGender !="" && this.formData['1'].policyHolderGender !=null){
                        return this.formData['1'].policyHolderGender;
                    }
                    else if(this.formData['3'].policyHolderGender !="" && this.formData['3'].policyHolderGender !=null){
                        return this.formData['3'].policyHolderGender;
                    }
                    else{
                        return '';
                    }
                }
                if (this.isIdNric) {
                    const last4Digits = this.formData['1'].policyHolderNric.split('-')[2]
                    return last4Digits % 2 === 1 ? 'M' : 'F'
                }
            },
            set(value) {
                this.formData['3'].policyHolderGender = value
            }
        },
        policyHolderDob: {
            get() {
                if (this.isIdNric) {
                    const nric = this.formData['1'].policyHolderNric;
                    return extractDOB(nric);
                }else{
                return this.formData['1'].policyHolderDateOfBirth;
                }
            },
            set(value) {
                this.formData['3'].policyHolderDateOfBirth = value;
            }
        },
        fullAddress: function () {
            if (this.formData['3'].policyHolderAddressLine2 == ""){
                return `${this.formData['3'].policyHolderAddressLine1}, ${this.formData['3'].addressPostcode} ${this.formData['3'].addressCity}, ${this.formData['3'].addressState}`
            }else
            return `${this.formData['3'].policyHolderAddressLine1}, ${this.formData['3'].policyHolderAddressLine2}, ${this.formData['3'].addressPostcode} ${this.formData['3'].addressCity}, ${this.formData['3'].addressState}`
        },
        cardType: function () {
            return getCardType(this.formData['5'].ccNo)
        },
      
        mobileNumber: function () {
            return this.formData['3'].policyHolderMobileNo.replace(/\s/g, '')
        },
        openPolicyDate: function(){
            var date = new Date();
            date = new Date (date.getFullYear(), date.getMonth(), date.getDate()+1 );
			return date;
        },
        disabledPolicyDates: function(){
            var date = new Date();
            //var dateTmr = new Date();
            //var today= new Date(date.getFullYear(), date.getMonth(), date.getDate())
            date = new Date (date.getFullYear(), date.getMonth() + 12, date.getDate());
            //dateTmr = new Date (dateTmr.getFullYear(), dateTmr.getMonth(), dateTmr.getDate() +1);
            return {to: new Date(Date.now() - 8640000), from: new Date (date.getFullYear(), date.getMonth(), date.getDate())}
        },
        disabledPolicyEndDates:function(){
            var date = new Date();
            date = new Date (date.getFullYear(), date.getMonth() + 12, date.getDate());
            if(this.formData['2'].coverageStartDate){
                return {to: this.formData['2'].coverageStartDate, from: new Date (date.getFullYear(), date.getMonth(), date.getDate())}
            }else{
                return {to: new Date(Date.now() - 8640000), from: new Date (date.getFullYear(), date.getMonth(), date.getDate())}
            }
        },
        disabledDatesDOB: function(){
            return{
                //from: moment().endOf('year').subtract(18, "years").toDate(),
                //to: moment().startOf('year').subtract(59, "years").toDate()
                from: moment().endOf('year').subtract(this.productMinAge, getDateUnitWithS(this.productMinAgeUnit)).toDate(),
                to: moment().startOf('year').subtract(this.productMaxAge, getDateUnitWithS(this.productMaxAgeUnit)).toDate()
            }
        },
        /*
        getMinAgeUnit: function(){
            if(this.productMinAgeUnit == "year" || this.productMinAgeUnit == "years") {
                return "years"
            }
        },
        getMaxAgeUnit: function(){
            if(this.productMaxAgeUnit == "year" || this.productMaxAgeUnit == "years") {
                return "years"
            }
        },
        */
        getPolicyHolderAge:function(){
            if(this.formData['1'].policyHolderDateOfBirth != null || this.formData['1'].policyHolderNric != null){
                const today = moment();
                var value = this.policyHolderDob;
                if(value instanceof Date){
                    // do nothing
                }
                else{
                    value = moment(value).toDate();
                }
                return today.year() - value.getFullYear();
            }
        },
        displayCommission: function () {
            if(this.formData['2'].basePremium > 0){
                if(this.formData['2'].discountAmount > 0 && this.formData['4'].successApplyPromo){
                    return "0.00";
                }else{
                    return (this.formData['2'].basePremium * this.commissionRate / 100).toFixed(2);
                }
            }
        },
        displayCommissionRate:function(){
            if(this.formData['2'].discountAmount > 0 && this.formData['4'].successApplyPromo){
                return 0;
            }else{
                return this.commissionRate;
            }
        },
        isSpouse:function(){
            var isSpouse = false;
            if(this.formData['3'].familyMembers.length){
                this.formData['3'].familyMembers.filter(function (m) {
                    if(m.relationToCustomer == 'Spouse') {
                        isSpouse = true;
                    }
                });
            }
            return isSpouse;
        }
    },
    watch: {
        "currStep.stepNum":function(e){
            if(this.currStep.stepNum == 2){
                this.$nextTick(function(){
                    this.callMultipleSelect();
                    this.initializeSwiper();
                });
                //this.$nextTick(function (){this.callMultipleSelect();})
            }
        },
        "isMobileScreen":function(e){
            if(this.currentPreScreen == 4 && this.formData['1'].prescreenYesNo2 == "Y"){
                var multiSelect = document.querySelector(".forceSetHeightMobileMultiSelect");
                if(!this.isMobileScreen){
                    if(multiSelect)
                    {
                        multiSelect.style.height = "auto";
                    }
                }
                else{
                    if(document.querySelector("#country-dropdown")){
                        document.querySelector("#country-dropdown").classList.remove("active");
                    }
                }
                this.$nextTick(function () {
                    this.callMultipleSelect();
                })
            }
        },
        "formData.1.policyHolderNric":function(e){
            var t = this.formData['1'].policyHolderNric;
            this.formData['1'].policyHolderNric = t.toUpperCase();
        },
        "formData.2.destinationDesc": function(e){
            // update the area
            console.log("destination in watch: "+this.formData['2'].destinationDesc.length)
            if(this.formData['2'].destinationDesc.length>0){
                this.formData['2'].destinationDescValid = true;
                if(this.travelRightPlusCountries){
                    var area =this.travelRightPlusCountries.find(v => v.countryName == this.formData['2'].destinationDesc[0]).area;
                    console.log("see area"+area);
                    this.formData['2'].coverageArea = area;
                }
            }
        },
        "formData.2.coverageType":function(e){
            if(this.formData['2'].coverageType == 'single') {
                if(this.formData['2'].coverageEndDate){
                    this.formData['2'].coverageEndDate = null;
                }
                if(this.formData['2'].destinationDesc.length>0){
                    if(this.travelRightPlusCountries){
                        var area =this.travelRightPlusCountries.find(v => v.countryName == this.formData['2'].destinationDesc[0]).area;
                        console.log("see area"+area);
                        this.formData['2'].coverageArea = area;
                    }else{
                        this.formData['2'].coverageArea = '';
                        this.formData['2'].destinationDesc = [];
                    }
                }else{
                    this.formData['2'].coverageArea = '';
                }
                // no need calculate premium here, because it got trigger Area chg(calculate it at watch area)
                this.$nextTick(function (){this.callMultipleSelect();})
            }else{  // annual here
                if(this.formData['2'].coverageStartDate){
                this.formData['2'].dateSelected = true;
                this.formData['2'].coverageEndDate= new Date(moment(this.formData['2'].coverageStartDate).add(1, 'years').subtract(1, 'seconds'));
                }

                if(this.formData['2'].coverageType && this.formData['2'].coverageArea && this.formData['2'].planName
                && this.formData['2'].coverageStartDate && this.formData['2'].coverageEndDate){
                    this.calculatePremium();
                }
            }

            if(this.formData['2'].coverageType != '' && this.formData['2'].coverageType != null &&
               this.formData['2'].coverageArea != '' && this.formData['2'].coverageArea != null &&
               this.formData['2'].coverageStartDate != '' &&
               this.formData['2'].coverageEndDate != '') {
                this.getTravelrightPlusPremium()
            }else{
                this.plan1DisplayPremium ='';
                this.plan2DisplayPremium ='';
            }
           
        },
        "formData.2.coverageArea":function(e){
            if(this.formData['2'].coverageType != '' && this.formData['2'].coverageType != null &&
               this.formData['2'].coverageArea != '' && this.formData['2'].coverageArea != null &&
               this.formData['2'].coverageStartDate != '' &&
               this.formData['2'].coverageEndDate != '') {
                this.getTravelrightPlusPremium()
            }else{
                this.plan1DisplayPremium ='';
                this.plan2DisplayPremium ='';
            }
            // should call calculate premium
            if(this.formData['2'].coverageType && this.formData['2'].coverageArea && this.formData['2'].planName
            && this.formData['2'].coverageStartDate && this.formData['2'].coverageEndDate){
                this.calculatePremium();
            }
        },
        "formData.2.planName":function(e){
            console.log("change plan");
            if(this.formData['2'].planName != "" && this.formData['2'].planName != null){
                /*this.$nextTick(function(){document.querySelector('.swiper-container').swiper.update()});*/
                if(this.formData['2'].coverageType && this.formData['2'].coverageArea && this.formData['2'].planName
                && this.formData['2'].coverageStartDate && this.formData['2'].coverageEndDate){
                    this.calculatePremium();
                }
                //this.formData['2'].selectedPlanName = this.formData['2'].planCodesNames[this.formData['2'].planCodesNames.findIndex(i => i.planCode == this.formData['2'].planName)].planName
            }  
        },
        "formData.2.coverageStartDate": function(e){
            if(this.formData['2'].coverageType != '' && this.formData['2'].coverageType != null &&
                this.formData['2'].coverageArea != '' && this.formData['2'].coverageArea != null &&
                this.formData['2'].coverageStartDate != '' &&
                this.formData['2'].coverageEndDate != '') {
                    this.getTravelrightPlusPremium()
            }else{
                this.plan1DisplayPremium ='';
                this.plan2DisplayPremium ='';
            }

            if (this.formData['2'].coverageEndDate != null && this.formData['2'].coverageEndDate != "" && this.formData['2'].coverageEndDate < this.formData['2'].coverageStartDate){
                this.formData['2'].coverageEndDate = this.formData['2'].coverageStartDate;
            }

            if(this.formData['2'].coverageType == 'single' && this.formData['2'].coverageStartDate != "" && this.formData['2'].coverageStartDate != null){
                if(this.formData['2'].coverageStartDate != "" && this.formData['2'].coverageStartDate != null && 
                   this.formData['2'].coverageEndDate != "" && this.formData['2'].coverageEndDate != null) {   ///need add area and plan
                    this.formData['2'].dateSelected = true;
                }
            }
            else if(this.formData['2'].coverageType == 'annual' && this.formData['2'].coverageStartDate != "" && this.formData['2'].coverageStartDate != null){
                this.formData['2'].dateSelected = true;
                this.formData['2'].coverageEndDate= new Date(moment(this.formData['2'].coverageStartDate).add(1, 'years').subtract(1, 'seconds'));
                console.log("formData['2'].coverageEndDate: "+this.formData['2'].coverageEndDate)
            }

            if(this.formData['2'].coverageType && this.formData['2'].coverageArea && this.formData['2'].planName
                && this.formData['2'].coverageStartDate && this.formData['2'].coverageEndDate){
                    this.calculatePremium();
            }

           
        },
        "formData.2.coverageEndDate": function(e){
            if(this.formData['2'].coverageType == 'single' && this.formData['2'].coverageEndDate != "" && this.formData['2'].coverageEndDate != null){
                if(this.formData['2'].coverageType != '' && this.formData['2'].coverageType != null &&
                    this.formData['2'].coverageArea != '' && this.formData['2'].coverageArea != null &&
                    this.formData['2'].coverageStartDate != '' &&
                    this.formData['2'].coverageEndDate != '') {
                        this.getTravelrightPlusPremium()
                    }else{
                        this.plan1DisplayPremium ='';
                        this.plan2DisplayPremium ='';
                    }

                if(this.formData['2'].coverageStartDate != "" && this.formData['2'].coverageStartDate != null && 
                   this.formData['2'].coverageEndDate != "" && this.formData['2'].coverageEndDate != null) {

                    this.formData['2'].dateSelected = true;
                }

                if(this.formData['2'].coverageType && this.formData['2'].coverageArea && this.formData['2'].planName
                && this.formData['2'].coverageStartDate && this.formData['2'].coverageEndDate){
                    this.calculatePremium();
                }
            }
        },
        
        "formData.3.addressPostcode": _.debounce(async function (postcode) {
            if (postcode == undefined){
                postcode = '';
            }
            await this.getPostcodesAsync(postcode)

            if (postcode.length === 5 && this.currSelectedPostcode && this.currSelectedPostcode.postcode != postcode) {
                this.currSelectedPostcode = null;
            }

            if (postcode.length === 5 && !this.currSelectedPostcode) {
                let suggestion = this.postcodeSuggestions.find(s => s.postcode == postcode);
                if (!suggestion) {
                    this.isNotKnownPostcode = true;
                    return;
                }

                this.formData['3'].addressCity = suggestion.cityDescription;
                this.formData['3'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
                this.isNotKnownPostcode = false;
                return;
            }
        }, 500),
        "formData.4.addressPostcode": _.debounce(async function (postcode) {
            await this.getPostcodesAsync(postcode)

            if (postcode.length === 5 && this.currSelectedPostcode && this.currSelectedPostcode.postcode != postcode) {
                this.currSelectedPostcode = null;
            }

            if (postcode.length === 5 && !this.currSelectedPostcode) {
                let suggestion = this.postcodeSuggestions.find(s => s.postcode == postcode);
                if (!suggestion) {
                    this.isNotKnownPostcode = true;
                    return;
                }
                this.formData['4'].addressCity = suggestion.cityDescription;
                this.formData['4'].addressState = this.states.find(s => s.code === suggestion.stateCode).name;
                this.isNotKnownPostcode = false;
                return;
            }
        }, 500),
        "formData.4.promoCode":function(value){
            if(value.length>0){
                this.promoCodeInvalid=false;
            }
        },
        "formData.4.otherClaimType": function(e){
            this.formData['4'].claimDescCharNum = 50 - this.formData['4'].otherClaimType.length;
        },
        /*
        "formData.4.declarationYesNo":function(){
            
        },
        */
        "isCreditCardPaymentGateway":function(e){
            this.fpxMaintenance();
        },
        "isFPXPaymentGateway":function(e){
            this.fpxMaintenance();
        },
        "isBoostPaymentGateway":function(e){
            this.fpxMaintenance();
        },

        loading: function (value) {
            if (value) {
                return $('.page-loader').fadeIn()
            }
            $('.page-loader').fadeOut()
        }
    },
    mounted: async function () {
        this.loading = true;
        this.getCountries()
        this.getMalaysiaStates()

        var Vuethis=this;
        await this.maybeRestoreSession().then(function(){
            Vuethis.multipleSelection = new MultipleSectionSearch();
            Vuethis.otherInsurancePIDMListMultiSelect = new MultipleSectionSearch();
                if(Vuethis.formData['2'].destinationDesc.length>0){
                    Vuethis.formData['2'].destinationDesc.forEach(function(item){
                        Vuethis.multipleSelection.selected.push(item)
                    });
                }
            });
        //this.initializeTooltips()
        if(this.currStep.stepNum <= 3){ 
            if(this.formData['2'].coverageType != '' && this.formData['2'].coverageType != null &&
               this.formData['2'].coverageArea != '' && this.formData['2'].coverageArea != null &&
               this.formData['2'].coverageStartDate != '' &&
               this.formData['2'].coverageEndDate != '') {
                this.getTravelrightPlusPremium()
            }else{
                this.plan1DisplayPremium = '';
                this.plan2DisplayPremium = '';
            }
            this.getTravelDeclarationAndCountryList()
            window.addEventListener('resize',this.matchHeightElement());
        }
        else if(this.currStep.stepNum == '4'){
            this.getPIDMmember()
            this.callOtherInsurancePidmMultiSelect();
            this.otherClaimListMultiSelect = new MultipleSectionSearch();
            if(this.formData['4'].insuranceClaims.length>0){
                this.formData['4'].insuranceClaims.forEach(function(item){
                    Vuethis.otherClaimListMultiSelect.selected.push(item);
                });
            }
 
        } 
        else if(this.currStep.stepNum == '5'){
            this.getBankList()
            this.fpxMaintenance();
        }
       
        this.loading = false;
    }
})
