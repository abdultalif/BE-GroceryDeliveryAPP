import dotenv from 'dotenv/config';

const port = process.env.PORT;

const JWTSecret = process.env.JWT_SECERET;
const JWTEpiresIn = process.env.JWT_EXPIRES_IN;

const mailService = process.env.MAIL_SERVICE;
const mailUser = process.env.MAIL_USER;
const mailPassword = process.env.MAIL_PASSWORD;
const mailFrom = process.env.MAIL_FROM;


export {
    port,
    JWTSecret,
    JWTEpiresIn,
    mailService,
    mailUser,
    mailPassword,
    mailFrom

}