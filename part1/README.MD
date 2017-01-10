# Part 1: Creating the Application framework
In this part, we will be creating the basic framework that we will use to build our application. There are
hundreds of 'bootstrap' React projects that you can download, each with their own libraries and configuration to get you started. The purpose of this tutorial is to understand how to build and configure one yourself.

We will be using Node to run our project and NPM to manage our project dependencies. Go [here](http://blog.npmjs.org/post/85484771375/how-to-install-npm) for installation instructions. You will end up installing Node and NPM together. Note that our initial Webpack and server configuration files are in ES5, but can be updated to use ES6 if desired. We do so at the end of this tutorial.

Now, create a directory for your project to live in and let's get started.

## Milestone 1: Creating *index.html*
Let's first create our *index.html*, the entry-point of our application. In the directory you just made, create a file called *index.html*. Within this file, copy and paste the following:

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

Now that we've created our *index.html*, we shouldn't have to revisit it again for a while. All of the script files our application needs to load during initialization will be added to our *index.html* file during the Webpack build. That means we don't have to hard-code any static assets in the HTML!

## Milestone 2: Dependency Management
If you open this *index.html* file in your browser, you have an extremely barebones web application!

Sadly, this dinky little HTML file alone won't get us too far in the world of modern web development. We're gonna need a little more to get us going. While writing plain CSS and regular old JavaScript is an option, it's much slower and more error-prone than using the modern libraries and build-tools available today.

We could theoretically download some fancy-pants JavaScript libraries and manage them ourselves, but that's tedious and a waste of our valuable development time. Let's have **NPM** do it for us. NPM (Node Package Manager) has become a widely used JavaScript package management solution that we will use extensively in this project.

To initialize NPM in our project, run the following command:

```
npm init -y
```

This will create a *package.json* file with default values ('-y'). This file is used by NPM to manage all of the dependencies, scripts, and meta-data that describe our application.

Let's open this file and take a look at it. Most of the content should be self-explanatory, but there are three sections of note: `"scripts"`, `"devDependencies"`, and `"dependencies"`.

`"scripts"` is where we will create shortcut commands to run, build, and test the project. There's already a default, pre-generated `"test"` command in there that doesn't do anything useful. You can run these scripts with `npm run <script_name>`. So, to run the `"test"` command, we run `npm run test` in our console. We'll create some scripts throughout this tutorial. Note that `start` and `test` are special NPM commands that don't require `run`, but we include it for the sake of consistency.

When we start installing packages, `"dependencies"` and `"devDependencies"` will appear in *package.json*. These sections contain a list a list of modules we require for our project to build and run. Note that `"devDependencies"` will not be packaged into the final production build of our project. `"devDependencies"`, as the name implies, should only contain a list of the dependencies our project needs for development, such as transpilers, loaders, and test frameworks, while `"dependencies"` should contain libraries needed for your application to run in a browser, such as React and Redux. When we run `npm install`, the modules listed in these sections will end up in a *node_modules* folder that NPM automatically creates for us.

If we run `npm install` now, nothing useful will happen. That's because we haven't specified any dependencies yet, so there's nothing for NPM to download. To install a dependency using NPM, we run `npm install <dependency-name> <flag>`. We will include either a `--save` flag to save the dependency we want to install as a 'dependency' or a `--save-dev` flag to save it as a 'devDependency'. The difference between devDependencies and normal dependencies will be important down the road when we build our project for production. Now that we have NPM set up, let's install some dependencies and create our project framework!

## Milestone 3: Setting up Webpack 2
**Webpack** is what we will be using to build our project. Webpack is a module bundler that process our files, manages project dependencies, and spits out static assets. Basically, it will transform our code into a few modules that a browser can grab from a server and run. Let's install it:

```
npm install --save-dev webpack@beta
```

This will install Webpack 2 and add it to our *package.json* file as a 'devDependency'. Note that we include a '--save-dev' flag because we want to install Webpack 2 and have it tracked in our package.json file. If we omitted this flag, Webpack 2 would be installed, but *package.json* would not be updated. We want it to be a 'devDependency' because Webpack is our build tool. It won't be needed on the browser to run any code, so it's not a 'dependency'. Always be sure to include a '--save' or '--save-dev' flag when you want to install an NPM package if you want it tracked in *package.json*!

Note that Webpack 2 is now a *release candidate*, but the features it provides are worth the small quirks. Webpack 2 differs from Webpack 1 in a few ways. The biggest benefit is easier code-splitting (for incremental-loading/lazy-loading routes via React-Router v3/4) and smaller generated files due to the new ‘Tree Shaking’ algorithm for resolving dependencies. This helps to eliminate dead, unreachable code in our build output. See [this link](https://blog.engineyard.com/2016/tree-shaking) for more info about this algorithm.

Webpack allows us to use plugins to make the build process easier and customize it to our needs. If you think back to the HTML file we created, it doesn’t contain any script tags. This means that our app won't know about any JavaScript files it needs to run. There are two ways to solve this. One would be configure Webpack to output all of the contents of our build into a file named ‘bundle.js’ and simply hard-code a script tag referencing that file in the bottom of our *index.html*.

A better way to do this is by using the **HtmlWebpackPlugin**. This Webpack plugin automatically appends our script file tags to our *index.html* file so we don’t have to do it manually. What is the benefit of doing it this way? Caching! We will set up our Webpack build to append a hash to the file name of the generated JavaScript bundle. This way, the browser knows that if the hash changed, it should download the newer file. Subsequent loads of our website are much faster and the user only gets new code only when they need it!

Let's install the HtmlWebpackPlugin as a 'devDependency':

```
npm install --save-dev html-webpack-plugin
```

Now that we have installed Webpack and the HtmlWebpackPlugin, we need to configure Webpack to generate a build for us. Let's create this config now. Create a file in the root of your app called *webpack.config.js* and copy and paste the following:

```
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        app: path.join(__dirname, './src/index.js')
    },
    output: {        
        path: path.join(__dirname, './build'),
        filename: '[name].[hash].js',
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
            inject: 'body'
        })
    ]
}
```

We are requiring Webpack, HtmlWebpackPlugin, and 'path' in our config. 'path' is a Node module that will help us resolve relative paths to files.

`"entry"` is where we define the 'bundles' (or 'chunks') we want our build to create after Webpack does transpilation, dependency resolution, and tree-shaking. Right now, we only have one bundle named `app` defined by our main entry point: `src/index.js`. We haven't yet created this file, but we will soon!

`"output"` defines how the generated 'bundles' will be named and where they will end up. Here we are telling Webpack to put these bundles into a *build* directory (using the 'path' configuration). These files will be named with the provided bundle name ("[name]", taken from the key in the `"entry"` config) and a build hash that Webpack generates to help with caching. In our case, the output bundle will be named: *app.[generated_hash].js*. 'publicPath' is a bit confusing. It's where our (yet-to-be-set-up) development server will resolve the location of our output files. 'publicPath' can be a bit complicated to set up if you're using a CDN or hosting files elsewhere, but our config should suffice for now. If you're curious, see this [link](https://github.com/webpack/docs/wiki/configuration#outputpublicpath) for more info.

Side note: `[...]` in Webpack configs are placeholder strings. `[name]` returns an `entry` name. `[hash]` returns the hash of the build. `[path]` returns an `entry` path. `[chunkHash]` returns a hash for a specfic 'chunk' or 'bundle' of code.

`"plugins"` defines Webpack plugins that affect the build process. Common plugins defined here include minification plugins, dedupe plugins, and HTML generation plugins, among others. For now, we are creating a development-only build, so we have no need for minification or deduping yet.

We are using HtmlWebpackPlugin in our build, so we include it in the `plugins` array. This plugin modifies the HTML we wrote to dynamically include the bundles Webpack generated! Its configuration basically says to ‘inject’ the generated script files after the ‘body’ tag of the supplied template *index.html* file. If you wanted, you could have HtmlWebpackPlugin generate an *index.html* file completely from scratch! We instead supply it with a 'template' file (our *index.html*) it can append to. If we had a simple project, getting HtmlWebpackPlugin to generate our *index.html* would suffice. We will be adding a lot more cool, custom stuff to our *index.html* later in the tutorial, so we created our own.

Now, we have a fully functioning Webpack 2 configuration. So, let's build our project. From the root of our app, run:

```
./node_modules/.bin/webpack
```

to have Webpack run the build. By default, Webpack will look for a file named *webpack.config.js*. It will use that configuration to generate the build.

**Error!** Webpack should complain that it can't find the *src/* folder. That's because we haven't created it yet! Because creating a build without anything to build is essentially pointless, let's create the *src* folder to house all of our project source code. Next, in this folder, create an *index.js* file with the following contents:

```
alert('Hi! Your app is working!');
```

For now, this will be a simple placeholder to show our project is working! Now, let's try building our project again from our app's root:

```
./node_modules/.bin/webpack
```

Success! Webpack has created a *build* folder in the root of our app with two files:
* *app.[hash].js*, just as we specified in 'entry' and 'output' in our Webpack config!
* *index.html* - it looks like the *index.html* in our root, but with an dynamically added script tag that includes the *app.[hash].js* file generated by Webpack (thanks, HtmlWebpackPlugin!).

That's exactly how we configured Webpack to behave! Let's recap. So far:
* We initialized our NPM package manager
* We installed and set up our Webpack 2 build system
* We successfully created a Webpack build that generated our final *index.html* and a JavaScript bundle

If you're super impatient, you can host the contents of the *build* folder using a server of your choice and see the app working! But hold on! In the next section, we're going to create a server that will automatically host these files for us as a part of the build!

## Milestone 4: Setting up the development server
Let's create the development server to host the files that we generated with Webpack. We have two options here:

1. Use [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html)
2. Create our own dev-server using Express.js

The first option is quicker to set up, while the second option gives more control over the server and its configuration. Let's pick option '2' and create our own dev server from scratch using Express! Later in the tutorial, we'll also create some APIs hosted by Express that we can call from our application!

We'll begin by installing the dependencies necessary for the server to run. For development, we want to enable a feature called 'hot reloading'. This feature automatically reflects any update to our code in the browser without having to restart the server or manually create a new build, saving us development time. In this section, we will set up the framework for hot reloading. Because our app is super simple, we can get away without fully configuring hot-reloading for now. We'll come back to it in a later section of the tutorial when our code becomes a bit more complex. You'll see why once we set it up!

To create our sever, we need:

1. Express, a Node.js-based framework for running our dev server
2. webpack-dev-middleware, middleware to serve our build files to the server
3. webpack-hot-middleware, a dependency for hot reloading
4. react-hot-loader 3, used to hot load our React components and preserve their state
5. connect-history-api-fallback, for helping the server resolve routes

To install these packages as 'devDependencies', run:
```
npm install --save-dev express webpack-dev-middleware webpack-hot-middleware react-hot-loader@3.0.0-beta.6 connect-history-api-fallback
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
const compiler = webpack(webpackConfig); //run the webpack build

const serverConfig = {
    publicPath: webpackConfig.output.publicPath //where to serve our assets from
};

app.use(
    historyApiFallback() //route requests through index.html
);

//Use previously defined middleware
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost');
```

Note that the server will automatically run our Webpack build when it starts up!

Also note that we're using **historyApiFallback** because of the nature of single page applications. If you go to 'localhost:8001/some_route' in your browser, a request to the server is made, and the server tries to resolve this 'some_route' path you passed in to a resource. In a single page application, all these resources (pages) are on the client, so the server doesn't know about them and an error is returned to the browser. In other words, all of our routing will be done client side. 'historyApiFallback' makes it so that these requests will be processed through the routing on the client side rather than on the server. It does this by routing server requests to pages through *index.html*, which will contain routing logic we need for our single page app. We will set up routing on the client in the next part of the tutorial along with hot-reloading.

The middleware we're using is essentially plugging itself between the server and the build, and listening for file changes. When it hears a file change, it updates the file and in turn updates the code in the browser without requiring us to refresh the page. At least, it will when we fully configure it in the next part of the tutorial!

Finally, the last line of the configuration specifies that we want to run our app on port 8001 on 'localhost'. You can change these values if you like.

Before we continue, we need to make a small change to the *webpack.config.js* file. First, change:

```
app: [
   path.join(__dirname, './src/index.js')
]
```

to:

```
app: [
    'webpack-hot-middleware/client', //connect to the server to receive notifications when the bundle rebuilds
    path.join(__dirname, './src/index.js')
]
```
This configures the server to receive notifications when the application rebuilds and updates our code in the browser to reflect the changes.

Next, make sure your `"plugins"` array looks like this:

```
    plugins: [
        new webpack.EnvironmentPlugin([
            'NODE_ENV'
        ]),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './index.html'),
            filename: 'index.html',
            inject: 'body'
        })
    ]
```

We've added a few plugins to make our lives easier! **EnvironmentPlugin** allows us to reference environment variables in the application. When we build our application, we will pass in a 'NODE_ENV' variable in the command-line that we will need to access within the application. This variable will allow us to turn off/on certain application features.

**HotModuleReplacementPlugin** is necessary for enabling hot module replacement (HMR, or 'hot-reloading). **NoErrorsPlugin** is used to handle build errors more cleanly. By default, Webpack will still create junk build files if an error occurred during the build. NoErrorsPlugin makes it so no files are created if an error occurred, keeping our build folder clean!

To start the server, run the following command in the root of the project:
```
NODE_ENV=development node ./devServer.js
```

Go to 'localhost:8001'. You'll see an alert window that we created in *src/index.js*, signifying that our app built correctly and is hosted and running. Note that we are no longer explicitly running Webpack to build the project. Webpack is run when the devServer is started up.

We are passing in the NODE_ENV environment variable in the command line. In the future, this will allow us to toggle certain features in our application based on the environment. For now, we just have a development build, so we pass in 'development'. Later, we will split our config for development and production builds, but for now a single development build will suffice.

Note that we're not yet fully set-up for hot-reloading. If you update the code and save, you may see an warning in the console saying `"The following modules couldn't be hot updated: (Full reload needed)"`. We'll fix this in the next section!

A useful side-effect of using Webpack-Dev-Middleware on our server is that all the files outputted by Webpack during the build are no longer written to disk. Instead, they are maintained in memory. That means we no longer need our *build* directory to hold the output of our build. Instead of deleting this configuration in *webpack.config.js*, let's keep it. That way, if we ever need to simply build our app and have the files outputted to a folder, the output will have a place to live. Since we are currently working on a 'development' build, let's change the name of this `output` directory from 'build' to 'dev' in *webpack.config.js* so it's obvious what this directory contains. Now, since we no longer need the *build* directory, go ahead and delete it: `rm -rf ./build/`

Now that our dev server is up and running and we have a working build, let's start writing React in ES6!

## Milestone 5: Babel and React setup
Let's take the first step to creating our application! We've chosen React as our front-end library, and we'll write components using ES6 classes. While it's possible to write React without using ES6, the syntax is pretty clunky and hard to read. Before we start, let's install the dependencies we need for React using NPM.

```
npm install --save react
npm install --save react-dom
```

'react' is the *React* core library. 'react-dom' is a dependency that React needs to attach itself to the DOM. Note that we're installing these not as 'devDependency's, but as regular 'dependency's using the '--save' flag. This is because React and React-DOM are required on the browser to run our application.

Open up *src/index.js* and clear the file. Let's create our application entry point:

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

Using the ES6 module 'import' syntax, we import React. We also import React-DOM's `render` function. Next, we create a simple 'Main' component for our application that extends `React.Component`. All our componenent does is display 'Hello, world!'.

Then we call `render` and attach the `Main` component to the DOM at the div with id 'root'. Remember `<div id="root"></div>` in our *index.html* file? That's where we're attaching our application! Notice, in the `render` function, we are writing **JSX**. [JSX](https://facebook.github.io/jsx/) is a language that allows us to write HTML-like syntax within our JavaScript.

Now, let's try running our development server to build and host the application:

```
NODE_ENV=development node ./devServer.js
```

We get an error that says "Module Parse Failed". Webpack sees the JSX we created and thinks we've made a mistake in our JavaScript. JSX must be transformed into JavaScript before it's run on the browser. It's not natively understood by Webpack or browsers.

So, we need something in our build to translate JSX into JavaScript! We'll get to that in a bit. For now, just to get our example working, let's replace the JSX in our `render` function with a pure JavaScript call to `React.createElement()`. Note that we're not required to use JSX to write React. In fact, when we finish our setup, JSX will be transfromed into `React.createElement` calls during the Webpack build. JSX is simply syntactic sugar over `React.createElement()`. We use JSX because it just makes our `render` function cleaner, easier to read, and almost 1:1 with HTML.

To get our example working quickly without any more build configuration, replace `<h1>Hello, world!</h1>` with `React.createElement("h1", null, "Hello, world!")`. Then replace

```
render(<Main/>, document.getElementById('root'));
```

with

```
render(React.createElement(Main, null, null), document.getElementById('root'));
```

What we've done here is replace JSX with its JavaScript equivalent. Yeah. It's hideous. We definitely want to use JSX while writing our code! For now, let's just live with it and run the application:

```
NODE_ENV=development node ./devServer.js
```

If we go to 'localhost:8001' in Chrome, we'll see 'Hello, world!' on the screen! Cool! Even though our code is uglier than we'd like, it runs without anything extra needed in our build.

If you open the JavaScript source file for our application, you'll see that nothing has been done to the code we wrote. It's simply been packaged up. It's still using ES6 syntax! If we tried running this application as it is using Internet Explorer 11, it would fail because IE 11 does not understand ES6 syntax! Sadly, not all browsers fully support ES6. Only the most modern WebKit browsers have 100% ES6 support!

Rather than revert to development using old-school ES5, how can we write ES6 code and have it run on all browsers, not just the latest and greatest? How can we write JSX instead of making calls to `React.createElement`?

**Babel** is a library that will allow us to transpile our JSX into JavaScript and our ES6 code into ES5, which is the latest standard that all browsers fully support. It requires a bit of setup, but it is well worth the investment.

Revert the changes we did to our *index.js* file. Make sure it looks like this (using JSX and ES6):

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

Now, let's install Babel:

```
npm install --save-dev babel-core babel-loader
```

**babel-core** is the core Babel compiler. **babel-loader** is a 'loader' Webpack will use in order to 'load' files for processing by Babel. 'Loaders' are a Webpack concept that we'll see more of in other sections of our tutorial, but they essentially tell Webpack to use a certain library (or libraries) to process files during the build. They are almost like 'tasks' in other build tools, only we don't have to write them ourselves! In our case, we will configure Webpack to use babel-loader to transpile JavaScript using Babel.

By default, Babel is pretty stupid. It doesn’t know anything about ES6 or JSX or how to transpile them to ES5. It requires us to download plugins that it uses to understand ES6 syntax and JSX. There are different types of plugins. The one we'll encounter most is a 'transform' plugin that Babel uses to transpile the syntax of a certain language feature. To make life easier on us, Babel has collections of plugins called 'presets'. There are many different presets, some of which contain transforms for as-of-yet unstandardized features, such as the Object spread operator and static class variables. The preset we will use contains only the 'latest' standards without any experimental feature transforms. However, some of these experimental features are pretty useful. We'll still be able to use them, but we'll need to download the plugins we want ourselves.

Side note: As defined by the Ecma International committee, there are 5 stages of standardization for EcmaScript (0 to 4). Until a feature gets to stage 4, it's not yet part of the future ES standard.

Let's install the presets and plugins we need now:

```
npm install --save-dev babel-preset-react babel-preset-latest
npm install --save-dev babel-plugin-transform-class-properties babel-plugin-transform-object-rest-spread
```

[**babel-preset-react**](https://babeljs.io/docs/plugins/preset-react/) contains plugins that allow Babel to understand and transform JSX into regular old `React.createElement` calls. Remember that JSX isn't understood by browsers natively, so we have to transform it to JavaScript before it can be run! [**babel-preset-latest**](https://babeljs.io/docs/plugins/preset-latest/) contains knowledge of the very latest ES standards, ES2015 (also known as ES6), ES2016 (ES7), and ES2017. This preset does not include any experimental feature transforms. We'll simply add the ones we care about explicitly.

**babel-plugin-transform-class-properties** is a Babel plugin that contains knowledge of static class properties, which is not yet standardized in ES6. It also allows us to use arrow functions as class functions, which is also still experimental. **babel-plugin-transform-object-rest-spread** informs Babel of the existence of the 'Object spread' operator, which is conceptually similar to the ES6 'array spread' operator, but for objects. However, the Object spread operator is still in stage 2, so using it without the transform plugin installed will result in a error when we build.

Next, we need to create a configuration for Babel to use these presets during our build. In the root of the app, create a file called *.babelrc* with the following contents:

```
{
    "presets": ["latest", "react"],
    "plugins": ["transform-class-properties", "transform-object-rest-spread"]
}
```

This is the default configuration file Babel looks at during the build. Here we've told Babel to use the `presets` we've installed. We also let Babel know about the `plugin`s we've just installed for enabling static class properties and the object spread operator. We won't need any other presets, but if you find an experimental feature you like, you can install it and add it to the plugins array here. Just be careful with stage-0 and stage-1 presets since they are subject to large changes.

Finally, remember that Babel only transpiles our ES6 **syntax** down to ES5. It doesn't do anything with our JavaScript built-in objects like `Promise`s or static methods like `Object.assign`. This becomes a problem when our code has been transpiled *and* we're using these new ES6 standard library functions. We need a way to standardize the browser environment in which Babel runs in.

Many different browsers exist, each with many different versions supporting a varying subset of ES6's new functions and built-in types. **babel-polyfill** helps close the feature gap between all of these browsers. It gives Babel runtime support by providing polyfills for the ES6 features that aren't transpiled. Let's install it now:

```
npm install babel-polyfill --save
```

Next, at the top of *src/index.js*, we simply `include 'babel-polyfill';`. This will be enough to supply the browser with the polyfills necessary to emulate a full ES6 environment. Note that this is a catch-all solution that adds quite a bit of size to our application. In an actual production app, to save as much framework weight as possible, we should include only the ES6/ES7/ES+ features we are using. This takes a bit more work on our side, but the savings in file size is definitely worth it. Note that babel-polyfill is just a wrapper around the [**core-js**](https://github.com/zloirock/core-js) library. By picking only the polyfills we need from core-js, we can significantly reduce our application size. Keep this in mind when creating a production application! For now, we'll stick with babel-polyfill.

Now that Babel is set up, we need to configure Webpack to actually use Babel to process our JavaScript files. In *webpack.config.js*, create a new `module` section in the config that looks like this:

```
{
    ...,
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

The `module` section contains a list of ‘rules’ (originally titled `loaders` in Webpack 1). `rules` simply contains a list of the loader configurations you need for your project build. Here we're telling Webpack to look at all of the *.js* files in our *src* directory and use babel-loader when it encounters these files. That's how Babel knows to transpile our JavaScript!

Let's take a quick look at the overall process that Webpack uses to build our code. Webpack loads the `webpack.config.js` (or whatever config we provide it explicitly) and:

1. reads the `entry` points for our application, then
2. finds all files referenced by our entry points and their children, then
3. grabs all our source files and uses our `module.rules` sections to look up which loaders need to be run for which files, then
4. pipes the generated content into files according to the structure we defined in `output`

Run the project using `NODE_ENV=development node ./devServer.js`. Visit 'localhost:8001' and see that our app is running correctly! If you open up the JavaScript file that Webpack generated, you will see that it no longer contains any ES6 syntax! It's been successfully transpiled by Babel! Also notice that we didn't see any errors about parsing JSX because Babel now knows about JSX and transformed it  to regular old JavaScript.

Now, we have a framework in which we can write React in ES6!

## Milestone 6 (Bonus): Writing our configuration in ES6
Notice all of our configuration is currently in ES5. If we want a full ES6 codebase including configs and devServer code, we can simply install **babel-register** as a devDependency in our project. babel-register essentially replaces how Node loads files. It binds into the usage of 'require' and transpiles files with Babel on-the-fly. babel-register also plays nicely with our Webpack build! Note that babel-register is not meant for use in production. It's fine for loading configurations and writing our dev server code in ES6, but for a full-fledged server, we should transpile the server code explicitly with Babel and then deploy it.

```
npm install --save-dev babel-register
```

babel-register will transpile our configuration files from ES6 to ES5 so we can just use ES6 in our code base. Now, our build command becomes:

```
NODE_ENV=development node -r babel-register ./devServer.js
```

'-r' is just a command line arg that tells Node to use the 'babel-register' package during the build. Now, if we change our build files to use ES6 syntax, everything will work as expected. Here is the ES6 version of *webpack.config.js*:

```
import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: {
        app: [
            'webpack-hot-middleware/client',
            path.join(__dirname, './src/index.js')
        ]
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, './dev'),
        publicPath: '/'
    },
    plugins: [
        new webpack.EnvironmentPlugin([
            'NODE_ENV'
        ]),
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
const compiler = webpack(webpackConfig); // run Webpack

const serverConfig = {
    publicPath: webpackConfig.output.publicPath //where to serve our assets from
};

app.use(
    historyApiFallback() //route server requests through index.html
);

//Use previously defined middleware
app.use(devMiddleware(compiler, serverConfig));
app.use(hotMiddleware(compiler));

app.listen(8001, 'localhost');
```

Finally, instead of typing `NODE_ENV=development node -r babel-register ./devServer.js` every time we want to build and run our project, let's create a shortcut for it in *package.json*:

```
    ...,
    scripts: {
        "test": "echo \"Error: no test specified\" && exit 1",
        "start": "NODE_ENV=development node -r babel-register ./devServer.js"
    }
```

And now we can run `npm run start` (or, because 'start' is a special script name in NPM, `npm start`) instead!

##Milestone 7 (Super Bonus!): Automatically open browser after running build
If you're lazy like me, you'll want your build to automatically open a browser window for you. It's pretty simple to do so. We'll need to install the Node package **open**:

```npm install --save-dev open```

Next, `import open from 'open'` in *devServer.js*. Finally, at the bottom of our *devServer.js* file, we modify `app.listen` to accept a callback that 'open's the browser window to our specified port and host name:

```
...
app.listen(8001, 'localhost', () => {
    open('http://localhost:8001', 'google chrome');
});
```

If you choose to, extract the port and hostname into their own variables so we don't have to duplicate them in this string. Run `npm run start` and watch the magic happen! If you don't have Chrome, you can substitute 'firefox' or 'safari' in the second parameter of the `open` function. We won't use this in future tutorials, but know that you can add it whenever you want!
