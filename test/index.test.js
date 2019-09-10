'use strict';

const login = require('../lib/index');


describe('connect-ensure-login', () => {
  describe('module', () => {
    it('should export ensureLoggedIn', () => {
      expect(login.ensureLoggedIn).to.be.a('function')
        .that.equals(login.ensureAuthenticated);
    });

    it('should export ensureLoggedOut', () => {
      expect(login.ensureLoggedOut).to.be.a('function')
        .that.equals(login.ensureNotLoggedIn)
        .and.equals(login.ensureUnauthenticated)
        .and.equals(login.ensureNotAuthenticated);
    });
  });
});
