import express from 'express';

const api = express();
const router = express.Router();

//Sample API
router.route('/signIn').post((req, res) => {
    res.sendStatus(200);
});

//CORS
api.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Resolve '/api' prefixed routes
api.use('/api', router);

export default api;
