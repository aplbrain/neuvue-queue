import rjwt from "./restify-jwt";
import jwksRsa from "jwks-rsa";

const tokenGuard = rjwt({
  // Fetch the signing key based on the KID in the header and
  // the singing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

export default function auth0(checkScopes:Boolean, scope?:string) {
  return function mid(req:any, res:any, next:any) {
    console.log("AUTH")
    if (!scope) {
      scope = "";
    }
    tokenGuard(req, res, checkScopes, scope, (err:any) => {
      console.log(err)
      err ? res.status(500).send(err) : next();
    });
  }
};