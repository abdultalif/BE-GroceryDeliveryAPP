import bcrypt from 'bcrypt';
const saltRounds = 10;

const encript = password => {
    return bcrypt.hash(password, saltRounds);
};

const compare = (password, hash) => {
    return bcrypt.compare(password, hash);
};

export {
    encript,
    compare
};