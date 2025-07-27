import jwt from 'jsonwebtoken';

export const authUser = async (req, res, next) => {
    try {
        console.log("Cookies:", req.cookies);
        console.log("Authorization Header:", req.headers.authorization);
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
        console.log("Extracted Token:", token);

        if (!token) {
            console.log("Token Not Found");
            return res.status(401).send({ error: "Unauthorized user" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ message: "Please Authenticate" });
    }
};
