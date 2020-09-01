# ex-auth

Extream Authentication server

Internal RESTful API for OAuth2

## Deployment

Source the environment vars before deploying

`set -o allexport && [[ -f .env ]] && source .env && set +o allexport`
`gcloud app deploy`

## Login

POST `/auth/login`

### Payload

```JSON
  username: "string|optional",
  "password": "string|optional",
  "event_id": "uuid|required",
  "grant_type": "password|authorization|required",
  "client_id": "string|optional"
}
```

### Response 200

```JSON
{
  "id": "uuid",
  "token_type": "bearer",
  "access_token": "hash",
  "expires_in": 3600,
  "user_type": "string",
  "status": "approved|requested|rejected",
  "user": {
    "custom": "fields"
  }
}
```

### Response 401

```JSON
{
  "status": 401,
  "message": "user not authorized"
}
```

## Register

POST `/auth/register`

### Payload

```JSON
{
  "username": "string|optional",
  "password": "string|optional",
  "grant_type": "password|authorization|required",
  "client_id": "string|optional",
  "user_type": "string|optional",
  "user": {
    "custom": "fields"
  }
}
```

### Response 200

```JSON
{
  "id": "uuid",
  "user_type": "string",
  "status": "approved|requested|rejected",
  "user": {
    "custom": "fields"
  }
}
```

### Response 409

```JSON
{
  "status": 409,
  "message": "user exists"
}
```

## Check access

GET `/auth/access`

### Headers

```JSON
{
  "Authorization": "Bearer ${access_token}"
}
```

### Response 200

```JSON
{
  "access": true
}
```

### Response 401

```JSON
{
  "access": false
}
```
