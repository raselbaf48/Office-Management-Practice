const admin = require('firebase-admin');
const config = require('./firebase-applet-config.json');

// We need a service account to run admin sdk, but wait, the project config is public?
// We might not be able to use firebase-admin without credentials.
// Let's use the REST API.
