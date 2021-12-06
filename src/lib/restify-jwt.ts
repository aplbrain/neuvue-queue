import jwt from "jsonwebtoken";
import unless from "express-unless";
import async from "async";

// import InvalidCredentialsError from "restify-errors/InvalidCredentialsError";
// import UnauthorizedError from "restify-errors/UnauthorizedError";
 
const DEFAULT_REVOKED_FUNCTION = function (_:any, __:any, cb:any) {
  return cb(null, false);
};

const getClass = {}.toString;

function isFunction(object:any) {
  return object && getClass.call(object) === "[object Function]";
}

function wrapStaticSecretInCallback(secret:any) {
  return function (_:any, __:any, cb:any) {
    return cb(null, secret);
  };
}

export default function rjwt(options:any) {
  if (!options || !options.secret) throw new Error("secret should be set");

  let secretCallback = options.secret;

  if (!isFunction(secretCallback)) {
    secretCallback = wrapStaticSecretInCallback(secretCallback);
  }

  const isRevokedCallback = options.isRevoked || DEFAULT_REVOKED_FUNCTION;

  const _requestProperty =
    options.userProperty || options.requestProperty || "user";
  const credentialsRequired =
    typeof options.credentialsRequired === "undefined"
      ? true
      : options.credentialsRequired;

  const middleware = function (req:any, res:any, checkScopes:Boolean, scope:string, next:any) {
    let token:any;

    if (
      req.method === "OPTIONS" &&
      req.headers.hasOwnProperty("access-control-request-headers")
    ) {
      const hasAuthInAccessControl = !!~req.headers[
        "access-control-request-headers"
        ]
        .split(",")
        .map(function (header:any) {
          return header.trim();
        })
        .indexOf("authorization");

      if (hasAuthInAccessControl) {
        return next();
      }
    }

    if (options.getToken && typeof options.getToken === "function") {
      try {
        token = options.getToken(req);
      } catch (e) {
        return next(e);
      }
    } else if (req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        } else {
          return res.send(
            new Error(
              "Format is Authorization: Bearer [token]"
            )
          );
        }
      } else {
        return res.send(
          new Error(
            "Format is Authorization: Bearer [token]"
          )
        );
      }
    }

    if (!token) {
      if (credentialsRequired) {
        return res.send(
          new Error(
            "No authorization token was found"
          )
        );
      } else {
        return next();
      }
    }

    const idToken = jwt.decode(token, {complete: true});
    if (idToken) {
      console.log(idToken.payload.permissions)
    }
    if (idToken === null)
      return res.send(
        new Error("Invalid token provided")
      );
    // CODE JUSTIN WROTE TO CHECK IF THE PERMISSIONS OF THE TOKEN ARE RIGHT
    // THIS WAS NOT WRITTEN BY A PROFESSIONAL BACKEND DEV - juryrigged from express code
    if (checkScopes) {
      console.log(scope);
      const hasExpectedScopes = idToken.payload.permissions.includes(scope);
      // something like this can be done to implement checking of multiple scopes
      // const hasExpectedScopes = expectedScopes.every(s => idToken.payload.permissions.includes(s));

      var client_credentials_flag = false;
      // This is to check if the grant type was client-credentials. These should always pass
      if (idToken.payload.gty) {
        if (idToken.payload.gty == "client-credentials") {
          client_credentials_flag = true;
          console.log("Passed with client-credentials grant type")
        }
      }
      if (!hasExpectedScopes && !client_credentials_flag) {
        console.log("Token valid but insufficient permissions")
        return res.send(
          new Error(
            "Insufficient permissions on token"
          )
        );      }
      else {
        console.log("Permissions granted!")
      }

    }
    console.log("Token valid")
    async.parallel(
      [
        function (callback) {
          const arity = secretCallback.length;
          if (arity === 4) {
            secretCallback(
              req,
              idToken.header,
              idToken.payload,
              callback
            );
          } else {
            // arity == 3
            secretCallback(req, idToken.payload, callback);
          }
        },
        function (callback) {
          isRevokedCallback(req, idToken.payload, callback);
        }
      ],
      function (err, results:any) {
        if (err) {
          return res.send(err);
        }
        const revoked = results[1];
        if (revoked) {
          return res.send(
            new Error("The token has been revoked.")
          );
        }

        const secret = results[0];

        jwt.verify(token, secret, options, function (err:any, decoded:any) {
          if (err && credentialsRequired)
            return res.send(
              new Error(err.message)
            );

          req[_requestProperty] = decoded;
          next();
        });
      }
    );
  };

  middleware.unless = unless;

  return middleware;
};