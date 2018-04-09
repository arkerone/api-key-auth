# api-key-auth

Express/Restify middleware to authenticate HTTP requests based on api key and signature.

## Installation

```
$ npm install --save api-key-auth
```

## Usage

This middleware authenticates callers using an api key and the signature of the request. If the api key and the signature are valid, `req.credentials` will be set with the calling application information.

### Example

This basic usage example should help you get started :

```javascript
const express = require('express');
const apiKeyAuth = require('./middlewares/apiKeyAuth');

const app = express();

// Create the collection of api keys
const apiKeys = new Map();
apiKeys.set('123456789', {
  id: 1,
  name: 'app1',
  secret: 'secret1'
});
apiKeys.set('987654321', {
  id: 2,
  name: 'app2',
  secret: 'secret2'
});

// Your function to get the secret associated to the key id
function getSecret(keyId, done) {
  if (!apiKeys.has(keyId)) {
    done(new Error('Unknown api key'));
  }
  const clientApp = apiKeys.get(keyId);
  done(null, clientApp.secret, {
    id: clientApp.id,
    name: clientApp.name
  });
}

app.use(apiKeyAuth({ getSecret }));

app.get('/protected', (req, res) => {
  res.send(`Hello ${req.credentials.name}`);
});

app.listen(8080);
```

## API

### apiKeyAuth(options)

Create an api key based authentication middleware function using the given `options`.

#### options.getSecret (REQUIRED)

A function with signature `function(keyId, done)` to be invoked to retrieve the secret from the `keyId`.

* `keyId` (`String`) - The api key used to retrieve the secret.
* `done` (`Function`) - A function with signature `function(err, secret, credentials)` to be invoked when the secret is retrieved.

  * `err` (`Error`) - The error that occurred.
  * `secret` (`String`) - The secret to use to verify the signature.
  * `credentials` (`Object`) - `req.credentials` will be set with this object.

#### options.requestProperty (OPTIONAL)

By default, you can attach information about the client application on `req.credentials` but can be configured with the `requestProperty` option.

## HTTP signature scheme

The client application must signs all HTTP requests. The signature is based on this draft ["Signing HTTP Messages"](https://tools.ietf.org/html/draft-cavage-http-signatures-09).
