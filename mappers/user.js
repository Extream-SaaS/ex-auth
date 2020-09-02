class UserMapper {
    static toResponse(user) {
        return {
            id: user.public_id,
            username: user.username,
            email: user.email,
            fields: user.fields,
            user_type: user.user_type,
        };
    }

    static getLoginDataResponse(user) {
        return {
            username: user.username,
            password: user.password,
            user_type: user.user_type,
        };
    }
}

module.exports = UserMapper;
