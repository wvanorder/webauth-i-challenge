module.exports =  function restricted( req, res, next) {
    if(req.session && req.session.user) {
        next();
    } else {
        res.status(400).json({ message: 'Give us legit creds' })
    }
};