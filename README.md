# api-key-auth

Express/Restify middleware to authenticate HTTP requests based on api key and signature.

[![npm version](https://badge.fury.io/js/api-key-auth.svg)](https://badge.fury.io/js/api-key-auth)
[![codebeat badge](https://codebeat.co/badges/8b9de4e3-0841-4a91-85fd-5a26f58901c3)](https://codebeat.co/projects/github-com-arkerone-api-key-auth-master)
[![Build Status](https://travis-ci.org/arkerone/api-key-auth.svg?branch=master)](https://travis-ci.org/arkerone/api-key-auth)
[![codecov](https://codecov.io/gh/arkerone/api-key-auth/branch/master/graph/badge.svg)](https://codecov.io/gh/arkerone/api-key-auth)

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

Create an api key based authentication middleware function using the given `options` :

|        Name        |      Type       |     Default     | Description                                     |
| :----------------: | :-------------: | :-------------: | :---------------------------------------------- |
|    `getSecret`     |   `Function`    |       `-`       | Invoked to retrieve the secret from the `keyId` |
| `requestProperty`  |    `String`     | `'credentials'` | The request property to attach the information  |
| `requestLifetime`  | `Number | null` |      `300`      | The lifetime of a request in seconds            |

#### options.getSecret (REQUIRED)

A function with signature `function(keyId, done)` to be invoked to retrieve the secret from the `keyId`.

* `keyId` (`String`) - The api key used to retrieve the secret.
* `done` (`Function`) - A function with signature `function(err, secret, credentials)` to be invoked when the secret is retrieved.

  * `err` (`Error`) - The error that occurred.
  * `secret` (`String`) - The secret to use to verify the signature.
  * `credentials` (`Object`) - `req.credentials` will be set with this object.

#### options.requestProperty (OPTIONAL)

By default, you can attach information about the client application on `req.credentials` but can be configured with the `requestProperty` option.

#### options.requestLifetime (OPTIONAL)

The lifetime of a request in second, by default is set to 300 seconds, set it to null to disable it. This options is used if HTTP header "date" is used to create the signature.

## HTTP signature scheme

Look ["HTTP signature scheme"](signature.md) to sign a HTTP request.

## License

The MIT License (MIT)

Copyright (c) 2018 Axel SHAÏTA <mailto:shaita.axel@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
