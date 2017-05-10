# React Tutorial
Throughout this tutorial, we will be creating a modern, single-page, progressive web-application framework and sample app. Each 'part' of the project is self-contained inside its own folder with its own *index.html*, *package.json*, and source files. Subsequent parts will iterate on each other.

The application we build will be a simple, modern, progressive web application. It will have a home page and a sign-in page and barebones authentication.

**Parts 7 and 8 are not yet complete **

This tutorial will utilize the following libraries and features:

## Libraries
* [Webpack 2](https://webpack.js.org/) - build tool
* [Babel](https://babeljs.io/) - transpiler to support ES6+
* [React](https://facebook.github.io/react/) - component-based view library
* [React-Router](https://github.com/ReactTraining/react-router) - app routing
* [Redux](http://redux.js.org/) - predictable state management
* [Styled-Components](https://github.com/styled-components/styled-components) - Styled React components
* [Express.js](http://expressjs.com/) - Node.js-based development server for hosting applications
* [ESLint](http://eslint.org/) - better JavaScript linting for consistent code style
* Testing using:
    * [Karma](https://karma-runner.github.io/1.0/index.html) - runs tests in a real browser environment
    * [Mocha](https://mochajs.org/) - test framework
    * [Chai](http://chaijs.com/) - test assertions
    * [Sinon](http://sinonjs.org/) - creating test mocks, spies, stubs
    * [Enzyme](https://github.com/airbnb/enzyme) - easier testing of React components

## Features
* Hot Module Reloading - immediately show code changes on the browser using:
    * [Webpack-Dev-Middleware](https://github.com/webpack/webpack-dev-middleware) - Watches source changes and serves most up-to-date bundle to our server
    * [Webpack-Hot-Middleware](https://github.com/glenjamin/webpack-hot-middleware) - Enables hot reloading on our Express Server
    * [React-Hot-Loader 3](https://github.com/gaearon/react-hot-loader/tree/next) - Preserves state for hot-reloaded React components
* Code-splitting (lazy-loading routes) for smaller initial page load
* Service Workers - update our application and cache in the background for faster page loads

# Tutorial summary (subject to change)
## [Part 1](https://github.com/fqassem/reactTutorial/tree/master/part1)
Setting up NPM, Webpack, Babel, React, and Express.js development server

## [Part 2](https://github.com/fqassem/reactTutorial/tree/master/part2)
ESLint, Routing, and Hot-Loading

## [Part 3](https://github.com/fqassem/reactTutorial/tree/master/part3)
Production Build and Testing

## [Part 4](https://github.com/fqassem/reactTutorial/tree/master/part4)
Back-end, State Management, Forms, and Sign-in

## [Part 5](https://github.com/fqassem/reactTutorial/tree/master/part5)
Protected Routes, Sign-out, Edit Profile, and Register

## [Part 6](https://github.com/fqassem/reactTutorial/tree/master/part6)
Styled-Components, Navbar, and Grids

## [Part 7](https://github.com/fqassem/reactTutorial/tree/master/part7)
Progressive Web App Overview, Service Workers

## [Part 8](https://github.com/fqassem/reactTutorial/tree/master/part8)
The Future

# Useful Links
https://medium.com/@addyosmani/progressive-web-apps-with-react-js-part-i-introduction-50679aef2b12#.nnp1mnt10
