import jsonWebToken from "jsonwebtoken";
import { JWTEpiresIn, JWTSecret } from "./environment.js";

const generateAccessToken = user => {
    return jsonWebToken.sign(user, JWTSecret, {
        expiresIn: JWTEpiresIn || '7200s',
    });
};

const parseJWT = token => {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

const verifyAccessToken = token => {
    try {
        return jsonWebToken.verify(token, JWTSecret);
    } catch (error) {
        return null;
    }
};
export {
    generateAccessToken,
    parseJWT,
    verifyAccessToken
};