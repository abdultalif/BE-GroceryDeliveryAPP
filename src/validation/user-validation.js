import Joi from 'joi';

const registerValidation = Joi.object({
    email: Joi.string().max(100).required().email(),
    password: Joi.string().min(5).max(100).required(),
    confirmPassword: Joi.string().min(5).valid(Joi.ref('password')).required().strict(),
    name: Joi.string().max(100).required(),
    no_telp: Joi.string().max(15).min(11).required(),

});

const loginValidation = Joi.object({
    email: Joi.string().max(100).required().email(),
    password: Joi.string().min(5).max(100).required(),
});

const forgotPasswordValidation = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordValidation = Joi.object({
    newPassword: Joi.string().min(8).max(100).required(),
    confirmPassword: Joi.string().min(8).valid(Joi.ref('newPassword')).required().strict(),
});

export {
    loginValidation,
    registerValidation,
    forgotPasswordValidation,
    resetPasswordValidation
}