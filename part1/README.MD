# Part 1: Creating the Application framework
In this part, we will be creating the basic framework that we will use to build our application. There are
hundreds of 'bootstrap' React projects that you can download and start using immediately to create an application. The purpose
of this tutorial is to understand how to build and configure one yourself.

We will be using NPM for this project to manage our project dependencies. If you haven't already set up NPM, go [here](http://blog.npmjs.org/post/85484771375/how-to-install-npm) for installation instructions. You will end up installing Node as well, which we will use later in the tutorial to run our development server. Note that our initial webpack and server configuration are in ES5, but can be updated to use ES6 if desired. We do so at the end of this tutorial.

Now, create a directory for your project to live in, and let's get started.

## Milestone 1: Creating index.html
In the root of your application, create a file called *index.html*. Within this file, copy and paste the following code:

```
<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>My Application</title>
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
```
Two things to note:
* We are including a meta tag for the viewport, which will tell the browser window to behave responsively when we add our CSS
* The div with id 'root' will be where React attaches itself to the DOM

Now that we've created our index.html file, we shouldn't have to revisit it again. All of the script files and CSS will be added to our application programmatically. That means we don't have to hardcode any static assets in the HTML!

## Milestone 2: Dependency Management
If you open this *index.html* file in your browser, you have an extremely barebones web application. This won't get us too far in the world of modern web development. We're gonna need a little more to get us creating a cool web application. While writing plain CSS and regular old Javascript is definitely an option, it's much slower and error-prone than using the modern libraries and build tools available today.

**NPM** is our package manager. We could theoretically download these fancy-pants libraries we're going to use ourselves and manage them manually, but that's error-prone and tedious. Let's use NPM to do it for us. NPM (Node Package Manager) has become a widely used JavaScript package management solution.

To initialize NPM in our project, run the following command:

```
npm init -y
```

This will create a *package.json* file with default values ('-y'). This file holds all of the dependencies, scripts, and meta-data that describe our application.

Let's open this file and take a look at it. Most of the content should be self-explanatory, but there are three sections of note:

