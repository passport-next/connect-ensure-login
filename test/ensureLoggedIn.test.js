'use strict';

const ensureLoggedIn = require('../lib/ensureLoggedIn');


function MockRequest() {
  this.session = {};
}

function MockResponse() {
  this.headers = {};
}

MockResponse.prototype.setHeader = function (name, value) {
  this.headers[name] = value;
};

MockResponse.prototype.redirect = function (location) {
  this._redirect = location;
  this.end();
};

MockResponse.prototype.end = function (data, encoding) {
  this._data += data;
  if (this.done) { this.done(); }
};


describe('ensureLoggedIn', () => {
  describe('middleware with a url', () => {
    const redirectTo = '/signin';
    const middleware = ensureLoggedIn(redirectTo);


    describe('when handling a request that is authenticated', () => {
      const url = '/foo';
      let err, req, res;
      before(async () => {
        ({ err, req, res } = await new Promise((resolve) => {
          const req = new MockRequest();
          req.url = url;
          req.isAuthenticated = () => true;

          const res = new MockResponse();
          res.done = () => {
            resolve({ err: new Error('should not be called') });
          };

          const next = (err) => {
            resolve({ err, req, res });
          };

          process.nextTick(() => {
            middleware(req, res, next);
          });
        }));
      });

      it('should not error', () => {
        expect(err).to.be.undefined;
      });

      it('should not redirect', () => {
        expect(res._redirect).to.be.undefined;
      });

      it('should not set returnTo', () => {
        expect(req.session.returnTo).to.be.undefined;
      });
    });


    describe('when handling a request that is not authenticated', () => {
      const url = '/foo';
      let err, req, res;
      before(async () => {
        ({ err, req, res } = await new Promise((resolve) => {
          const req = new MockRequest();
          req.url = url;
          req.isAuthenticated = () => false;

          const res = new MockResponse();
          res.done = () => {
            resolve({ req, res });
          };

          const next = (err) => {
            resolve({ err: new Error('should not be called') });
          };

          process.nextTick(() => {
            middleware(req, res, next);
          });
        }));
      });

      it('should not error', () => {
        expect(err).to.be.undefined;
      });

      it('should redirect', () => {
        expect(res._redirect).to.be.a('string').that.equals(redirectTo);
      });

      it('should set returnTo', () => {
        expect(req.session.returnTo).to.be.a('string').that.equals(url);
      });
    });


    describe('when handling a request to a sub-app that is not authenticated', () => {
      const url = '/foo';
      const originalUrl = '/sub/foo';
      let err, req, res;
      before(async () => {
        ({ err, req, res } = await new Promise((resolve) => {
          const req = new MockRequest();
          req.url = url;
          req.originalUrl = originalUrl;
          req.isAuthenticated = () => false;

          const res = new MockResponse();
          res.done = () => {
            resolve({ req, res });
          };

          const next = (err) => {
            resolve({ err: new Error('should not be called') });
          };

          process.nextTick(() => {
            middleware(req, res, next);
          });
        }));
      });

      it('should not error', () => {
        expect(err).to.be.undefined;
      });

      it('should redirect', () => {
        expect(res._redirect).to.be.a('string').that.equals(redirectTo);
      });

      it('should set returnTo', () => {
        expect(req.session.returnTo).to.be.a('string').that.equals(originalUrl);
      });
    });


    describe('when handling a request that lacks an isAuthenticated function', () => {
      const url = '/foo';
      let err, req, res;
      before(async () => {
        ({ err, req, res } = await new Promise((resolve) => {
          const req = new MockRequest();
          req.url = url;

          const res = new MockResponse();
          res.done = () => {
            resolve({ req, res });
          };

          const next = (err) => {
            resolve({ err: new Error('should not be called') });
          };

          process.nextTick(() => {
            middleware(req, res, next);
          });
        }));
      });

      it('should not error', () => {
        expect(err).to.be.undefined;
      });

      it('should redirect', () => {
        expect(res._redirect).to.be.a('string').that.equals(redirectTo);
      });

      it('should set returnTo', () => {
        expect(req.session.returnTo).to.be.a('string').that.equals(url);
      });
    });
  });


  describe('middleware with a redirectTo and setReturnTo options', () => {
    const redirectTo = '/session/new';
    const middleware = ensureLoggedIn({
      redirectTo,
      setReturnTo: false
    });


    describe('when handling a request that is not authenticated', () => {
      const url = '/foo';
      let err, req, res;
      before(async () => {
        ({ err, req, res } = await new Promise((resolve) => {
          const req = new MockRequest();
          req.url = url;
          req.isAuthenticated = () => false;

          const res = new MockResponse();
          res.done = () => {
            resolve({ req, res });
          };

          const next = (err) => {
            resolve({ err: new Error('should not be called') });
          };

          process.nextTick(() => {
            middleware(req, res, next);
          });
        }));
      });

      it('should not error', () => {
        expect(err).to.be.undefined;
      });

      it('should redirect', () => {
        expect(res._redirect).to.be.a('string').that.equals(redirectTo);
      });

      it('should not set returnTo', () => {
        expect(req.session.returnTo).to.be.undefined;
      });
    });
  });


  describe('middleware with defaults', () => {
    const redirectTo = '/login';
    const middleware = ensureLoggedIn();


    describe('when handling a request that is not authenticated', () => {
      const url = '/foo';
      let err, req, res;
      before(async () => {
        ({ err, req, res } = await new Promise((resolve) => {
          const req = new MockRequest();
          req.url = url;
          req.isAuthenticated = () => false;

          const res = new MockResponse();
          res.done = () => {
            resolve({ req, res });
          };

          const next = (err) => {
            resolve({ err: new Error('should not be called') });
          };

          process.nextTick(() => {
            middleware(req, res, next);
          });
        }));
      });

      it('should not error', () => {
        expect(err).to.be.undefined;
      });

      it('should redirect', () => {
        expect(res._redirect).to.be.a('string').that.equals(redirectTo);
      });

      it('should set returnTo', () => {
        expect(req.session.returnTo).to.be.a('string').that.equals(url);
      });
    });
  });


  describe('middleware with a url and express-session', () => {
    const redirectTo = '/signin';
    const middleware = ensureLoggedIn(redirectTo);
    let storedSession;
    const sessionStore = {
      async save(data) {
        // sleep 100 ms to simulate IO delay
        await new Promise(resolve => setTimeout(resolve, 100));
        storedSession = data;
      }
    };
    class Session {
      async save(callback) {
        await sessionStore.save(this);
        callback();
      }
    }
    class MockRequestWithSession extends MockRequest {
      constructor() {
        super(...arguments);
        this.session = new Session();
      }
    }
    class MockResponseWithSession extends MockResponse {
      redirect() {
        Object.freeze(storedSession);
        MockResponse.prototype.redirect.apply(this, arguments);
      }
    }


    describe('when handling a request that is not authenticated', () => {
      const url = '/foo';
      let err, req, res;
      let sessionBeforeRedirect;
      before(async () => {
        ({ err, req, res } = await new Promise((resolve) => {
          const req = new MockRequestWithSession();
          req.url = url;
          req.isAuthenticated = () => false;

          const res = new MockResponseWithSession();
          res.done = () => {
            resolve({ req, res });
          };

          const next = (err) => {
            resolve({ err: new Error('should not be called') });
          };

          process.nextTick(() => {
            middleware(req, res, next);
          });
        }));
      });

      it('should not error', () => {
        expect(err).to.be.undefined;
      });

      it('should redirect', () => {
        expect(res._redirect).to.be.a('string').that.equals(redirectTo);
      });

      it('should set and save returnTo before redirect', () => {
        expect(storedSession.returnTo).to.be.a('string').that.equals(url);
      });
    });
  });
});
