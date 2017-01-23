# Part 3: Production Build and Testing
So far, we've defined a project build that should only be used in development. Let's also create a usable production build that minifies our code and excludes any unnecessary libraries, such as Hot-Reloading.

Next, we'll add a testing framework to our application so we can be sure our code is solid when it gets deployed to production!

## Milestone 1: Production build
So far, we've had only one config file for our build - the development build. Let's modify our config to support production as well! Let's also split out our framework code from our application code during the build. We do this in order to cache the framework code on the client's browser so we don't have to pull it in every time they visit our app! This will lead to a significantly smaller download for our users on subsequent loads of our website. We had set up a very rudimentary version of caching in part 1. Throught this part of the tutorial, we'll make caching more fine-grained and even more useful.

Let's organize our configs inside a 'config' folder. In the root of our app, create a *config* folder and create three files:
* *webpack.base.config.js*
* *webpack.development.config.js*
* *webpack.production.config.js*

In *webpack.base.config.js*, we will house all of our base configuration shared between development and production. To help us merge these configurations easier, let's install **webpack-merge**:

```
npm install --save-dev webpack-merge
```

In *webpack.base.config.js*, let's copy over what we had from our old *webpack.config.js* and modify it a bit to look like this:

### webpack.base.config.js
```
import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
    entry: {
        vendor: ['react', 'react-dom', 'react-router', 'babel-polyfill']
    },
    output: {
        publicPath: '/'
    },
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(js)$/,
                include: /src/,
                loader: 'eslint-loader'
            },
            {
                test: /\.(js)$/,
                include: /src/,
                loaders: 'babel-loader'
            }
        ]
    },
    plugins: [
        new webpack.EnvironmentPlugin([
            'NODE_ENV'
        ]),
        new webpack.NoErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '../index.ejs'),
            filename: 'index.html',
            inject: true
        })
    ]
};
```

Note that we now have an `entry` called 'vendor'. This is where we will house all of our framework code needed to run the app on the browser. It currently contains the React, ReactDOM, React-Router, and Babel-Polyfill libraries. If we add any more libraries needed to run our application on the browser, we should add them here. Because we've created a 'vendor' `entry`, the build will output a file called *vendor.[generated_hash].js*, containing all of our framework code. 

We removed 'app' from our `entry` points so that development and production configurations define their own. This is because we need to add a few extra entry points in development so that HMR works correctly, while production won't need those entries. However, since both development and production will share the same framework code, we abstract that 'vendor' config here in *webpack.base.config.js*.

`output` contains only the publicPath for the server, which, in our case, should stay the same for both dev and prod.

The `module` section remains the same as the one in our old *webpack.config.js*. We need the same loaders in both dev and prod builds.

Our `plugins` array, however, looks a bit different. We've removed the HotModuleReplacementPlugin because we only need it in development. However, the rest of the plugins should be the same as our old config, save for one. We include the **NamedModulesPlugin** to get around how Webpack names modules behind the scenes. Webpack defaults to giving modules ascending integer ids. If a module is changed, it's possible that all the other ids change too which would cause the hash of the bundle to change unnecessarily. NamedModulesPlugin makes it so Webpack chooses ids in a more predictable, deterministic way.