* `"scripts"` is where we will create shortcut commands to run, build, and test the project. There's already a default, pre-generated `"test"` command in there that doesn't do anything! You can run these scripts with `npm run <script_name>`. So, to run the `"test"` command, we run `npm run test` in our command line.
* `"dependencies"` and `"devDependencies"` are where the list of modules we install for our project will live. They both list the project dependencies. Note that `"devDependencies"’ will not be packaged into the final production build of our project. ‘devDependencies’, as the name implies, should only contain a list of the dependencies our project needs for development, such as transpilers, loaders, and test frameworks.

When we download a project with a *package.json* file, all we need to do is run `npm install` and NPM will look at this file and download all of the dependencies we need. NPM downloads these dependencies to a *node_modules* folder.

If we run `npm install` now, nothing useful will happen because we haven't specified any dependencies! Only an empty `node_modules` folder will be created. To install a dependency using NPM, we run `npm install <dependency-name> --<flags>`. We will include either a '--save' flag to save the dependency we want to install as a 'dependency' or a '--save-dev' flag to save it as a 'devDependency'. The difference between devDependencies and normal dependencies will be important when we build our project for production. Now that we have NPM set up, let's install some dependencies and create our project framework!

## Milestone 3: Setting up Webpack 2
**Webpack** is what we will be using to build our project. Webpack is a module bundler that process our files, manages dependencies, and spits out static assets. Basically, it will transform our code into a few modules that a browser can grab from a server and run. Let's install it:

```
npm install --save-dev webpack@2.1.0-beta.28
```

This will install Webpack 2 and add it to our *package.json* file as a 'devDependency'. Note that we include a '--save-dev' flag because we want to install Webpack 2 and have it tracked in our package.json file. If we omitted this flag, Webpack 2 would be installed, but package.json would not be updated. Always be sure to include '--save' or '--save-dev'!

Note that Webpack 2 is still in beta, but the features it includes are worth the quirks. Webpack 2 differs from Webpack 1 in a few ways, but the biggest benefit is easier code-splitting (for incremental loading via React-Router v3) and smaller generated files (due to Webpack 2’s new ‘Tree Shaking’ algorithm for resolving dependencies and eliminating dead, unreachable code in our included libraries). See [this link](https://blog.engineyard.com/2016/tree-shaking) for more info about tree-shaking.

Webpack allows us to use plugins to make the build process easier and customize it to our needs. If you think back to the HTML file we created, it doesn’t contain any script tags. This means that our app won't know about any JavaScript files it needs to run. There are two ways to solve this. One would be tell Webpack to output all of the contents of our build into a file named ‘bundle.js’ and simply include that in a script file in the bottom of our HTML file.

A better way to do this is via the **HtmlWebpackPlugin**. This plugin automatically appends our script file tags to our index.html file so we don’t have to do it manually. What is the benefit of doing it this way? Caching! We will set up our Webpack build to append a hash to the file name of the generated JavaScript. This way, the browser knows that if the hash changed, it should download the new file. This will save a good amount of bandwidth when we split our code into modules and prevent us from having to hard code any dependencies in *index.html*!

Let's install the HtmlWebpackPlugin as a devDependency:

```
npm install --save-dev html-webpack-plugin
```

Now that we have installed Webpack and the HtmlWebpackPlugin, we need to configure Webpack to generate a build for us. Let's create this config now. Create a file in the root of your app called *webpack.config.js* and copy and paste the following:

```
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        app: path.join(__dirname, './src')
    },
    output: {        
        path: path.join(__dirname, './build'),
        filename: '[name].[hash].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
            filename: 'index.html',
            inject: 'body'
        })
    ]
}
```

We are including the HtmlWebpackPlugin, and 'path' in our config. 'path' is a Node module that will help us resolve relative paths to files easier.

`"entry"` is where we define the 'bundles' we want our project’s build to create after Webpack does transpilation, dependency resolution, and tree-shaking. Right now we only have one bundle named `app` that will include all of the processed files from our 'src' directory.

`"output"` defines how the 'bundles' will be named and where they will end up. Here we are telling Webpack to put these bundles into a *build* directory. These files will be named with the provided bundle name ("[name]", taken from the key in the `"entry"` config) and a hash that Webpack generates to help with caching. In our case, the output bundle will be named: *app.[generated_hash].js'*

`"plugins"` defines Webpack plugins that affect the build process. Common plugins defined here include minification plugins, dedupe plugins, and HTML generation plugins, among others. We are using the HtmlWebpackPlugin. This plugin modifies the HTML we wrote to include the Javascript files we generated from the Webpack build dynamically! The configuration basically says to ‘inject’ the generated script files after the ‘body’ tag of the supplied ‘index.html’ template file. Now, we have a fully functioning Webpack 2 configuration.

So, let's build our project. From the root of our app, run:

```
./node_modules/.bin/webpack
```

Error! Webpack should complain that it can't find the *src/* folder. That's because we haven't created it yet! Let's create the 'src' folder to house all of our project source code. Next, in this src folder, create an *index.js* file with the following contents:

```
alert('Hi! Your app is working!');
```

Super simple! Now, let's try building our project again:
```
./node_modules/.bin/webpack
```

Success! Webpack has created a 'build' folder with two files:
* app.<hash>.js, just as we specified in 'entry' and 'output' in our Webpack config!
* index.html, that looks like the index.html in our root, but with an additional script tag that includes the 'app.<hash>.js' file generated by Webpack (thanks to the HtmlWebpackPlugin).

Let's recap:
* We initialized our NPM package manager
* We installed and set up our build system with Webpack 2
* We successfully created a Webpack build

If you're super impatient, you can host the contents of the build folder in whatever server you choose and see the app working! But hold on! In the next section, we're going to create a server that will automatically host these files for us as a part of the build!

## Milestone 4: Setting up the development server
Let's create the development server to host the files that Webpack generates. We have two options here:
1. Use [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html)
2. Create our own dev-server using Express.js

I prefer the second option simply because we get more control over the server. So let's create and set up a server to host our application.

Let's install the dependencies we will need for the server. For our sever, we want to enable a feature called 'hot reloading'. This will automatically show updates in our browser without having to rebuild our code, saving us development time. We will need to install three modules for this to work:

1. Express, for running our dev server
2. webpack-dev-middleware, dependency for hot reloading
3. webpack-hot-middleware, dependency for hot reloading
4. connect-history-api-fallback, for helping server resolve routes

To install these packages, run:
```
npm install --save-dev express webpack-dev-middleware webpack-hot-middleware connect-history-api-fallback
```

Create a file called *devServer.js* in the root of the application. Here's the code for the server:

```
const webpack = require('webpack');
const express = require('express');
const path = require('path');
const historyApiFallback = require('connect-history-api-fallback');

const app = express();
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

