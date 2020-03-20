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
                this.formData['3'].motorAddLegalLiabilityOfPassengers
            ]
            return addOnSelection.some(addOn => addOn === true)
        }
    },
    methods: {
        formatAsCurrency: function (number) {
            if (typeof number === 'undefined') {
                number = 0;
            }
            return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
    },
    mounted: function () {
        console.log(this)
    }
}