Notice that we've changed the `template` path to look for `index.ejs` rather than `index.html`. This will be important in the production configuration for getting caching to work correctly! Finally, since we're now in the *src/config* directory, any relative file paths that need to look in the *src* folder will use *../* rather than *./*.

### webpack.development.config.js
```
import webpack from 'webpack';
import path from 'path';
import webpackMerge from 'webpack-merge';

import baseConfig from './webpack.base.config';

export default webpackMerge(baseConfig, {
    devtool: 'eval-source-map',
    entry: {
        app: [
             // activate HMR for React
            'react-hot-loader/patch',
            //connect to the server to receive notifications when the bundle rebuilds
            'webpack-hot-middleware/client',
            //main app entry
            path.join(__dirname, '../src/index.js')
        ]
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(__dirname, '../dev')
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
});
```

Our development config is now very simple. It includes a 'devtool' entry, which outputs a source map that allows us to see the original code (and line numbers!) in our browser. This makes debugging much easier. There are many different options for source maps. Check this [link](https://webpack.js.org/configuration/devtool/#devtool) for further discussion.

Our config includes the same `entry` config as our original *webpack.config.js* file, which contains the entry points needed for HMR. `output` is the same as the our original webpack config too, but note that we've change the relative path of the *dev* folder so that this folder ends up in the root of the app, not in the config folder.

In our plugins array, we've included HotModuleReplacementPlugin so that HMR is enabled in Webpack. We've also added the **LoaderOptionsPlugin**, allowing us to pass in parameters to the loaders. Our config is simply telling the loaders that we are in 'debug' mode (development), so turn on any special debug features as needed.

Note the use of 'webpackMerge' in the export. This will simply merge our baseConfig with the development config we've defined here. Webpack-Merge is smart enough to merge arrays, combine key/value pairs, and generally keeps our configuration clean.

### webpack.production.config.js
```
import webpack from 'webpack';
import path from 'path';
import webpackMerge from 'webpack-merge';
import InlineManifestWebpackPlugin from 'inline-manifest-webpack-plugin';

import baseConfig from './webpack.base.config';

export default webpackMerge(baseConfig, {
    entry: {
        app: [
            path.join(__dirname, '../src/index.js')
        ]
    },
    output: {
        filename: '[name].[chunkHash:8].js',
        chunkFilename: '[name].[chunkHash:8].chunk.js',
        path: path.join(__dirname, '../dist')
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true
            },
            output: {
                comments: false
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vendor', 'manifest'],
            minChunks: Infinity
        }),
        new InlineManifestWebpackPlugin({
            name: 'webpackManifest'
        })
    ]
});
```
Our production config contains an `entry` similar to our development config, but without the HMR dependencies.

Our `output` section has changed a bit. `path` will create a folder to output the generated files because we don't use Webpack-Dev-Middleware in production. That means the files aren't stored in memory and they'll need to be written to disk. We modified `filename` to use `[chunkHash:8]` rather than `[hash]`. We've also added a section called `chunkFilename` that looks like `[name].[chunkHash:8].chunk.js`. Originally, we were using `[hash]`, which is the hash Webpack generates for the whole compilation. That meant if we make even a tiny change in the framework or application code, the compilation hash will be different.

Now that we've separated out the framework code, the hash of the compilation (`[hash]`) is no longer useful to us. If we change a single line of application code and build, all the output modules will get a new hash, even though the framework code was not touched! That's not what we want.

The solution is to use 'chunkHash'. This is the hash for the 'chunk' (bundle, module, etc) of code that is generated by Webpack defined by our `entry` config. `chunkHash` scopes the hash to only the file we care about. So, if we make changes to our app code, only the `chunkHash` of the app code will change. Even cooler, since Webpack generates 'chunks' (code bundles) for each of our dynamic routes, if we only change the code for one of the dynamic routes, only the changed chunk will have a new hash the next time we build. This completely isolates sections of the code and the browser will only update what it needs! Note that the ':8' at the end of `chunkHash` basically truncates the hash so the file name is shorter for the sake of readability.

Our config includes a few familiar `plugins`:
* LoaderOptionsPlugin to tell the loaders that we are **not** in `debug` mode, and that they should minimize their output by default.
* UglifyJSPlugin is used for minifying our JavaScript and getting rid of any unnecessary comments/code that don't belong in production. See [here](https://davidwalsh.name/compress-uglify) for more info about the included parameters.

The last two plugins, CommonsChunkPlugin and InlineManifestWebpackPlugin, allow us to fix a few caching gotchas with Webpack. You mean it's *still* not setup correctly yet?!? No, but we're almost there!

Webpack generates a 'manifest' during the build. The 'manifest' is a file that contains the Webpack runtime, dependency information, and a mapping of modules to module ids necessary to load our application correctly. By default, Webpack packs up the manifest into our 'vendor' `entry`. Because the manifest changes with every build, the `chunkHash` will change as well, unnecessarily invalidating our hash and making our caching useless. We need to extract the manifest somehow! CommonsChunkPlugin to the rescue!

**CommonsChunkPlugin** is used for preventing duplication across the modules that Webpack splits out for us. The 'vendor' chunk, by default, will include the Webpack manifest. To move 'manifest' out of 'vendor', we tell CommonsChunkPlugin to extract it by explicitly identifying it in the `name` array. CommonsChunkPlugin can even extract modules in your code that are used a certain number of times  (defined by *minChunks*). For our usecase, setting *minChunks* to Infinity basically tells CommonsChunkPlugin to separate out only the modules we've explicitly defined in the `name` array - the `vendor` code and the `manifest`.

Note that the browser has to make a GET request to grab each of our modules from the server. After our build runs, we'll have an application bundle, a vendor bundle, and a manifest bundle. Since the *manifest* is so small, we can inline it instead of making a GET request for it so we can save some bytes. This is what the *InlineManifestWebpackPlugin* does for us. It will take the *manifest.js* file generated by Webpack (via CommonsChunkPlugin) and inline it into the *index.ejs* we'll create in a second.

Rename *index.html* to *index.ejs*. *EJS* files are JavaScript files that can include templates, which is how the HtmlWebpackPlugin works behind the scenes to dynamically add *script* tags. We need to add the following line below our root div in the *index.ejs* file:

```
    <body>
        <div> id="root"></div>
        <%= htmlWebpackPlugin.files.webpackManifest %>
    </body>
```

This is where **InlineManifestWebpackPlugin** will inline our manifest! We haven't yet installed InlineManifestWebpackPlugin, so let's do it now:

```
npm install --save-dev inline-manifest-webpack-plugin
```

That was a lot of setup! Let's run a production build and see the results of our hard work. In the root of our app, run:

```
    NODE_ENV=production node -r babel-register ./node_modules/.bin/webpack --config ./config/webpack.production.config.js
```

To save time in the future, create a shortcut script for this in *package.json*:

```
    scripts: {
        ...,
        "build:prod": "NODE_ENV=production node -r babel-register ./node_modules/.bin/webpack --config ./config/webpack.production.config.js"
    },
```

Now you can just run `npm run build:prod` instead!

Look inside the *dist* folder and see what we have so far:

* *0.[hash].chunk.js*, containing our *Home.js* code (separated out because it's a dynamic route using 'System.import')
* *1.[hash].chunk.js*, containing our *SignIn.js* code (another dynamic route extracted into it's own chunk/bundle)
* *app.[hash].js*, containing the rest of the app code we wrote ourselves
* *index.html*, containing the inlined Webpack manifest and script tags
* *manifest.[hash].js*, our manifest that gets inlined into *index.html*
* *vendor.[hash].js*, our framework code

Let's test that our caching works as expected. Make a small change to the text in the `render` function in *SignIn.js* and run the build again. Open the *dist* folder and notice none of the JavaScript files were changed. Only two new files were created - a new *manifest.[hash].js* and another *1.[hash].chunk.js* file (with a new hash) containing the updated code with the changes we made for *SignIn.js*. After we ran the build, *index.html* was updated with the new manifest, and only the bundle that contains the change we made was rebuilt and given a new hash. All the other files were isolated because we are using *chunkHash* rather than *hash*! Our caching is now working as we expect it to!

Let's do some clean-up now that we know everything is working correctly. Let's delete our old *src/webpack.config.js* file. Next, we'll modify our build script a little:

```
    scripts: {
        ...,
        "build:prod": "rm -rf ./dist; NODE_ENV=production node -r babel-register ./node_modules/.bin/webpack --config ./config/webpack.production.config.js"
    },
```
This blows out the old *dist* directory before the build runs so it contains only the result of the most recent build. Now, we have a production build that caches correctly! We'll also need to modify *devServer.js* to use our new development config. Change

```
import webpackConfig from './webpack.config';
```
to

```
import webpackConfig from './config/webpack.development.config';
```

Now, when you run `npm run start`, your server should pull in the right config.

### Bonus: Gzipping Source Code
To make our code extra tiny, we can use GZIP. We have two options: do it during the build via the [Compression plugin](https://github.com/webpack-contrib/compression-webpack-plugin) or have the [server](https://expressjs.com/en/advanced/best-practice-performance.html#use-gzip-compression) do it. We won't do it in this tutorial, but it should be done in a production application to keep your code as small as possible.

## Milestone 2: Testing
Now that we've set up both development and production environments, let's create our testing framework. We'll focus on *unit* testing, but the framework we create can easily be used for end-to-end tests that can be run in real browsers! In the future, that maybe something worth adding to our application!

We'll use **Karma** to run our tests in different browser environments. **Mocha** will be our testing framework. We'll use it to set-up, tear-down, and give structure to our tests. **Chai** is an assertion library that gives us different ways to define expectations for our tests. **Sinon** is a mocking library, helpful for defining mocks, stubs, and spies we can use for testing components with dependencies. **Enzyme** is a cool library developed by AirBnb for testing React components.  **React-Addons-Test-Utils** is a testing library developed by Facebook that Enzyme is based on. It's a dependency that Enzyme needs to function correctly, so we'll need to install it too. Enzyme also depends on **React-DOM**, which we've already installed in a previous part of this tutorial.

### Side-note: Why so many libraries!?!
You might be wondering: why so many libraries? Why not just use **Jest** (Facebook's recommended framework) and be done with it!? Sadly, it's not all that simple. Let's talk through our choices (and our non-choices), one-by-one.

Why aren't we using Jest? After all, it's a fully-fledged framework based on Jasmine and developed by Facebook. In a few words: preference and familiarity.

While Jest includes some useful tools like 'snapshot' and 'auto-mocking', most developers agree that the documentation isn't great. It's still a work-in-progress and Facebook is making huge strides in improving performance and usability of the framework. However, I believe Jest is a bit too heavy and it's obviously still in flux. It recently received a huge update last September with a whole suite of improvements and features. Until Jest stabilizes a bit more, I believe the safer choice is to use the test framework we create here. I also prefer the control and syntax of the libraries our testing framework is based on, but Jest isn't *that* different from the testing framework we're creating. That said, I believe Jest will definitely be worth considering in the future. As of now, it's mostly a matter of *preference*.

Using Karma as our test environment is extremely useful because it helps simulate the environment our code will be running in: the browser. It can help us detect browser-specific quirks or strange functionality differences during development! If we don't use Karma, we can definitely still run our tests, but we miss out on the features it provides! It's definitely worth the few lines of setup and the extra milliseconds for startup. You might ask: is it even worth writing unit test suits against a real browser? It surely doesn't hurt! And in the future (if we desire to create some), our end-to-end tests will already have a browser environment set up with Karma!

Mocha, Chai, and Sinon are standard JavaScript testing libraries. It's definitely possible to use them (or even replace them) with a more complete solution like **Jasmine** or **Jest** and cut down on the libraries you're using. Again, doing so is simply a matter of preference. There are many more testing libraries available, but these three are very popular, widely used, and easy to piece together.

Finally, Enzyme is extremely helpful for isolating and testing React components. It's become a standard for testing React components. It provides an intuitive API and multiple ways to test React components. You can very easily isolate components using 'shallow rendering' (for unit tests) or mount the whole component tree to the DOM and make assertions on its behavior (more like integration testing).

All of these libraries can live in harmony with each other. If you desired, you could use Jest and Enzyme together, or use Jasmine with Sinon. It's all up to preference!

### Side-side-note: What should we test?
While it's certainly possible to test too little, you can also to test too much. Generally, what we want to test in our application will be *functionality*. In our case, this means:

* Components - prop verification, were callbacks actual called?, did it render without errors?
* State management, e.g. Redux reducers, async action creators
* Services
* Utilities
* Edge cases
* End-to-end for critical paths (in the future)

While writing a test to ensure that a style was added to an element when a certain button was clicked, it's not a high priority test.  Ensuring that we write useful tests for the most critical parts of code will make our application much more robust. Keep this in mind when we start writing code! Remember, don't write code you can't test.

### Unit testing: Back to our regularly scheduled program
Let's start by downloading and installing our core testing libraries:

```
npm install --save-dev karma mocha chai sinon enzyme react-addons-test-utils
```

We'll also need some adapter plugins for Karma to be able to use, understand, and play nice with these testing libraries. We install the respective adapter (prefaced with 'karma-') for each of our main testing libraries. We also need **karma-webpack** to have Webpack build our source files before they're run by Karma. **karma-chrome-laucher** is necessary for Karma to use Chrome as our browser testing environment. There are also launchers for other browsers, like IE and Safari. We'll stick with Chrome for simplicity, but you can add any number of browsers on which you can run your tests. Finally, **karma-sourcemap-loader** is super useful for quick debugging because it loads our source maps into the browser Karma launches for testing. This makes it much easier to look up line numbers for errors that appear in the browser. Enzyme uses a library dependency called 'Cheerio' for parsing and rendering HTML. Cheerio's main file is not a '.js file, but a '.json' file. We'll need the **json-loader** for Webpack to load this dependency so Enzyme use Cheerio.

```
npm install --save-dev karma-mocha karma-chai karma-sinon karma-webpack karma-chrome-launcher karma-sourcemap-loader json-loader
```

Now, let's begin our test framework setup. Let's start by setting up Karma. If you run `./node_modules/.bin/karma init`, you'll start a wizard that helps you set up Karma. Instead, let's bypass the wizard and simply create a *karma.config.js* file in the root of our application. It should look like this:

```
module.exports = (config) => {
    config.set({
        //Our framework list
        frameworks: ['mocha', 'chai', 'sinon'],
        //Our test files glob
        files: [
            'test/**/*.js'
        ],
        //Use webpack and sourcemap to preprocess our files
        preprocessors: {
            'test/**/*.js': ['webpack', 'sourcemap']
        },
        //Our testing webpack configuration
        webpack: {
            devtool: 'inline-source-map',
            //https://github.com/airbnb/enzyme/issues/47
            //https://github.com/producthunt/chai-enzyme/issues/46#issuecomment-200218983
            module: {
                noParse: [
                    /node_modules\/sinon\//
                ],
                rules: [
                    { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
                    { test: /\.json$/, loader: 'json-loader', include: '/node_modules/cheerio/' }
                ]
            },
            resolve: {
                alias: {
                    sinon: 'sinon/pkg/sinon'
                },
                extensions: ['.js', '.jsx', '.json']
            },
            //necessary for Enzyme to work properly
            //https://github.com/airbnb/enzyme/blob/master/docs/guides/karma.md#enzyme--karma--webpack
            externals: {
                'react/addons': true,
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': 'window'
            }
        },
        //Run our tests just once, if set to false then karma will watch our test files and re-run tests on changes
        singleRun: true,
        //Use Chrome for our browser test environment
        browsers: ['Chrome']
    });
};
```

The comments should thoroughly explain the config entries. Notice, in the 'webpack' entry, we are defining a very barebones Webpack configuration we use to pre-process our files. The rest of the file is pretty standard Karma configuration. It's a bit of a pain to get everything correctly working together, as evidenced by the length of the Webpack configuration.

Notice that all of the frameworks we defined in the `"frameworks"` section are actually the "karma-*" packages that we installed early in the tutorial. By using these plugins, all of the Sinon, Chai, and Mocha functions are now available globally within our tests. That prevents us from having to include them in every single test file.

Let's create a simple test file to make sure our framework is running correctly. Create a 'test' folder in the root of our application, and then create a *sample.spec.js* file with the following contents:

```
import React from 'react';
import { shallow, mount, render } from 'enzyme';

