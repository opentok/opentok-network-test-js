# Development Guidelines

This document describes tools, tasks and workflow that one needs to be familiar with in order to effectively maintain this project. If you use this package within your own software as is but don't plan on modifying it, this guide is **not** for you.

## Tools

This project is developed with [TypeScript](https://www.typescriptlang.org/) and uses [Webpack](https://webpack.js.org/) in conjunction with [Babel](https://babeljs.io/) to compile and bundle code into a browser-friendly UMD module.  To install the dependencies required for development, simply run:
```
$ npm install
```

## Tasks

### Build

To compile and bundle the package:
```
$ npm run build
```

### Test
This project's tests are written with Karma and Jasmine. Before running the tests, you will need to create a `.env` file with the following values in the root directory of the repository.
```
TEST_API_KEY={OPENTOK_API_KEY}
TEST_API_SECRET={OPENTOK_API_SECRET}
```
*You can obtain a project key and secret from the TokBox [Account Portal](https://tokbox.com/account/).*

To run the tests:
```
$ npm run test
```

### Releasing

In order to create a release, the following should be completed in order.

1. Build the project and ensure that there are no `typescript` or `tslint` errors.
1. Ensure all the tests are passing.
1. Make sure you are on the `develop` branch of the repository, with all changes merged/commited
   already.
1. Update the version number anywhere it appears in the source code and documentation. See [Versioning](#versioning) for information about selecting an appropriate version number. Files to check:
   - package.json
1. Commit the version number change with the message "Update to version x.y.z", substituting the new
   version number.
1. Create a git tag: `git tag -a vx.y.z -m "Release vx.y.z"`
1. Ensure that you have permission to update the
   [opentok npm module](https://www.npmjs.org/package/opentok)
1. Run `npm publish` to release to npm.
1. Change the version number for future development by incrementing the patch number (z) adding
   "-alpha.1" in the source code (not the documentation). For possible files, see above. Then make
   another commit with the message "Begin development on next version".
1. Push the changes to the source repository: `git push origin dev && git push --tags origin`
1. Add a description to the [GitHub Releases](https://github.com/opentok/opentok-node/releases) page with any notable changes.

## Workflow

### Versioning

The project uses [semantic versioning](http://semver.org/) as a policy for incrementing version numbers. For planned
work that will go into a future version, there should be a Milestone created in the Github Issues named with the version
number (e.g. "v2.2.1").

During development the version number should end in "-alpha.x" or "-beta.x", where x is an increasing number starting from 1.

### Branches

*  `develop` - the main development branch.
*  `master` - reflects the latest stable release.
*  `feat.foo` - feature branches. these are used for longer running tasks that cannot be accomplished in one commit.
   once merged into master, these branches should be deleted.
*  `vx.x.x` - if development for a future version/milestone has begun while master is working towards a sooner
   release, this is the naming scheme for that branch. once merged into master, these branches should be deleted.

### Tags

*  `vx.x.x` - commits are tagged with a final version number during release.

### Issues

Issues are labelled to help track their progress within the pipeline.

*  no label - these issues have not been triaged.
*  `bug` - confirmed bug. aim to have a test case that reproduces the defect.
*  `enhancement` - contains details/discussion of a new feature. it may not yet be approved or placed into a
   release/milestone.
*  `wontfix` - closed issues that were never addressed.
*  `duplicate` - closed issue that is the same to another referenced issue.
*  `question` - purely for discussion

### Management

When in doubt, find the maintainers and ask.

