export default {
    template: '#summary-pane-template',
    props: ['formData', 'currStepNum'],
    data: function () {
        return {

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