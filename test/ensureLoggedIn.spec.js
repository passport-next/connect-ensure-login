'use strict'

const {expect} = require('chai');
const ensureLoggedIn = require('../lib/ensureLoggedIn');


function MockRequest() {
  this.session = {};
}

function MockResponse() {
  this.headers = {};
}

MockResponse.prototype.setHeader = function(name, value) {
  this.headers[name] = value;
}

MockResponse.prototype.redirect = function(location) {
  this._redirect = location;
  this.end();
}

MockResponse.prototype.end = function(data, encoding) {
  this._data += data;
  if (this.done) { this.done(); }
}



describe('ensureLoggedIn', () => {
  describe('middleware with a url', () => {
    const redirectTo = '/signin';
    const middleware = ensureLoggedIn(redirectTo);
    
    
    describe('when handling a request that is authenticated', () => {
      const url = '/foo';
      let err, req, res;
      before(async () => {
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.url = url;
          req.isAuthenticated = (() => true);
          
          let res = new MockResponse();
          res.done = (() => {
            resolve({err: new Error('should not be called')});
          });
          
          let next = (err => {
            resolve({err, req, res});
          });
          
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
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.url = url;
          req.isAuthenticated = (() => false);
          
          let res = new MockResponse();
          res.done = (() => {
            resolve({req, res});
          });
          
          let next = (err => {
            resolve({err: new Error('should not be called')});
          });
          
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
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.url = url;
          req.originalUrl = originalUrl;
          req.isAuthenticated = (() => false);
          
          let res = new MockResponse();
          res.done = (() => {
            resolve({req, res});
          });
          
          let next = (err => {
            resolve({err: new Error('should not be called')});
          });
          
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
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.url = url;
          
          let res = new MockResponse();
          res.done = (() => {
            resolve({req, res});
          });
          
          let next = (err => {
            resolve({err: new Error('should not be called')});
          });
          
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
      setReturnTo: false,
    });
    
    
    describe('when handling a request that is not authenticated', () => {
      const url = '/foo';
      let err, req, res;
      before(async () => {
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.url = url;
          req.isAuthenticated = (() => false);
          
          let res = new MockResponse();
          res.done = (() => {
            resolve({req, res});
          });
          
          let next = (err => {
            resolve({err: new Error('should not be called')});
          });
          
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
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.url = url;
          req.isAuthenticated = (() => false);
          
          let res = new MockResponse();
          res.done = (() => {
            resolve({req, res});
          });
          
          let next = (err => {
            resolve({err: new Error('should not be called')});
          });
          
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
});
