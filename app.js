/**
 * app.js
 */

require('dotenv').config();

// Ensure we're in the project directory
process.chdir(__dirname);

var sails;
var rc;

try {
  sails = require('sails');
  rc = require('sails/accessible/rc');
} catch (err) {
  console.error('Encountered an error when attempting to require(\'sails\'):');
  console.error(err.stack);
  return;
}

sails.lift(rc('sails'));