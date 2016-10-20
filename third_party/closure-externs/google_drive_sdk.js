/**
 * @fileoverview Specifies functions related to the Google Drive SDK.
 */


/**
 * @constructor
 */
var GoogleDriveAuthResult = function () {};

/**
 * @type {string}
 */
GoogleDriveAuthResult.prototype.error;


/**
 * @typedef {{
 *   client_id: string,
 *   scope: !Array.<string>,
 *   immediate: boolean
 * }}
 */
var GoogleDriveAuthObject;

// Define the gapi namespace.
var gapi = {};
gapi.auth = {};
gapi.client = {};

/**
 * Attempts to authorize.
 * @param {!GoogleDriveAuthObject} authObject Describes the authorization.
 * @param {function(GoogleDriveAuthResult)} callback Called after authorization
 *     attempt is made.
 */
gapi.auth.authorize = function(authObject, callback) {};

/**
 * @typedef {{
 *   access_token: string 
 * }}
 */
var AccessToken;

/**
 * @return {!AccessToken}
 */
gapi.auth.getToken = function() {};

/**
 * Initializes authorization so that popup blockers do not block the
 * installation dialog.
 * @param {!Function} callback The callback to call after initialization.
 */
gapi.auth.init = function(callback) {};

/**
 * @typedef {{
 *   fileId: string
 * }}
 */
var FileParameterObject;

/**
 * @typedef {{
 *   mimeType: string,
 *   parents: !Array.<string>,
 *   title: string
 * }}
 */
var FileInsertionDescriptionObject;

/**
 * @typedef {{
 *   resource: FileInsertionDescriptionObject
 * }}
 */
var FileInsertionObject;

/**
 * A request for say meta data.
 * @constructor
 */
var FileRequest = function() {};

/**
 * @typedef {{
 *   emailAddress: string,
 *   isAuthenticatedUser: boolean,
 *   permissionId: string
 * }}
 */
var FileUserObject;

/**
 * Represents a file retrieved from Google Drive.
 * @constructor
 */
var GoogleDriveFile = function() {};

/** @type {string} */
GoogleDriveFile.prototype.id;

/** @type {string} */
GoogleDriveFile.prototype.title;

/** @type {string} */
GoogleDriveFile.prototype.description;

/** @type {string} */
GoogleDriveFile.prototype.mimeType;

/** @type {string} */
GoogleDriveFile.prototype.downloadUrl;

/** @type {string} */
GoogleDriveFile.prototype.fileSize;

/** @type {boolean} */
GoogleDriveFile.prototype.ownedByMe;

/** @type {!Array.<!FileUserObject>} */
GoogleDriveFile.prototype.owners;

/**
 * Executes the request.
 * @param {function(GoogleDriveFile)} successCallback A success callback.
 */
FileRequest.prototype.execute = function(successCallback) {};


// Define the gapi.client namespace.
gapi.client.drive = {};
gapi.client.drive.files = {};

/**
 * Loads some API.
 * @param {string} apiName The name of the API.
 * @param {string} apiVersion The version of the API to load.
 * @param {!Function} callback The callback called once the API is loaded.
 */
gapi.client.load = function(apiName, apiVersion, callback) {};

/**
 * Sets the API key.
 * @param {string} apiKey
 */
gapi.client.setApiKey = function(apiKey) {};

/**
 * Gets meta data for a file.
 * @param {!FileParameterObject} fileParameterObject Specifies parameters.
 * @return {!FileRequest}
 */
gapi.client.drive.files.get = function(fileParameterObject) {};

/**
 * Inserts a new empty file into Drive.
 * @param {!FileInsertionObject} fileInsertionObject Specifies parameters.
 * @return {!FileRequest}
 */
gapi.client.drive.files.insert = function(fileInsertionObject) {};

