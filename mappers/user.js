class UserMapper {
    static toResponse(user) {
        return {
            public_id: user.public_key,
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
