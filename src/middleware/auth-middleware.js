import { ResponseError } from "../error/response-error.js";
import { verifyAccessToken } from "../utils/jwt.js";

const authentication = (req, res, next) => {

    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) throw new ResponseError(401, "Unauthorized");

    const user = verifyAccessToken(token)
    if (!user) throw new ResponseError(401, "Unauthorized");

    req.user = user;
    next();

}

export { authentication }