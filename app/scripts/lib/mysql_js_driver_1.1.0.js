/*
 * Copyright (c) 2014 Yoichiro Tanaka. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
    "use strict";

    var MySQL = {};

    if ("undefined" == typeof module) {
        window.MySQL = MySQL;
    } else {
        module.exports = MySQL;
    }
})();

(function() {
    "use strict";

    // Constructor

    var NetworkErrorCode = function() {
        this.errorCodeMap = {
            "-1": "IO_PENDING",
            "-2": "FAILED",
            "-3": "ABORTED",
            "-4": "INVALID_ARGUMENT",
            "-5": "INVALID_HANDLE",
            "-6": "FILE_NOT_FOUND",
            "-7": "TIMED_OUT",
            "-8": "FILE_TOO_BIG",
            "-9": "UNEXPECTED",
            "-10": "ACCESS_DENIED",
            "-11": "NOT_IMPLEMENTED",
            "-12": "INSUFFICIENT_RESOURCES",
            "-13": "OUT_OF_MEMORY",
            "-14": "UPLOAD_FILE_CHANGED",
            "-15": "SOCKET_NOT_CONNECTED",
            "-16": "FILE_EXISTS",
            "-17": "FILE_PATH_TOO_LONG",
            "-18": "FILE_NO_SPACE",
            "-19": "FILE_VIRUS_INFECTED",
            "-20": "BLOCKED_BY_CLIENT",
            "-21": "NETWORK_CHANGED",
            "-22": "BLOCKED_BY_ADMINISTRATOR",
            "-23": "SOCKET_IS_CONNECTED",
            "-100": "CONNECTION_CLOSED",
            "-101": "CONNECTION_RESET",
            "-102": "CONNECTION_REFUSED",
            "-103": "CONNECTION_ABORTED",
            "-104": "CONNECTION_FAILED",
            "-105": "NAME_NOT_RESOLVED",
            "-106": "INTERNET_DISCONNECTED",
            "-107": "SSL_PROTOCOL_ERROR",
            "-108": "ADDRESS_INVALID",
            "-109": "ADDRESS_UNREACHABLE",
            "-110": "SSL_CLIENT_AUTH_CERT_NEEDED",
            "-111": "TUNNEL_CONNECTION_FAILED",
            "-112": "NO_SSL_VERSIONS_ENABLED",
            "-113": "SSL_VERSION_OR_CIPHER_MISMATCH",
            "-114": "SSL_RENEGOTIATION_REQUESTED",
            "-115": "PROXY_AUTH_UNSUPPORTED",
            "-116": "CERT_ERROR_IN_SSL_RENEGOTIATION",
            "-117": "BAD_SSL_CLIENT_AUTH_CERT",
            "-118": "CONNECTION_TIMED_OUT",
            "-119": "HOST_RESOLVER_QUEUE_TOO_LARGE",
            "-120": "SOCKS_CONNECTION_FAILED",
            "-121": "SOCKS_CONNECTION_HOST_UNREACHABLE",
            "-122": "NPN_NEGOTIATION_FAILED",
            "-123": "SSL_NO_RENEGOTIATION",
            "-124": "WINSOCK_UNEXPECTED_WRITTEN_BYTES",
            "-125": "SSL_DECOMPRESSION_FAILURE_ALERT",
            "-126": "SSL_BAD_RECORD_MAC_ALERT",
            "-127": "PROXY_AUTH_REQUESTED",
            "-128": "SSL_UNSAFE_NEGOTIATION",
            "-129": "SSL_WEAK_SERVER_EPHEMERAL_DH_KEY",
            "-130": "PROXY_CONNECTION_FAILED",
            "-131": "MANDATORY_PROXY_CONFIGURATION_FAILED",
            "-133": "PRECONNECT_MAX_SOCKET_LIMIT",
            "-134": "SSL_CLIENT_AUTH_PRIVATE_KEY_ACCESS_DENIED",
            "-135": "SSL_CLIENT_AUTH_CERT_NO_PRIVATE_KEY",
            "-136": "PROXY_CERTIFICATE_INVALID",
            "-137": "NAME_RESOLUTION_FAILED",
            "-138": "NETWORK_ACCESS_DENIED",
            "-139": "TEMPORARILY_THROTTLED",
            "-140": "HTTPS_PROXY_TUNNEL_RESPONSE",
            "-141": "SSL_CLIENT_AUTH_SIGNATURE_FAILED",
            "-142": "MSG_TOO_BIG",
            "-143": "SPDY_SESSION_ALREADY_EXISTS",
            "-145": "WS_PROTOCOL_ERROR",
            "-146": "PROTOCOL_SWITCHED",
            "-147": "ADDRESS_IN_USE",
            "-148": "SSL_HANDSHAKE_NOT_COMPLETED",
            "-149": "SSL_BAD_PEER_PUBLIC_KEY",
            "-150": "SSL_PINNED_KEY_NOT_IN_CERT_CHAIN",
            "-151": "CLIENT_AUTH_CERT_TYPE_UNSUPPORTED",
            "-152": "ORIGIN_BOUND_CERT_GENERATION_TYPE_MISMATCH",
            "-153": "SSL_DECRYPT_ERROR_ALERT",
            "-154": "WS_THROTTLE_QUEUE_TOO_LARGE",
            "-155": "TOO_MANY_SOCKET_STREAMS",
            "-156": "SSL_SERVER_CERT_CHANGED",
            "-157": "SSL_INAPPROPRIATE_FALLBACK",
            "-158": "CT_NO_SCTS_VERIFIED_OK",
            "-159": "SSL_UNRECOGNIZED_NAME_ALERT",
            "-200": "CERT_COMMON_NAME_INVALID",
            "-201": "CERT_DATE_INVALID",
            "-202": "CERT_AUTHORITY_INVALID",
            "-203": "CERT_CONTAINS_ERRORS",
            "-204": "CERT_NO_REVOCATION_MECHANISM",
            "-205": "CERT_UNABLE_TO_CHECK_REVOCATION",
            "-206": "CERT_REVOKED",
            "-207": "CERT_INVALID",
            "-208": "CERT_WEAK_SIGNATURE_ALGORITHM",
            "-210": "CERT_NON_UNIQUE_NAME",
            "-211": "CERT_WEAK_KEY",
            "-212": "CERT_NAME_CONSTRAINT_VIOLATION",
            "-213": "CERT_END",
            "-300": "INVALID_URL",
            "-301": "DISALLOWED_URL_SCHEME",
            "-302": "UNKNOWN_URL_SCHEME",
            "-310": "TOO_MANY_REDIRECTS",
            "-311": "UNSAFE_REDIRECT",
            "-312": "UNSAFE_PORT",
            "-320": "INVALID_RESPONSE",
            "-321": "INVALID_CHUNKED_ENCODING",
            "-322": "METHOD_NOT_SUPPORTED",
            "-323": "UNEXPECTED_PROXY_AUTH",
            "-324": "EMPTY_RESPONSE",
            "-325": "RESPONSE_HEADERS_TOO_BIG",
            "-326": "PAC_STATUS_NOT_OK",
            "-327": "PAC_SCRIPT_FAILED",
            "-328": "REQUEST_RANGE_NOT_SATISFIABLE",
            "-329": "MALFORMED_IDENTITY",
            "-330": "CONTENT_DECODING_FAILED",
            "-331": "NETWORK_IO_SUSPENDED",
            "-332": "SYN_REPLY_NOT_RECEIVED",
            "-333": "ENCODING_CONVERSION_FAILED",
            "-334": "UNRECOGNIZED_FTP_DIRECTORY_LISTING_FORMAT",
            "-335": "INVALID_SPDY_STREAM",
            "-336": "NO_SUPPORTED_PROXIES",
            "-337": "SPDY_PROTOCOL_ERROR",
            "-338": "INVALID_AUTH_CREDENTIALS",
            "-339": "UNSUPPORTED_AUTH_SCHEME",
            "-340": "ENCODING_DETECTION_FAILED",
            "-341": "MISSING_AUTH_CREDENTIALS",
            "-342": "UNEXPECTED_SECURITY_LIBRARY_STATUS",
            "-343": "MISCONFIGURED_AUTH_ENVIRONMENT",
            "-344": "UNDOCUMENTED_SECURITY_LIBRARY_STATUS",
            "-345": "RESPONSE_BODY_TOO_BIG_TO_DRAIN",
            "-346": "RESPONSE_HEADERS_MULTIPLE_CONTENT_LENGTH",
            "-347": "INCOMPLETE_SPDY_HEADERS",
            "-348": "PAC_NOT_IN_DHCP",
            "-349": "RESPONSE_HEADERS_MULTIPLE_CONTENT_DISPOSITION",
            "-350": "RESPONSE_HEADERS_MULTIPLE_LOCATION",
            "-351": "SPDY_SERVER_REFUSED_STREAM",
            "-352": "SPDY_PING_FAILED",
            "-353": "PIPELINE_EVICTION",
            "-354": "CONTENT_LENGTH_MISMATCH",
            "-355": "INCOMPLETE_CHUNKED_ENCODING",
            "-356": "QUIC_PROTOCOL_ERROR",
            "-357": "RESPONSE_HEADERS_TRUNCATED",
            "-358": "QUIC_HANDSHAKE_FAILED",
            "-400": "CACHE_MISS",
            "-401": "CACHE_READ_FAILURE",
            "-402": "CACHE_WRITE_FAILURE",
            "-403": "CACHE_OPERATION_NOT_SUPPORTED",
            "-404": "CACHE_OPEN_FAILURE",
            "-405": "CACHE_CREATE_FAILURE",
            "-406": "CACHE_RACE",
            "-407": "CACHE_CHECKSUM_READ_FAILURE",
            "-408": "CACHE_CHECKSUM_MISMATCH",
            "-501": "INSECURE_RESPONSE",
            "-502": "NO_PRIVATE_KEY_FOR_CERT",
            "-503": "ADD_USER_CERT_FAILED",
            "-601": "FTP_FAILED",
            "-602": "FTP_SERVICE_UNAVAILABLE",
            "-603": "FTP_TRANSFER_ABORTED",
            "-604": "FTP_FILE_BUSY",
            "-605": "FTP_SYNTAX_ERROR",
            "-606": "FTP_COMMAND_NOT_SUPPORTED",
            "-607": "FTP_BAD_COMMAND_SEQUENCE",
            "-701": "PKCS12_IMPORT_BAD_PASSWORD",
            "-702": "PKCS12_IMPORT_FAILED",
            "-703": "IMPORT_CA_CERT_NOT_CA",
            "-704": "IMPORT_CERT_ALREADY_EXISTS",
            "-705": "IMPORT_CA_CERT_FAILED",
            "-706": "IMPORT_SERVER_CERT_FAILED",
            "-707": "PKCS12_IMPORT_INVALID_MAC",
            "-708": "PKCS12_IMPORT_INVALID_FILE",
            "-709": "PKCS12_IMPORT_UNSUPPORTED",
            "-710": "KEY_GENERATION_FAILED",
            "-711": "ORIGIN_BOUND_CERT_GENERATION_FAILED",
            "-712": "PRIVATE_KEY_EXPORT_FAILED",
            "-713": "SELF_SIGNED_CERT_GENERATION_FAILED",
            "-714": "CERT_DATABASE_CHANGED",
            "-800": "DNS_MALFORMED_RESPONSE",
            "-801": "DNS_SERVER_REQUIRES_TCP",
            "-802": "DNS_SERVER_FAILED",
            "-803": "DNS_TIMED_OUT",
            "-804": "DNS_CACHE_MISS",
            "-805": "DNS_SEARCH_EMPTY",
            "-806": "DNS_SORT_ERROR"
        };
    };

    // Public methods

    NetworkErrorCode.prototype.getErrorMessage = function(errorCode) {
        return this.errorCodeMap[String(errorCode)];
    };

    // Export

    MySQL.networkErrorCode = new NetworkErrorCode();

})();

(function() {
    "use strict";

    // Constructor

    var Hasher = function() {
    };

    // Public methods

    Hasher.prototype.sha1ToWordArray = function(source) {
        return CryptoJS.SHA1(source);
    };

    Hasher.prototype.sha1ToUint8Array = function(source) {
        var wordArray = this.sha1ToWordArray(source);
        return this.wordArrayToUnit8Array(wordArray);
    };

    Hasher.prototype.sha1Uint8ArrayToUint8Array = function(source) {
        var words = this.uint8ArrayToWords(source);
        var sourceWordArray = CryptoJS.lib.WordArray.create(words, source.length);
        return this.sha1ToUint8Array(sourceWordArray);
    };

    Hasher.prototype.uint8ArrayToWords = function(typedArray) {
        var typedArrayByteLength = typedArray.length;
        var words = [];
        for (var i = 0; i < typedArrayByteLength; i++) {
            words[i >>> 2] |= typedArray[i] << (24 - (i % 4) * 8);
        }
        return words;
    };

    Hasher.prototype.wordArrayToUnit8Array = function(wordArray) {
        var buffer = new ArrayBuffer(wordArray.sigBytes);
        var view = new DataView(buffer, 0, buffer.byteLength);
        for (var i = 0; i < wordArray.words.length; i++) {
            view.setInt32(i * 4, wordArray.words[i], false);
        }
        return new Uint8Array(buffer);
    };

    // Export

    MySQL.hasher = new Hasher();

})();

(function() {
    "use strict";

    // Constructor

    var BinaryUtils = function() {
        this.encoding = "utf-8";
    };

    // Public methods

    BinaryUtils.prototype.arrayBufferToString = function(buf) {
        var array = new Uint8Array(buf);
        var string = new TextDecoder(this.encoding).decode(array);
        return string;
    };

    BinaryUtils.prototype.stringToArrayBuffer = function(str) {
        var array = new TextEncoder(this.encoding).encode(str);
        var buffer = new ArrayBuffer(array.length);
        var dataView = new DataView(buffer);
        for (var i = 0; i < array.length; i++) {
            dataView.setInt8(i, array[i]);
        }
        return buffer;
    };

    BinaryUtils.prototype.createUint8Array = function(length) {
        var buffer = new ArrayBuffer(length);
        return new Uint8Array(buffer);
    };

    // Export

    MySQL.binaryUtils = new BinaryUtils();

})();

(function(binaryUtils) {
    "use strict";

    // Constructor

    var Types = function() {
    };

    // Public methods

    Types.prototype.createFixedLengthInteger = function(value, length) {
        var buffer = new ArrayBuffer(4);
        var view = new DataView(buffer);
        view.setUint32(0, value, true);
        var array = new Uint8Array(buffer);
        var subarray = array.subarray(0, length);
        return subarray;
    };

    Types.prototype.createLengthEncodedString = function(value) {
        var buffer = binaryUtils.stringToArrayBuffer(value);
        var view = new Uint8Array(buffer);
        var length = view.length;
        var header = this.createLengthEncodedInteger(length);
        var result = new Uint8Array(header.length + view.length);
        result.set(header, 0);
        result.set(view, header.length);
        return result;
    };

    Types.prototype.createNullEndValue = function(buffer) {
        var view = new Uint8Array(buffer);
        var result = new Uint8Array(view.length + 1);
        result.set(view, 0);
        return result;
    };

    Types.prototype.createLengthEncodedInteger = function(value) {
        var result = null;
        var i = 0;
        if (value === null) {
            result = new Uint8Array(1);
            result[0] = 0xFB;
            return result;
        }
        if (0 <= value && value <= 0xFA) {
            result = new Uint8Array(1);
            result[0] = value;
            return result;
        }
        var buffer = new ArrayBuffer(4);
        var view = new DataView(buffer);
        view.setUint32(0, value, false); // 64bit not supported
        var array = new Uint8Array(buffer);
        var length = 4;
        for (i = 0; i < array.length; i++) {
            if (array[i] !== 0) {
                length -= i;
                break;
            }
        }
        if (value >= 0xFB && length == 2) {
            result = new Uint8Array(3);
            result[0] = 0xFC;
            for (i = 0; i < length; i++) {
                result[i + 1] = array[array.length - 1 - i];
            }
            return result;
        } else if (length == 3) {
            result = new Uint8Array(4);
            result[0] = 0xFD;
            for (i = 0; i < length; i++) {
                result[i + 1] = array[array.length - 1 - i];
            }
            return result;
        } else {
            result = new Uint8Array(9);
            result[0] = 0xFE;
            for (i = 0; i < length; i++) {
                result[i + 1] = array[array.length - 1 - i];
            }
            return result;
        }
    };

    Types.prototype.createNullEndString = function(value) {
        var buffer = binaryUtils.stringToArrayBuffer(value);
        return this.createNullEndValue(buffer);
    };

    Types.prototype.getNullEndString = function(buffer, offset) {
        var view = new Uint8Array(buffer);
        for (var pos = offset; pos < view.length; pos++) {
            if (view[pos] === 0) {
                break;
            }
        }
        var targetBuffer = new Uint8Array(view.subarray(offset, pos));
        var result = binaryUtils.arrayBufferToString(targetBuffer.buffer);
        return {result: result, nextPosition: pos + 1};
    };

    Types.prototype.getFixedLengthString = function(buffer, offset, length) {
        var array = new Uint8Array(buffer);
        var targetBuffer = new Uint8Array(array.subarray(offset, offset + length));
        var result = binaryUtils.arrayBufferToString(targetBuffer.buffer);
        return result;
    };

    Types.prototype.getLengthEncodedString = function(buffer, offset) {
        var lengthResult = this.getLengthEncodedInteger(buffer, offset);
        if (lengthResult.result === null) {
            return {result: null, nextPosition: lengthResult.nextPosition};
        } else {
            var result = this.getFixedLengthString(
                buffer, lengthResult.nextPosition, lengthResult.result);
            return {result: result,
                    nextPosition: lengthResult.nextPosition + lengthResult.result};
        }
    };

    Types.prototype.getFixedLengthInteger = function(buffer, offset, length) {
        var source = new Uint8Array(buffer);
        var subarray = source.subarray(offset, offset + length);
        var copied = new Uint8Array(4);
        copied.set(subarray, 0);
        var view = new DataView(copied.buffer, 0, 4);
        var result = view.getUint32(0, true);
        return result;
    };

    Types.prototype.getLengthEncodedInteger = function(buffer, offset) {
        var array = new Uint8Array(buffer);
        var first = array[offset];
        if (first == 0xFB) {
            return {result: null, nextPosition: offset + 1};
        } else if (first <= 0xFA) {
            return {result: first, nextPosition: offset + 1};
        }
        var length = 0;
        if (first == 0xFC) {
            length = 2;
        } else if (first == 0xFD) {
            length = 3;
        } else {
            length = 8;
        }
        var subarray = array.subarray(offset + 1, offset + 1 + length);
        var resultBuffer = new ArrayBuffer(8);
        var resultArray = new Uint8Array(resultBuffer);
        for (var i = 0; i < subarray.length; i++) {
            resultArray[i] = subarray[i];
        }
        var resultView = new DataView(resultBuffer);
        var result = resultView.getInt32(0, true); // Currently 64bit not supported
        return {result: result, nextPosition: offset + 1 + length};
    };

    // Export

    MySQL.types = new Types();

})(MySQL.binaryUtils);

(function(mySQLTypes) {
    "use strict";

    // Constructor

    var Packet = function(newSequenceNumber, buffer) {
        this.sequenceNumber = newSequenceNumber;
        this.data = buffer;
        this.dataLength = buffer.byteLength;
    };

    // Public methods

    Packet.prototype.getArrayBuffer = function() {
        var result = new ArrayBuffer(4 + this.dataLength);
        var dataLengthArray = mySQLTypes.createFixedLengthInteger(this.dataLength, 3);
        var view = new Uint8Array(result);
        view.set(dataLengthArray, 0);
        view[3] = this.sequenceNumber;
        view.set(new Uint8Array(this.data), 4);
        return result;
    };

    // Export

    MySQL.Packet = Packet;

})(MySQL.types);

(function() {
    "use strict";

    // Constructor

    var InitialHandshakeRequest = function(newProtocolVersion,
                                           newServerVersion,
                                           newConnectionId,
                                           newAuthPluginDataPart1,
                                           newCapabilityFlag1,
                                           newCharacterSet,
                                           newStatusFlags,
                                           newCapabilityFlag2,
                                           newAuthPluginDataLen,
                                           newAuthPluginDataPart2,
                                           newAuthPluginName) {
        this.protocolVersion = newProtocolVersion;
        this.serverVersion = newServerVersion;
        this.connectionId = newConnectionId;
        this.authPluginDataPart1 = newAuthPluginDataPart1;
        this.capabilityFlag1 = newCapabilityFlag1;
        this.characterSet = newCharacterSet;
        this.statusFlags = newStatusFlags;
        this.capabilityFlag2 = newCapabilityFlag2;
        this.authPluginDataLen = newAuthPluginDataLen;
        this.authPluginDataPart2 = newAuthPluginDataPart2;
        this.authPluginName = newAuthPluginName;
    };

    MySQL.InitialHandshakeRequest = InitialHandshakeRequest;

})();

(function() {
    "use strict";

    // Constructor

    var OkResult = function(newAffectedRows,
                            newLastInsertId,
                            newStatusFlags,
                            newWarnings,
                            newInfo) {
        this.affectedRows = newAffectedRows;
        this.lastInsertId = newLastInsertId;
        this.statusFlags = newStatusFlags;
        this.warnings = newWarnings;
        this.info = newInfo;
    };

    // Public methods

    OkResult.prototype.isSuccess = function() {
        return true;
    };

    OkResult.prototype.hasResultset = function() {
        return false;
    };

    // Export

    MySQL.OkResult = OkResult;

})();

(function() {
    "use strict";

    // Constructor

    var ErrResult = function(newErrorCode,
                             newSqlStateMarker,
                             newSqlState,
                             newErrorMessage) {
        this.errorCode = newErrorCode;
        this.sqlStateMarker = newSqlStateMarker;
        this.sqlState = newSqlState;
        this.errorMessage = newErrorMessage;
    };

    // Public methods

    ErrResult.prototype.isSuccess = function() {
        return false;
    };

    // Export
    MySQL.ErrResult = ErrResult;

})();

(function() {
    "use strict";

    // Constructor

    var QueryResult = function(newColumnCount) {
        this.columnCount = newColumnCount;
    };

    // Public methods

    QueryResult.prototype.isSuccess = function() {
        return true;
    };

    QueryResult.prototype.hasResultset = function() {
        return true;
    };

    // Export

    MySQL.QueryResult = QueryResult;

})();

(function() {
    "use strict";

    // Constructor

    var FieldFlags = {
        NOT_NULL: 0x0001,
        PRIMARY_KEY: 0x0002,
        UNIQUE: 0x0004,
        INDEX: 0x0008,
        BLOB: 0x0010,
        UNSIGNED: 0x0020,
        ZEROFILL: 0x0040,
        BINARY: 0x0080,
        AUTO_INCREMENT: 0x0200,
        ENUM: 0x0100,
        SET: 0x0800,
        NO_DEFAULT_VALUE: 0x1000
    };

    // Export

    MySQL.FieldFlags = FieldFlags;

})();

(function(FieldFlags) {
    "use strict";

    // Constructor

    var ColumnDefinition = function(newCatalog,
                                    newSchema,
                                    newTable,
                                    newOrgtable,
                                    newName,
                                    newOrgname,
                                    newNextlength,
                                    newCharacterset,
                                    newColumnlength,
                                    newColumntype,
                                    newFlags,
                                    newDecimals) {
        this.catalog = newCatalog;
        this.schema = newSchema;
        this.table = newTable;
        this.orgTable = newOrgtable;
        this.name = newName;
        this.orgName = newOrgname;
        this.nextLength = newNextlength;
        this.characterSet = newCharacterset;
        this.columnLength = newColumnlength;
        this.columnType = newColumntype;
        this.flags = newFlags;
        this.decimals = newDecimals;
    };

    // Public methods

    ColumnDefinition.prototype.isNotNull = function() {
        return (this.flags & FieldFlags.NOT_NULL) !== 0;
    };

    ColumnDefinition.prototype.isPrimaryKey = function() {
        return (this.flags & FieldFlags.PRIMARY_KEY) !== 0;
    };

    ColumnDefinition.prototype.isUnique = function() {
        return (this.flags & FieldFlags.UNIQUE) !== 0;
    };

    ColumnDefinition.prototype.isIndex = function() {
        return (this.flags & FieldFlags.INDEX) !== 0;
    };

    ColumnDefinition.prototype.isBlob = function() {
        return (this.flags & FieldFlags.BLOB) !== 0;
    };

    ColumnDefinition.prototype.isUnsigned = function() {
        return (this.flags & FieldFlags.UNSIGNED) !== 0;
    };

    ColumnDefinition.prototype.isZeroFill = function() {
        return (this.flags & FieldFlags.ZEROFILL) !== 0;
    };

    ColumnDefinition.prototype.isBinary = function() {
        return (this.flags & FieldFlags.BINARY) !== 0;
    };

    ColumnDefinition.prototype.isAutoIncrement = function() {
        return (this.flags & FieldFlags.AUTO_INCREMENT) !== 0;
    };

    ColumnDefinition.prototype.isEnum = function() {
        return (this.flags & FieldFlags.ENUM) !== 0;
    };

    ColumnDefinition.prototype.isSet = function() {
        return (this.flags & FieldFlags.SET) !== 0;
    };

    ColumnDefinition.prototype.isNoDefaultValue = function() {
        return (this.flags & FieldFlags.NO_DEFAULT_VALUE) !== 0;
    };

    // Export

    MySQL.ColumnDefinition = ColumnDefinition;

})(MySQL.FieldFlags);

(function() {
    "use strict";

    // Constructor

    var ResultsetRow = function(newValues) {
        this.values = newValues;
    };

    // Export

    MySQL.ResultsetRow = ResultsetRow;

})();

(function() {
    "use strict";

    // Constructor

    var EofResult = function(newWarningCount, newStatusFlags) {
        this.warningCount = newWarningCount;
        this.statusFlags = newStatusFlags;
    };

    // Export

    MySQL.EofResult = EofResult;

})();

(function(binaryUtils,
          mySQLTypes,
          hasher,
          QueryResult,
          OkResult,
          ErrResult,
          EofResult,
          InitialHandshakeRequest,
          ColumnDefinition,
          ResultsetRow) {
    "use strict";

    // Constructor

    var Protocol = function() {
    };

    // Private methods

    var _createOkResult = function(data, offset, dataLength) {
        var affectedRowsResult = mySQLTypes.getLengthEncodedInteger(data, offset);
        var affectedRows = affectedRowsResult.result;
        var lastInsertIdResult =
                mySQLTypes.getLengthEncodedInteger(
                    data, affectedRowsResult.nextPosition);
        var lastInsertId = lastInsertIdResult.result;
        var statusFlags =
                mySQLTypes.getFixedLengthInteger(
                    data, lastInsertIdResult.nextPosition, 2);
        var warnings =
                mySQLTypes.getFixedLengthInteger(
                    data, lastInsertIdResult.nextPosition + 2, 2);
        var info = "";
        if (dataLength > lastInsertIdResult.nextPosition + 4) {
            var length = dataLength - lastInsertIdResult.nextPosition + 4;
            info = mySQLTypes.getFixedLengthString(
                data, lastInsertIdResult.nextPosition + 4, length);
        }
        return new OkResult(
            affectedRows, lastInsertId, statusFlags, warnings, info);
    };

    var _createErrResult = function(data, offset, dataLength) {
        var errorCode = mySQLTypes.getFixedLengthInteger(data, offset, 2);
        var sqlStateMarker = mySQLTypes.getFixedLengthString(data, offset + 2, 1);
        var sqlState = mySQLTypes.getFixedLengthString(data, offset + 3, 5);
        var errorMessageLength = dataLength - offset - 8;
        var errorMessage =
                mySQLTypes.getFixedLengthString(
                    data, offset + 8, errorMessageLength);
        return new ErrResult(errorCode, sqlStateMarker, sqlState, errorMessage);
    };

    // Public methods

    Protocol.prototype.generateStatisticsRequest = function() {
        var buffer = new ArrayBuffer(1);
        var array = new Uint8Array(buffer);
        array[0] = 0x09;
        return array;
    };

    Protocol.prototype.generateQueryRequest = function(queryString) {
        var buffer = binaryUtils.stringToArrayBuffer(queryString);
        var view = new Uint8Array(buffer);
        var array = binaryUtils.createUint8Array(1 + view.length);
        array[0] = 0x03;
        array.set(view, 1);
        return array;
    };

    Protocol.prototype.generateInitDBRequest = function(schemaName) {
        var schemaNameBuffer = binaryUtils.stringToArrayBuffer(schemaName);
        var schemaNameArray = new Uint8Array(schemaNameBuffer);
        var resultArray = binaryUtils.createUint8Array(1 + schemaNameArray.length);
        resultArray[0] = 0x02;
        resultArray.set(schemaNameArray, 1);
        return resultArray;
    };

    Protocol.prototype.generateHandshakeResponse = function(
        initialHandshakeRequest, username, passwordHash) {
        var capabilityFlagsValue =
                0x00001
                | 0x00200
                | 0x08000
                | 0x80000;
        var capabilityFlags =
                mySQLTypes.createFixedLengthInteger(capabilityFlagsValue, 4);
        var maxPacketSize =
                mySQLTypes.createFixedLengthInteger(0xFFFFFF, 4); // About 16MB
        var characterSet =
                mySQLTypes.createLengthEncodedInteger(0x21); // utf8_general_ci
        var usernameArray = mySQLTypes.createNullEndString(username);
        var passwordHashLength =
                mySQLTypes.createLengthEncodedInteger(passwordHash.length);
        var authPluginName =
                mySQLTypes.createNullEndString(initialHandshakeRequest.authPluginName);
        var length =
                capabilityFlags.length +
                maxPacketSize.length +
                characterSet.length +
                23 +
                usernameArray.length +
                passwordHashLength.length +
                passwordHash.length +
                authPluginName.length;
        var buffer = new ArrayBuffer(length);
        var array = new Uint8Array(buffer);
        var offset = 0;
        array.set(capabilityFlags, offset);
        offset += capabilityFlags.length;
        array.set(maxPacketSize, offset);
        offset += maxPacketSize.length;
        array.set(characterSet, offset);
        offset += characterSet.length;
        offset += 23;
        array.set(usernameArray, offset);
        offset += usernameArray.length;
        array.set(passwordHashLength, offset);
        offset += passwordHashLength.length;
        array.set(passwordHash, offset);
        offset += passwordHash.length;
        array.set(authPluginName, offset);
        return array;
    };

    Protocol.prototype.generatePasswordHash = function(
        initialHandshakeRequest, passwordString) {
        var password1Array = hasher.sha1ToUint8Array(passwordString);
        var password2Array = hasher.sha1Uint8ArrayToUint8Array(password1Array);
        var authPluginDataPart1 = initialHandshakeRequest.authPluginDataPart1;
        var authPluginDataPart2 = initialHandshakeRequest.authPluginDataPart2;
        var sourceBuffer = new ArrayBuffer(authPluginDataPart1.length +
                                           authPluginDataPart2.length +
                                           password2Array.length);
        var sourceView = new Uint8Array(sourceBuffer);
        sourceView.set(authPluginDataPart1, 0);
        sourceView.set(authPluginDataPart2, authPluginDataPart1.length);
        sourceView.set(password2Array,
                       authPluginDataPart1.length + authPluginDataPart2.length);
        var hashedSourceArray = hasher.sha1Uint8ArrayToUint8Array(sourceView);
        var result = new Uint8Array(password1Array.length);
        for (var i = 0; i < result.length; i++) {
            result[i] = password1Array[i] ^ hashedSourceArray[i];
        }
        return result;
    };

    Protocol.prototype.parseQueryResultPacket = function(packet, callback) {
        var data = packet.data;
        var header = mySQLTypes.getFixedLengthInteger(data, 0, 1);
        if (header === 0) {
            // No result set
            var okResult = _createOkResult.call(
                this, data, 1, packet.dataLength);
            callback(okResult);
        } else if (header == 0xFF) {
            // Error
            var errResult = _createErrResult.call(
                this, data, 1, packet.dataLength);
            callback(errResult);
        } else {
            // Result set exists
            var columnCountResult = mySQLTypes.getLengthEncodedInteger(data, 0);
            var queryResult = new QueryResult(columnCountResult.result);
            callback(queryResult);
        }
    };

    Protocol.prototype.parseOkErrResultPacket = function(packet) {
        var data = packet.data;
        var header = mySQLTypes.getFixedLengthInteger(data, 0, 1);
        if (header === 0) {
            // Succeeded
            return _createOkResult.call(
                this, data, 1, packet.dataLength);
        } else if (header == 0xFF) {
            // Error
            return _createErrResult.call(
                this, data, 1, packet.dataLength);
        } else {
            // TODO: Unknown
            return null;
        }
    };

    Protocol.prototype.parseEofPacket = function(packet) {
        var data = packet.data;
        var header = mySQLTypes.getFixedLengthInteger(data, 0, 1);
        if (header == 0xFE) {
            var warningCount = mySQLTypes.getFixedLengthInteger(data, 1, 2);
            var statusFlags = mySQLTypes.getFixedLengthInteger(data, 3, 2);
            return new EofResult(warningCount, statusFlags);
        } else {
            // TODO: Unknown
            return null;
        }
    };

    Protocol.prototype.parseInitialHandshakePacket = function(packet) {
        var data = packet.data;
        var offset = 0;
        var protocolVersion = mySQLTypes.getFixedLengthInteger(data, offset++, 1);
        var serverVersionResult = mySQLTypes.getNullEndString(data, offset);
        var serverVersion = serverVersionResult.result;
        offset = serverVersionResult.nextPosition;
        var connectionId = mySQLTypes.getFixedLengthInteger(data, offset, 4);
        offset += 4;
        var authPluginDataPart1 = new Uint8Array(data, offset, 8);
        offset += 8 + 1; // Skip 1 byte
        var capabilityFlag1 = mySQLTypes.getFixedLengthInteger(data, offset, 2);
        offset += 2;
        var characterSet = mySQLTypes.getFixedLengthInteger(data, offset++, 1);
        var statusFlags = mySQLTypes.getFixedLengthInteger(data, offset, 2);
        offset += 2;
        var capabilityFlag2 = mySQLTypes.getFixedLengthInteger(data, offset, 2);
        offset += 2;
        var authPluginDataLen = mySQLTypes.getFixedLengthInteger(data, offset++, 1);
        offset += 10; // Skip 10 bytes
        var authPluginDataPart2 = new Uint8Array(data, offset, 12);
        offset += 12 + 1; // Skip 1 byte
        var authPluginNameResult = mySQLTypes.getNullEndString(data, offset);
        var authPluginName = authPluginNameResult.result;
        return new InitialHandshakeRequest(protocolVersion,
                                           serverVersion,
                                           connectionId,
                                           authPluginDataPart1,
                                           capabilityFlag1,
                                           characterSet,
                                           statusFlags,
                                           capabilityFlag2,
                                           authPluginDataLen,
                                           authPluginDataPart2,
                                           authPluginName);
    };

    Protocol.prototype.parseColumnDefinitionPacket = function(packet) {
        var data = packet.data;
        var catalogResult = mySQLTypes.getLengthEncodedString(data, 0);
        var schemaResult = mySQLTypes.getLengthEncodedString(
            data, catalogResult.nextPosition);
        var tableResult = mySQLTypes.getLengthEncodedString(
            data, schemaResult.nextPosition);
        var orgTableResult = mySQLTypes.getLengthEncodedString(
            data, tableResult.nextPosition);
        var nameResult = mySQLTypes.getLengthEncodedString(
            data, orgTableResult.nextPosition);
        var orgNameResult = mySQLTypes.getLengthEncodedString(
            data, nameResult.nextPosition);
        var nextLengthResult = mySQLTypes.getLengthEncodedInteger(
            data, orgNameResult.nextPosition);
        var offset = nextLengthResult.nextPosition;
        var characterSet = mySQLTypes.getFixedLengthInteger(data, offset, 2);
        offset += 2;
        var columnLength = mySQLTypes.getFixedLengthInteger(data, offset, 4);
        offset += 4;
        var columnType = mySQLTypes.getFixedLengthInteger(data, offset, 1);
        offset += 1;
        var flags = mySQLTypes.getFixedLengthInteger(data, offset, 2);
        offset += 2;
        var decimals = mySQLTypes.getFixedLengthInteger(data, offset, 1);
        return new ColumnDefinition(catalogResult.result,
                                    schemaResult.result,
                                    tableResult.result,
                                    orgTableResult.result,
                                    nameResult.result,
                                    orgNameResult.result,
                                    nextLengthResult.result,
                                    characterSet,
                                    columnLength,
                                    columnType,
                                    flags,
                                    decimals);
    };

    Protocol.prototype.parseResultsetRowPacket = function(packet) {
        var data = packet.data;
        var offset = 0;
        var values = [];
        while(offset < packet.dataLength) {
            var valueResult = mySQLTypes.getLengthEncodedString(data, offset);
            values.push(valueResult.result);
            offset = valueResult.nextPosition;
        }
        return new ResultsetRow(values);
    };

    Protocol.prototype.parseStatisticsResultPacket = function(packet) {
        var data = packet.data;
        var dataLength = packet.dataLength;
        var result = mySQLTypes.getFixedLengthString(data, 0, dataLength);
        return result;
    };

    // Export

    MySQL.protocol = new Protocol();

})(MySQL.binaryUtils,
   MySQL.types,
   MySQL.hasher,
   MySQL.QueryResult,
   MySQL.OkResult,
   MySQL.ErrResult,
   MySQL.EofResult,
   MySQL.InitialHandshakeRequest,
   MySQL.ColumnDefinition,
   MySQL.ResultsetRow);

(function(Packet, mySQLTypes) {
    "use strict";

    // Constructor

    var Communication = function() {
        this.nextSequenceNumber = 0;
        this.socketImpl = null;
    };

    // Private Methods

    var _readPluralPackets = function(
        current, count, result, callback, fatalCallback) {
        this.readPacket(function(packet) {
            result.push(packet);
            current += 1;
            if (current < count) {
                _readPluralPackets.call(
                    this, current, count, result, callback, fatalCallback);
            } else {
                callback(result);
            }
        }.bind(this), fatalCallback);
    };

    var _readFixedLongValue = function(length, callback, fatalCallback) {
        _read.call(this, length, function(readInfo) {
            var result = mySQLTypes.getFixedLengthInteger(readInfo.data, 0, length);
            callback(result);
        }.bind(this), fatalCallback);
    };

    var _read = function(length, callback, fatalCallback) {
        this.socketImpl.read(length, callback, fatalCallback);
    };

    // Public Methods

    Communication.prototype.setSocketImpl = function(impl) {
        this.socketImpl = impl;
    };

    Communication.prototype.connect = function(host, port, callback) {
        this.socketImpl.connect(host, port, callback);
    };

    Communication.prototype.disconnect = function(callback) {
        this.socketImpl.disconnect(callback);
    };

    Communication.prototype.isConnected = function() {
        return this.socketImpl.isConnected();
    };

    Communication.prototype.readPacket = function(callback, fatalCallback) {
        _readFixedLongValue.call(this, 3, function(dataLength) {
            _readFixedLongValue.call(this, 1, function(sequenceNumber) {
                this.incrementSequenceNumber(sequenceNumber);
                _read.call(this, dataLength, function(readInfo) {
                    var packet = new Packet(sequenceNumber, readInfo.data);
                    callback(packet);
                }.bind(this), fatalCallback);
            }.bind(this), fatalCallback);
        }.bind(this), fatalCallback);
    };

    Communication.prototype.readPluralPackets = function(
        count, callback, fatalCallback) {
        _readPluralPackets.call(this, 0, count, [], callback, fatalCallback);
    };

    Communication.prototype.writePacket = function(packet, callback, errorCallback) {
        this.socketImpl.write(packet, callback, errorCallback);
    };

    Communication.prototype.incrementSequenceNumber = function(sequenceNumber) {
        this.nextSequenceNumber = sequenceNumber + 1;
        if (this.nextSequenceNumber > 255) {
            this.nextSequenceNumber = 0;
        }
    };

    Communication.prototype.createPacket = function(buffer) {
        return new Packet(this.nextSequenceNumber, buffer);
    };

    Communication.prototype.resetSequenceNumber = function() {
        this.nextSequenceNumber = 0;
    };

    // Export

    MySQL.communication = new Communication();


})(MySQL.Packet, MySQL.types);

(function(mySQLCommunication, mySQLProtocol, networkErrorCode) {
    "use strict";

    // Constructor

    var Client = function() {
    };

    // Private methods

    var _handshake = function(username, password, callback, fatalCallback) {
        mySQLCommunication.readPacket(function(packet) {
            var initialHandshakeRequest =
                    mySQLProtocol.parseInitialHandshakePacket(packet);
            var passwordHash =
                    mySQLProtocol.generatePasswordHash(
                        initialHandshakeRequest, password);
            var handshakeResponse =
                    mySQLProtocol.generateHandshakeResponse(
                        initialHandshakeRequest, username, passwordHash);
            var handshakeResponsePacket =
                    mySQLCommunication.createPacket(handshakeResponse.buffer);
            mySQLCommunication.writePacket(
                handshakeResponsePacket, function(writeInfo) {
                mySQLCommunication.readPacket(function(packet) {
                    var result = mySQLProtocol.parseOkErrResultPacket(packet);
                    callback(initialHandshakeRequest, result);
                }.bind(this), fatalCallback);
            }.bind(this), fatalCallback);
        }.bind(this), fatalCallback);
    };

    var _readResultsetRows = function(result, callback, fatalCallback) {
        mySQLCommunication.readPacket(function(packet) {
            var eofResult = mySQLProtocol.parseEofPacket(packet);
            if (eofResult) {
                callback(result);
            } else {
                var row = mySQLProtocol.parseResultsetRowPacket(packet);
                result.push(row);
                _readResultsetRows.call(this, result, callback, fatalCallback);
            }
        }.bind(this), fatalCallback);
    };

    var _readColumnDefinitions = function(columnCount, resultsetCallback,
                                          noResultsetCallback, errorCallback,
                                          fatalCallback) {
        mySQLCommunication.readPluralPackets(columnCount, function(packets) {
            var columnDefinitions = [];
            for (var i = 0; i < packets.length; i++) {
                columnDefinitions.push(
                    mySQLProtocol.parseColumnDefinitionPacket(
                        packets[i]));
            }
            mySQLCommunication.readPacket(function(packet) {
                mySQLProtocol.parseEofPacket(packet);
                _readResultsetRows.call(this, [], function(resultsetRows) {
                    resultsetCallback(columnDefinitions, resultsetRows);
                }.bind(this), fatalCallback);
            }.bind(this), fatalCallback);
        }.bind(this), fatalCallback);
    };

    var _readQueryResult = function(resultsetCallback, noResultsetCallback,
                                    errorCallback, fatalCallback) {
        mySQLCommunication.readPacket(function(packet) {
            mySQLProtocol.parseQueryResultPacket(packet, function(result) {
                if (result.isSuccess() && result.hasResultset()) {
                    var columnCount = result.columnCount;
                    _readColumnDefinitions.call(
                        this, columnCount, resultsetCallback, noResultsetCallback,
                        errorCallback, fatalCallback);
                } else if (result.isSuccess() && !result.hasResultset()) {
                    noResultsetCallback(result);
                } else {
                    errorCallback(result);
                }
            }.bind(this));
        }.bind(this), fatalCallback);
    };

    var _sendQueryRequest = function(queryString, resultsetCallback,
                                     noResultsetCallback,
                                     errorCallback, fatalCallback) {
        var queryRequest = mySQLProtocol.generateQueryRequest(queryString);
        var queryPacket = mySQLCommunication.createPacket(queryRequest.buffer);
        mySQLCommunication.writePacket(queryPacket, function(writeInfo) {
            _readQueryResult.call(this, resultsetCallback, noResultsetCallback,
                             errorCallback, fatalCallback);
        }.bind(this), fatalCallback);
    };

    // Public methods

    Client.prototype.login = function(host, port, username, password,
                                      callback, errorCallback, fatalCallback) {
        mySQLCommunication.connect(host, port, function(result) {
            if (result >= 0) {
                _handshake.call(this, username, password, callback, fatalCallback);
            } else {
                errorCallback(result + "(" +
                              networkErrorCode.getErrorMessage(result) + ")");
            }
        }.bind(this));
    };

    Client.prototype.logout = function(callback) {
        mySQLCommunication.disconnect(callback);
    };

    Client.prototype.query = function(queryString, resultsetCallback,
                                      noResultsetCallback,
                                      errorCallback, fatalCallback) {
        if (!mySQLCommunication.isConnected()) {
            fatalCallback("Not connected.");
            return;
        }
        mySQLCommunication.resetSequenceNumber();
        _sendQueryRequest.call(this,
                               queryString, resultsetCallback, noResultsetCallback,
                               errorCallback, fatalCallback);
    };

    Client.prototype.getDatabases = function(callback, errorCallback, fatalCallback) {
        if (!mySQLCommunication.isConnected()) {
            fatalCallback("Not connected.");
            return;
        }
        this.query("SHOW DATABASES", function(columnDefinitions, resultsetRows) {
            var databases = [];
            for (var i = 0; i < resultsetRows.length; i++) {
                databases.push(resultsetRows[i].values[0]);
            }
            callback(databases);
        }.bind(this), function(result) {
            console.log("This callback function never be called.");
        }.bind(this), function(result) {
            errorCallback(result);
        }.bind(this), fatalCallback);
    };

    Client.prototype.initDB = function(schemaName, callback, fatalCallback) {
        if (!mySQLCommunication.isConnected()) {
            fatalCallback("Not connected.");
            return;
        }
        mySQLCommunication.resetSequenceNumber();
        var initDBRequest = mySQLProtocol.generateInitDBRequest(schemaName);
        var initDBPacket = mySQLCommunication.createPacket(initDBRequest.buffer);
        mySQLCommunication.writePacket(initDBPacket, function(writeInfo) {
            mySQLCommunication.readPacket(function(packet) {
                var result = mySQLProtocol.parseOkErrResultPacket(packet);
                callback(result);
            }.bind(this), fatalCallback);
        }.bind(this), fatalCallback);
    };

    Client.prototype.getStatistics = function(callback, fatalCallback) {
        if (!mySQLCommunication.isConnected()) {
            fatalCallback("Not connected.");
            return;
        }
        mySQLCommunication.resetSequenceNumber();
        var statisticsRequest = mySQLProtocol.generateStatisticsRequest();
        var statisticsPacket = mySQLCommunication.createPacket(statisticsRequest);
        mySQLCommunication.writePacket(statisticsPacket, function(writeInfo) {
            mySQLCommunication.readPacket(function(packet) {
                var statistics = mySQLProtocol.parseStatisticsResultPacket(packet);
                callback(statistics);
            }.bind(this), fatalCallback);
        }.bind(this), fatalCallback);
    };

    // Export

    MySQL.client = new Client();

})(MySQL.communication, MySQL.protocol, MySQL.networkErrorCode);

(function() {

    // Constructor

    var ChromeSocket = function() {
        this.socketId = null;
    };

    // Public methods

    ChromeSocket.prototype.connect = function(host, port, callback) {
        var id = null;
        chrome.socket.create("tcp", {}, function(createInfo) {
            id = createInfo.socketId;
            chrome.socket.connect(
                id, host, port, function(result) {
                    if (result >= 0) {
                        this.socketId = id;
                    } else {
                        this.socketId = null;
                    }
                    callback(result);
                }.bind(this));
        }.bind(this));
    };

    ChromeSocket.prototype.isConnected = function() {
        return this.socketId !== null;
    };

    ChromeSocket.prototype.disconnect = function(callback) {
        if (this.socketId) {
            chrome.socket.disconnect(this.socketId);
            chrome.socket.destroy(this.socketId);
        }
        this.socketId = null;
        if (callback) {
            callback();
        }
    };

    ChromeSocket.prototype.write = function(packet, callback, errorCallback) {
        chrome.socket.write(this.socketId, packet.getArrayBuffer(), function(writeInfo) {
            var bytesWritten = writeInfo.bytesWritten;
            if (bytesWritten > 0) {
                callback(writeInfo);
            } else {
                console.log("Error: writeInfo.bytesWritten=" + bytesWritten);
                errorCallback("Sending packet failed: " + bytesWritten);
            }
        }.bind(this));
    };

    ChromeSocket.prototype.read = function(length, callback, fatalCallback) {
        chrome.socket.read(this.socketId, length, function(readInfo) {
            var resultCode = readInfo.resultCode;
            if (resultCode > 0) {
                callback(readInfo);
            } else {
                console.log("Error: readInfo.resultCode=" + resultCode +
                            " data=" + readInfo.data);
                fatalCallback("Reading packet failed: " + resultCode);
            }
        }.bind(this));
    };

    // Export

    MySQL.ChromeSocket = ChromeSocket;

})();
