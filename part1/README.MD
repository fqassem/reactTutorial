# Part 1: Creating the Application framework
In this part, we will be creating the basic framework that we will use to build our application. There are
hundreds of 'bootstrap' React projects that you can download and start using immediately to create an application. The purpose
of this tutorial is to understand how to build and configure one yourself.

We will be using NPM for this project to manage our project dependencies. If you haven't already set up NPM, go [here](http://blog.npmjs.org/post/85484771375/how-to-install-npm) for installation instructions.

Now, create a directory for your project to live in, and let's get started.
## Milestone 1: Creating index.html
In the root of your application, create a file called 'index.html'. Within this file, copy and paste the following code:

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
* We are including a meta tag for the viewport, which will tell the browser window to be responsive when we add our CSS
* The div with id 'root' will be were React attaches itself to the DOM

Now that we've created our index.html file, we shouldn't have to revist it again. All of the script files and CSS will be added to our application programmatically. That means we don't have to hardcode any static assets in the HTML!

## Milestone 2: Dependency Management
If you open this index.html file in your browser, you have an extremely barebones web application. This won't get us too far in the world of modern web development. We're gonna need a little more to get us creating a cool web application. While writing plain CSS and regular old Javascript is definitely an option, it's much slower and error-prone than using the modern libraries and build tools available today.

NPM is our package manager. We could theoretically download these fancy-pants libraries we're going to use ourselves, and manage them manually, but that's error-prone and tedious. Let's use NPM to do it for us. NPM (Node Package Manager) has become a widely used JavaScript package management solution.

To initialize NPM in our project, run the following command:
```
npm init -y
```

This will create a 'package.json' file with default values ('-y'). This file holds all of the dependencies, scripts, and meta-data that describe our application.

Let's open this file and take a look at it. Most of the content should be self-explanatory, but there are three sections of note:

* 'scripts' is where we will create shortcut commands to run, build, and test the project. There's already a default, pre-generated "test" command in there now! It doesn't do much, but it's a useful example.
* ‘dependencies’ and ‘devDependencies’ are where the list of modules we install for our project will live. They both list the project dependencies, but ‘devDependencies’ will not be packaged into the final production build. ‘devDependencies’, as the name implies, should only contain a list of the dependencies our project needs for development, such as transpilers, loaders, and test frameworks.

When we download a project with a package.json file, all we need to do is run `npm install` and NPM will look at this file and download all of the dependencies we need. NPM downloads these dependencies to a 'node_modules' folder.

If we run `npm install` now, nothing useful will happen because we haven't specified any dependencies! Only an empty 'node_modules' folder will be created. To install a dependency using NPM, we run `npm install <dependency-name> --<flags>`. We will include either a '--save' flag to save the dependency we want to install as a 'dependency' or a '--save-dev' flag to save it as a 'devDependency'. The difference between devDependencies and normal dependencies will be important when we build our project! Now that we have NPM set up, let's install some dependencies and create our project framework!

## Milestone 3: Setting up Webpack 2
Webpack is what we will be using to build our project. Webpack is a module bundler that process our files, manages dependencies, and spits out static assets. Basically, it will transform our code into a few modules that a browser can grab from a server and run. Let's install it:

```
npm install --save-dev webpack@2.1.0-beta.28
```

This will install Webpack 2 and add it to our package.json file as a 'devDependency'. Note that we include a '--save-dev' flag because we want to install Webpack 2 and have it tracked in our package.json file. If we omitted this flag, Webpack 2 would be installed, but package.json would not be updated. Always be sure to include '--save' or '--save-dev'!

Note that Webpack 2 is still in beta, but the features it includes are worth the quirks. Webpack 2 differs from Webpack 1 in a few ways, but the biggest benefit is easier code-splitting (for incremental loading via React-Router v3) and smaller generated files (due to Webpack 2’s new ‘Tree Shaking’ algorithm for resolving dependencies and eliminating dead, unreachable code in our included libraries). See [this link](https://blog.engineyard.com/2016/tree-shaking) for more info about tree-shaking.

Webpack allows us to use plugins to make the build process easier and customize it to our needs. If you think back to the HTML file we created, it doesn’t contain any script tags! This means that our app won't know about any JavaScript files it needs to run. There are two ways to solve this. One would be tell Webpack to output all of the contents of our build into a file named ‘bundle.js’ and simply include that in a script file in the bottom of our HTML file.

A better way to do this is via the HtmlWebpackPlugin. This plugin automatically appends our script file tags to our index.html file so we don’t have to do it manually. What is the benefit of doing it this way? Caching! We will set up our Webpack build to append a hash to the file name of the generated JavaScript. This way, the browser knows that if the hash changed, it should download the new file. This will save a good amount of bandwidth when we split our code into modules and prevent us from having to hard code any dependencies in the index.html!

Let's install the HtmlWebpackPlugin as a devDependency:

```
npm install --save-dev html-webpack-plugin
```

Now that we have installed Webpack and the HtmlWebpackPlugin, we need to configure Webpack to generate a build for us. Let's create this config now. Create a file in the root of your app called 'webpack.config.js' and copy and paste the following:

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

'entry' is where we define the 'bundles' we want our project’s build to create after webpack does transpilation, dependency resolution, and tree-shaking. Right now we only have one bundle named 'app' that will include all of the processed files from our 'src' directory.

'output' is how the 'bundles' will be named and where the will go. Here we are telling webpack to put these bundles into a 'build' directory. These files will be named with the provided bundle name (taken from the 'entry'' config) and a hash. In our case, the output bundle will be named: 'app.<some_hash>.js'.

'plugins'' defines Webpack plugins that affect the build process. Common plugins defined here include minification plugins, dedupe plugins, and HTML generation plugins, among others. We are using the HtmlWebpackPlugin. This plugin modifies the HTML we wrote to include the Javascript files we generated from the Webpack build dynamically! The configuration basically says ‘inject’ the generated asset files after the ‘body’ tag of the supplied ‘index.html’ template file. Now, we have a fully functioning Webpack 2 configuration.

So, let's build our project. From the root of our app, run:

```
./node_modules/.bin/webpack
```

Error! Webpack should complain that it can't find the 'src/' folder. That's because we haven't created it yet! Let's create the 'src' folder to house all of our project source code. Next, in this src folder, create an 'index.js' file with the following contents:

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
