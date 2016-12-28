/**
 * Created by Xefke on 28/12/2016.
 */
module.exports = {

    fieldsNotEmpty: function (object) {
        var errors = [];
        console.log(object);
        for (i = 1; i < arguments.length; i++) {
            if (!this.fieldNotEmpty(object, arguments[i])) {
                errors.push(arguments[i]);
            }
        }
        ;
        return errors.length === 0 ? null : errors;
    },

    fieldNotEmpty: function (object, field) {
        return object && object[field] && object[field] !== "";
    }

};