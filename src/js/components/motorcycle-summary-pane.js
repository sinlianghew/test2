export default {
    template: '#summary-pane-template',
    props: ['formData', 'currStepNum', 'showSpecialAddOns'],
    data: function () {
        return {}
    },
    computed: {
        isAnySpecialAddOnSelected: function () {
            const addOnSelection = [
                this.formData['3'].motorAddSRCC,
                this.formData['3'].motorAddSpecialPerils,
                this.formData['3'].motorAddLegalLiabilityOfPassengers,
                this.formData['3'].motorAddRiderPA
            ]
            return addOnSelection.some(addOn => addOn === true)
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
    methods: {
        formatAsCurrency: function (number) {
            if (typeof number === 'undefined' || typeof number === 'object') {
                number = 0;
            }
            return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
    }
}