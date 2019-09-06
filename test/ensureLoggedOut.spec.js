'use strict'

const {expect} = require('chai');
const ensureLoggedOut = require('../lib/ensureLoggedOut');


function MockRequest() {
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



describe('ensureLoggedOut', () => {
  describe('middleware with a url', () => {
    const redirectTo = '/home';
    const middleware = ensureLoggedOut(redirectTo);
    
    
    describe('when handling a request that is authenticated', () => {
      let err, req, res;
      before(async () => {
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.isAuthenticated = (() => true);
          
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
    });
    
    
    describe('when handling a request that is not authenticated', () => {
      let err, req, res;
      before(async () => {
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.isAuthenticated = (() => false);
          
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
    });
    
    
    describe('when handling a request that lacks an isAuthenticated function', () => {
      let err, req, res;
      before(async () => {
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          
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
    });
  });
  
  
  
  describe('middleware with defaults', () => {
    const redirectTo = '/';
    const middleware = ensureLoggedOut();
    
    
    describe('when handling a request that is authenticated', () => {
      let err, req, res;
      before(async () => {
        ({err, req, res} = await new Promise(resolve => {
          let req = new MockRequest();
          req.isAuthenticated = (() => true);
          
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
    });
  });
});
