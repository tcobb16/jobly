"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

// Routes that need no auth
const publicRoutes = [
  {
    method: "POST",
    route: '/auth/token',
  },
  {
    method: "GET",
    route: '/companies',
  }
];

// Routes that needs auth and admin access
const adminOnlyRoutes = [
  {
    method: "*",
    route: "/users"
  },
  {
    method: "POST",
    route: '/companies',
  },
  {
    method: "PATCH",
    route: '/companies',
  },
  {
    method: "DELETE",
    route: '/companies',
  }
]

/**
 * Check to see if the request applies to the route rules specified.
 * @param {*} req: Express request object
 * @param {*} routeRules: List of routes that apply to the rule, see {publicRoutes} above for example structure
 * 
 * Returns true if the route + method matches any rule, false otherwise
 */
function checkRouteRules(req, routeRules) {
  const url = req.url.split("?")[0];
  const method = req.method;
  for(const publicRoute of publicRoutes) {
    if(publicRoute.route === url) {
      if(publicRoute.method === method) {
        return true;
      } else if(publicRoute.method === "*") {
        return true;
      }
    }
  }

  return false;
}

function isPublicRoute(req) {
  return checkRouteRules(req, publicRoutes);
}

function isAdminOnlyRoute(req) {
  return checkRouteRules(req, adminOnlyRoutes);
}

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */
function authenticateJWT(req, res, next) {
  if(isPublicRoute(req)) {
    return next();
  }

  const authHeader = req.headers && req.headers.authorization;
  if(!authHeader) {
    throw new UnauthorizedError();
  }

  const token = authHeader.replace(/^[Bb]earer /, "").trim();
  const authUser = authToken(token);
  if(authUser) {

    if(isAdminOnlyRoute(req) && !authUser.isAdmin) {
      throw new UnauthorizedError();
    }

    res.locals.user = authUser;
    return next();
  }

  throw new UnauthorizedError();
}


function authToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch(err) {
    return null;
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
};
