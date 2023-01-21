const { body } = require("express-validator")

const postValidator = () => {
    return [
        body("title").isString().withMessage("Title is required"),
        body("body").isString().withMessage("Body is required"),
        body("geo_location").isString().withMessage("Geo Location is required with long, lat.")
    ]
}

const login = () => {
    return [
        body("email").isString().withMessage("Email is required"),
        body("password").isString().withMessage("Password is required"),
    ]
}

const registration = () => {
    return [
        body("name").isString().withMessage("Name is required"),
        body("Gender").isString().withMessage("Gender is required"),
        body("email").isString().withMessage("Email is required with long, lat."),
        body("mobile").isString().withMessage("Mobile is required"),
        body("password").isString().withMessage("Password is required with long, lat.")
    ]
}

const postByGeoLocation = () => {
    return [
        body("long").isDecimal().withMessage("Longitude is required"),
        body("lat").isDecimal().withMessage("Latitude is required"),
    ]
} 

module.exports = {
    postValidator,
    login,
    registration,
    postByGeoLocation
}