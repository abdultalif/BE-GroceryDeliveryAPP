import jsonWebToken from "jsonwebtoken";
import dotenv from "dotenv/config";

const generateAccessToken = user => {
    return jsonWebToken.sign(user, process.env.JWT_SECERET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1800s',
    });
};

const parseJWT = token => {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

const verifyAccessToken = token => {
    try {
        return jsonWebToken.verify(token, process.env.JWT_SECERET);
    } catch (error) {
        return null;
    }
};
export {
    generateAccessToken,
    parseJWT,
    verifyAccessToken
};