class UserMapper {
    static toResponse(user) {
        return {
            id: user.public_id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fields: user.fields,
            user_type: user.user_type,
        };
    }

    static toResponseWithEventId(token) {
        const user = this.toResponse(token.user);
        return {
            ...user,
            eventId: token.eventId,
        };
    }

    static getLoginDataResponse(user) {
        return {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            user_type: user.user_type,
        };
    }
}

module.exports = UserMapper;