import Home from '../src/pages/Home';

describe('<Home />', () => {
    it('contains an H1 element', () => {
        const wrapper = shallow(<Home />);
        expect(wrapper.contains(<h1>Home</h1>)).to.equal(true);
    });

    it('mounts with no errors and has no props', () => {
        sinon.spy(Home.prototype, 'render');
        const wrapper = mount(<Home />);
        expect(Home.prototype.render).to.have.property('callCount', 1);
        wrapper.props().should.be.empty;
    });

    it('renders the word Home on the browser', () => {
        const wrapper = render(<Home />);
        expect(wrapper.text()).to.contain('Home');
    });
});
```

This tests uses all three of Enzyme's rendering [APIs](http://airbnb.io/enzyme/docs/api/index.html) to assert various things about the *Home.js* component.

All of our testing framework functionality is actually available currently. Sadly, you'll noice that ESLint doesn't know about these functions yet. It thinks they're all undefined globals and assaults our eyeballs with a bunch of red squiggles.

While we could modify our *.eslintrc* to include the testing framework library functions, that would affect the rest of the application. Lucky for us, ESLint supports 'cascading configurations'. This means that if we simply create another *.eslintrc* that lives in our test folder, we'll 'inherit' the main *.eslintrc* in the root of our application. Then we can define whatever rules we want that will only affect the contents of the *test* folder! Let's do that now. In the *test* folder, create an *.eslintrc*:

```
{
    "env": {
        "mocha": true
    },
    "globals": {
        "sinon": true,
        "chai": true,
        "expect": true,
        "should": true,
        "assert": true
    },
    "rules": {
        no-unused-expressions: [0]
    }
}
```

Remember, the way that ESLint deals with globals is through `"env"` configuration. It has quite a few built-in. Take a look [here](http://eslint.org/docs/user-guide/configuring#specifying-environments) for the complete list.

We define a "mocha" environment which tells ESLint that we're using "mocha" as part of our testing framework. This makes ESLint aware of any globals that Mocha needs to structure our tests, such as 'describe', 'beforeEach', and 'it'. Sadly, ESLint doesn't have environments for Chai or Sinon, so we'll have to simulate that functionality using the `"globals"` block. Another way to do this would be to import the functions we use in our tests in every single file, but that's tedious and unnecessary. We've defined "sinon", "chai" as global variables. When we use Chai as our assertion library, its "expect", "should", and "assert" functions are automatically put into global scope, so we define them here in `"globals"` so ESLint knows about them.

Finally, we turn of the [no-unused-expressions](http://eslint.org/docs/rules/no-unused-expressions) rule because some of our testing assertions are simple expressions with no usable return value. For example, if you wanted to assert an object was empty using Chai, you could do it one of two ways, both of which ESLint would complain about:

```
myObject.should.be.empty; //using 'should'
expect(myObject).to.be.empty; //using 'expect'
```

Therefore, we turn off this rule in our test folder.

Next, let's run our tests and see if anything breaks!

```./node_modules/.bin/karma start```

And our test should pass! Our testing framework is now set up correctly. Let's quickly add modify the 'test' script our *package.json*:
```
  "scripts": {
    "test": "./node_modules/.bin/karma start",
    ...
  },

```

And now we can run `npm test` to run our tests!

## Useful Links:
http://www.thereformedprogrammer.net/unit-testing-react-components-that-use-redux/
http://redux.js.org/docs/recipes/WritingTests.html
http://pebblecode.com/blog/testing-redux-containers/
http://blog.ricardofilipe.com/post/react-enzyme-tdd-tutorial
http://thereignn.ghost.io/a-step-by-step-tdd-approach-on-testing-react-components-using-enzyme/
https://www.spencerdixon.com/blog/test-driven-react-tutorial.html
