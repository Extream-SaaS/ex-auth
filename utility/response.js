function sendResponse(res, data, status= 200, error = undefined) {
    res.status(status).json({
        ...data,
        error,
    });
}

module.exports = sendResponse;
