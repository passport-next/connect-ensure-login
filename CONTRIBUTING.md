## Contributing

Pull Requests are welcome for any issues, if you have any questions please
[raise an issue](https://github.com/passport-next/connect-ensure-login/issues).

If you discover a security issue please create an issue stating you've discovered a security
issue but don't divulge the issue, one of the maintainers will respond with an email address
you can send the details to. Once the issue has been patched the details can be made public.

If you wish to join the team please raise an issue and one of the maintainers will assess your
request.

## Tests

The test suite is located in the `test/` directory.  All new features are
expected to have corresponding test cases with complete code coverage.  Patches
that increase test coverage are happily accepted.

Ensure that the test suite passes by executing:

```bash
$ npm test
```

Ensure that lint passes
```bash
$ npm run lint
```

Some lint errors can be fixed with

```bash
npm run lintfix
```

Coverage reports can be generated and viewed by executing:

```bash
npm run coverage
```

The output in html form will be in `var/coverage`

Templates such as README.md can be updated via

```bash
npm run templates
```

If you are starting a new project run

```bash
npm run init-new-project
```
**WARNING** This will overwrite files which are listed in the `ignoreExisting` array of `templates/variables.js`
