export default {
    template: '#travelrightPlus-summary-pane-template',
    props: ['formData', 'currStepNum','commissionRate'],
    //'showSpecialAddOns'
    data: function() {
        return {
            isExpanded: false
        }
    },
    computed: {
        differentDaysInSummary: function(){
            if(this.formData['2'].coverageStartDate && this.formData['2'].coverageEndDate){
                return this.differentDay(this.formData['2'].coverageStartDate,this.formData['2'].coverageEndDate);
            }
        },
        policyStartDate: function () { 
            let startD = new Date(this.formData['2'].coverageStartDate);
            startD =  new Date (startD.valueOf() );
            return String(startD.getDate()).padStart(2,'0') + "/" +String(startD.getMonth()+1).padStart(2,'0') + "/"+ String(startD.getFullYear()) ;           
            
        },
        policyEndDate: function () { 
            let endD = new Date(this.formData['2'].coverageEndDate);
            endD = new Date(endD.valueOf());
            return String(endD.getDate()).padStart(2,'0') + "/" +String(endD.getMonth()+1).padStart(2,'0') + "/"+ String(endD.getFullYear());           
            
        },
        displayCommissionSummaryPanel: function () {

            if(this.formData['2'].basePremium > 0){
                console.log("success apply in summary: "+this.formData['4'].successApplyPromo);
                if(this.formData['2'].discountAmount > 0 && this.formData['4'].successApplyPromo){
                    return 0;
                }else{
                    return (this.formData['2'].basePremium * this.commissionRate / 100).toFixed(2);
                }
            }
            else{
                return 0;
            }
        },
        displayCommissionRateSummaryPanel:function(){
            if(this.formData['2'].discountAmount > 0 && this.formData['4'].successApplyPromo){
                return 0;
            }else{
                return this.commissionRate;
            }
        }
    },
    methods: {
        formatAsCurrency: function(number) {
            if (typeof number === 'undefined' || typeof number === 'object') {
                number = 0;
            }
            return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        },
        formatAsNonDecimal: function(number) {
            return parseFloat(number).toFixed(0);
        },
        toggleExpand: function() {
            this.isExpanded = !this.isExpanded;
        },
        differentDay: function differentDay (startDate, endDate){
            const oneDay = 24 * 60 * 60 * 1000;
            const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay)) + 1;
            return diffDays;
        },
    }
}