const webpackConfig = require('./webpack.config');
const compiler = webpack(webpackConfig);

const serverConfig = {
    hot: true, // to enable hot loading
    publicPath: webpackConfig.output.publicPath //where to server our assets from
};

app.use(
    historyApiFallback() //route requests through index.html
);

//Use previously defined middleware
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost');

```

The middleware we're using is essentially plugging itself between the server and the build, and listening for file changes. When it hears a file change, it updates the file and in turn updates the code in the browser without requiring the user to refresh the page.

Note that we're using **historyApiFallback** because of the nature of single page applications. If you go to 'localhost:8000/somewhere' on your browser, a request to the server is made, and the server looks for this file. Because we are writing a single page application, all of the routing will be done client side. historyApiFallback makes it so that these requests will be processed through the routing on the client side rather than on the server.

Before we continue, we need to make two small changes in the *webpack.config.js* file. Change
```
app: [
   path.join(__dirname, './src')
]
```

to:
```
app: [
    'webpack-hot-middleware/client?path=/__webpack_hmr',
    path.join(__dirname, './src')
]
```

This configures the server to receive notifications when the bundle rebuilds and updates our client bundle to reflect the changes.

Next, make sure your `"plugins"` array looks like this:

```
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
            filename: 'index.html',
            inject: 'body'
        })
    ]
```

According to the **webpack-hot-middleware** documentation: "OccurrenceOrderPlugin ensures consistent build hashes, hot module replacement is somewhat self-explanatory, no errors is used to handle errors more cleanly."

To start the server, run the following command in the root of the project
```
node ./devServer.js
```

And go to 'localhost:8001' and you'll see an alert window, signifying that our app is hosted and running.

Note that, though we're now set up for hot reloading, we'll need more configuration for it to work correctly. We'll save that for a little later in the tutorial.

A useful side-effect of using Webpack-Dev-Middleware is that all the files outputted by Webpack during the build are no longer written to disk. Instead, they are maintained in memory. That means we can get rid of our 'build' folder by running `rm -rf ./build` in our project root. Also, because we no longer have a folder to output to, we can modify our *webpack.config.js* file and remove the `path` line in the `output` section.

Now that our dev server is up and running, let's start writing React in ES6!

## Milestone 5: Babel and React setup
Let's create our first React component using ES6 classes. While it's possible to write React without using ES6, the syntax is pretty clunky and hard to read. Before we start, let's install the dependencies we need for React using NPM.

```
npm install --save react
npm install --save react-dom
```

'react' is the *React* library. 'react-dom' is a dependency React needs to attach itself to the DOM. Note that we're installing these not as 'devDependencies', but as regular 'dependencies' using the '--save' flag. This is because React and ReactDom are required on the browser to run our application.

Open up *index.js* and clear the file. Let's create our application entry point:

```
import React from 'react';
import { render } from 'react-dom';

class Main extends React.Component {
    render() {
        return (
            <h1>Hello, world!</h1>
        );
    }
}
render(<Main/>, document.getElementById('root'));
```

Using ES6 module `import` syntax, we import React and 'render' and create a simple 'Main' component for our application. Then we call render and attach the Main component to the DOM at the div with id 'root'. Remember the `<div id="root"></div>` in our index.html file? That's where React will attach itself, render, and update using ReactDOM. Notice that, in the 'render' function, we are writing what is called JSX. JSX is a language that allows us to write HTML within our Javascript.

Now, let's try running our development server to build and host the application:

`node ./devServer.js`

We get an error that says "Module Parse Failed". This is because JSX needs to be compiled down into Javascript during a build process - it's not natively understood by browsers.

So, we need something that can allow us to write JSX and output JavaScript. For now, as a quick exercise, let's replace the JSX in our render() with a pure JavaScript call to `React.createElement()` just to get our example working. Note that we're not required to use JSX to write React. It just makes our render() function cleaner and more familiar.

Replace `<h1>Hello, world!</h1>` with `React.createElement("span", null, "Hello, world!")`. Then replace

```
render(<Main/>, document.getElementById('root'));
```

with

```
render(React.createElement(Main, null, null), document.getElementById('root'));
```

and run the application again:

```
node ./devServer.js
```

If we go to 'localhost:8001' in Chrome, we'll see 'hello, world!' output onto the screen! Cool!

Note that this example works in Chrome because Chrome understands ES6 syntax. If you opened the JavaScript file that Webpack generated, it hasn't done anything to the JavaScript we wrote. It's still using ES6. If we tried running this application as it is in Internet Explorer 11, it would fail because IE 11 does not understand ES6.

How can we make it so we write ES6 code and have it run on all browsers, not just the latest and greatest, shiny ones? How can we write JSX instead of making calls to React.createElement()?

Babel is a library that will allow us to transpile our ES6 code into ES5, which is the latest standard that all browsers fully support. It requires a bit of setup, but it is well worth the investment.

Revert the changes we did to our index.js file. Make sure it looks like this (using JSX and ES6):

```
import React from 'react';
import { render } from 'react-dom';

