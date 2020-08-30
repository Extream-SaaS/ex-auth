const crypto = require('crypto');
const sendResponse = require('../utility/response');
const emailService = require('../services/email');
const ClientMapper = require('../mappers/client');

class ClientController {
    constructor(clientRepository, authClientRepository) {
        this.clientRepository = clientRepository;
        this.authClientRepository = authClientRepository;

        this.createClient = this.createClient.bind(this);
        this.createClientToken = this.createClientToken.bind(this);
    }

    async createClient(req, res) {
        try {
            const existingClient = await this.clientRepository.getByName(req.body.client_name);
            if (existingClient) {
                return sendResponse(res, {message: 'client exists'}, 409);
            }

            const newClient = await this.clientRepository.create(req.body.client_name);

            if (!newClient) {
                return sendResponse(res, {message: 'bad request'}, 400);
            }
            return sendResponse(res, ClientMapper.clientResponse(newClient));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }

    async createClientToken(req, res) {
        try {
            const existingClient = await this.clientRepository.getById(req.body.client_id);
            if (!existingClient) {
                return sendResponse(res, {message: 'client not found'}, 404);
            }

            const secret = crypto.randomBytes(24).toString('hex');

            console.log(typeof secret, secret);

            const newAuthClient = await this.authClientRepository.create(secret, req.body.auth_name, req.body.client_id);

            if (!newAuthClient) {
                return sendResponse(res, {message: 'bad request'}, 400);
            }
            // send an email to designated admin to show a new client has been created
            await emailService.sendClientCreate(process.env.ADMIN_EMAIL, secret, req.body.auth_name);
            return sendResponse(res, ClientMapper.getPrivateResponse(newAuthClient));
        } catch (e) {
            console.log('error', e);
            return sendResponse(res, undefined, 500, e);
        }
    }
}

module.exports = ClientController;
