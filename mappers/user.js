class UserMapper {
    static toResponse(user) {
        return {
            public_id: user.public_key,
            username: user.username,
            email: user.email,
            fields: user.fields,
        };
    }
}

module.exports = UserMapper;