class Main extends React.Component {
    render() {
        return (
            <h1>Hello, world!</h1>
        );
    }
}
render(<Main/>, document.getElementById('root'));
```

Now, let's start by installing Babel:

```
npm install --save-dev babel-core babel-loader
```

**babel-core** is the heart of Babel. **babel-loader** is a 'loader' we will use to configure Webpack to use in order to load files for processing by Babel. 'Loaders' are a Webpack concept that we'll see more of in other sections of our tutorial, but they essentially tell Webpack to use a certain library (or libraries) to process files during the build.

By default, Babel is pretty stupid. It doesn’t know anything about ES6 or React. It requires us to download ‘presets’ that it uses to understand how to transpile the ES6 and React/JSX code we’re going to write. We need to install the following:

npm install —save-dev babel-preset-react
npm install —save-dev babel-preset-latest //contains knowledge of ES6 and later version of ES so we can use ES7 features too!

**babel-preset-react** contains knowledge of JSX. **babel-preset-latest** contains knowledge of ES6 and ES7. Next, we need to create a configuration for Babel to read these presets. In the root of the app, create a file called *.babelrc* with the following contents:
```
{
	  "presets": ["latest", "react"]
}
```

This tells Babel to use the presets we've installed when Webpack builds the app. The last thing we need to do is configure Webpack to use Babel process our Javascript files. In *webpack.config.js*, create a new section in the config that looks like this:

```
{
    plugins: [...],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                include: /src/,
                loader: 'babel-loader'
            }
        ]
    }
}
```

This section contains a list of ‘rules’ (this section was originally titled ‘loaders’ in Webpack 1). 'rules' simply contains a list of the loaders you need for your project build.

Now, run the project and visit 'localhost:8001' and see that our app is running correctly! If you open up the JavaScript file that Webpack generated, you will see that it no longer contains any ES6 syntax because it's been transpiled by Babel! Also notice that we don't see any errors about parsing JSX because Babel knows about JSX and compiled it down to regular old ES5 JavaScript!

Now, we have a framework in which we can write React in ES6!

## Milestone 6 (Bonus): Writing our configuration in ES6
Notice all of our configuration is currently in ES5. If we want to write it in ES6, we can simply install **babel-register** as a devDependency in our project:

```
npm install --save-dev babel-register
```

Babel-Register will transpile our configuration files from ES6 to ES5 so we can have a single language in our code base. Now, our build command becomes:

```
node -r babel-register ./devServer.js
```

'-r' tells Node to use the 'babel-register' package during the build. Now, if we change our build files to use ES6 syntax, everything will work as expected. Here is are ES6 versions of *webpack.config.js*:

```
import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: {
        app: [
            'webpack-hot-middleware/client?path=/__webpack_hmr',
            path.join(__dirname, './src')
        ]
    },
    output: {
        filename: '[name].[hash].js',
        publicPath: '/'
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
            filename: 'index.html',
            inject: 'body'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js)$/,
                include: /src/,
                loader: 'babel-loader'
            }
        ]
    }
};
```

and of *devServer.js*:

```
import webpack from 'webpack';// webpack = require('webpack');
import express from 'express';
import path from 'path';
import historyApiFallback from 'connect-history-api-fallback';

import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

import webpackConfig from './webpack.config';

const app = express();
const compiler = webpack(webpackConfig);

const serverConfig = {
    hot: true, // to enable hot loading
    publicPath: webpackConfig.output.publicPath //where to server our assets from
};

app.use(
    historyApiFallback() //route requests through index.html
);

//Use previously defined middleware
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost');
```

Finally, instead of typing `node -r babel-register ./devServer.js` every time we want to build and run our project, let's create a shortcut for it in *package.json*:

```
...
    scripts: {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "node -r babel-register ./devServer.js"
    }
```

And now we can run `npm run start` instead!
