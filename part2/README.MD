# Part 2: ESLint, Routing, and Hot-Loading
Now that we have a good basic framework for writing applications, let's add on to it. In this part, we will be adding:

* ESLint, for enforcing code-style and catching bugs
* Routing using React-Router
* Hot-Loading for faster development

Let's begin!

## Milestone 1: ESLint
ESLint is a very useful development tool. It helps us keep code consistent and avoid writing bugs that we might otherwise miss. ESLint is configurable, allowing you to turn off, on, or modify certain rules to enforce a consistent style across your team. Let's install it now as a dev dependency:

```
npm install --save-dev eslint
npm install --save-dev eslint-loader
```

Note that we've also installed **eslint-loader** in order for Webpack to know that we want ESLint to process certain files during the build.

Now that we have the loader for ESLint and the core installed, let’s tell Webpack to run our files through ESLint during the build. Open the *webpack.config.js* file and add the following rule:

```
  module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.(js)$/,
                include: /src/,
                loader: 'eslint-loader'
            },
            ...
        ]
    },
```

This tells Webpack to run our '.js' files in the *src* folder through ESLint before the other loaders are run (using `enforce: 'pre'`). Note that this differs a bit from Webpack 1 syntax where ‘preloaders’ was a separate section entirely.

Now, let's run `npm run start`. Notice that our build complains about 'No ESLint configuration found.'. This is because ESLint looks for a configuration named *.eslintrc*, which we haven't defined yet. Let's create one now in the root of our app now:

```
{
    "env": { "browser": true },
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
            "impliedStrict": true
        }
    }
}
```

This tells ESLint that global ‘browser’ variables like `window` and `document` are expected and should not raise red flags. In `"parserOptions"`, we are telling ESLint that we will be using ES6 and ES6 modules (source files that use `import` and `export`). We also tell it that we will use JSX in our code so that it doesn't complain. Because we are using ES6 modules and ES6 modules are in strict mode by default, we set `"impliedStrict"` to true so that any "use strict" declarations in our code are caught.

By default, ESLint uses a parser called 'Espree'. While this parser is useful for most general cases, it won't support all of the advanced syntax or experimental features that Babel knows about and uses to transpile our code. To get ESLint and Babel to play nice, let's use the **Babel-ESLint** parser instead of the default provided by ESLint.

```
npm install --save-dev babel-eslint
```

Now, in your *.eslintrc* file, add the following line to tell ESLint we want to use Babel-ESLint as our parser:

```
    "parser": "babel-eslint"
```

Let’s set up ESLint to run automatically on our files within our environment, not just during our build. Pick the environment you're using and follow the instructions to install the ESLint plugin:

* [IntelliJ](https://plugins.jetbrains.com/plugin/7494)
* [Atom](https://atom.io/packages/eslint)

Now that we have ESLint running in our IDE, let's add some style rules. This section is optional, but it's useful if you want to use some industry standard ES6/React coding guidelines up-front. [Airbnb](https://airbnb.com) has published a very widely used ESLint configuration file (with React rules too!) for all to use. To install this configuration, run the following commands to install the configuration and its dependencies:

```
npm install --save-dev eslint-config-airbnb eslint-plugin-jsx-a11y@2.2.3 eslint-plugin-react eslint-plugin-import
```

Now, add `"extends": "airbnb"` to your *.eslintrc* config. This tells ESLint we want to use the Airbnb code style config we just installed.

You might end up with errors if you save your *.eslintrc* file and run `npm run start`. Depending on how you want your code styled, you can turn off, turn on, or modify certain rules in *.eslintrc*. For a good explanation of how this works, visit the ESLint documentation [website](http://eslint.org/docs/user-guide/configuring#configuring-rules). I've added and modified the following rules in my *.eslintrc* file to fit my code style:

```
    ...,
    "rules": {
        "indent": [1, 4, {"SwitchCase": 1}],
        "comma-dangle": [1, "never"],
        "keyword-spacing": [1, {
            "before": true, "after": false,
            "overrides": {"try": {"after": true}, "const": {"after": true}, "else": {"after": true}, "from": {"after": true}, "import": {"after": true}, "export": {"after": true}, "return": {"after": true}}
            }
        ],
        "no-unused-vars": [1],
        "prefer-const": [1],
        "max-len": [1, 140],
        "arrow-body-style": [0],
        "spaced-comment": [0],
        "global-require": [0],
        "import/no-extraneous-dependencies": [0],
        "react/forbid-prop-types": [0],
        "react/jsx-indent": [0],
        "react/prefer-stateless-function": [0],
        "react/jsx-filename-extension": [0],
        "react/jsx-space-before-closing": [0],
        "react/jsx-first-prop-new-line": [0],
        "react/jsx-closing-bracket-location": [0],
        "jsx-a11y/anchor-has-content": [0],
        "jsx-a11y/label-has-for": [0]
    }
```

While this doesn't matter too much for now, it will be useful to decide on a standard configuration for your team to use to enforce a certain code style. Note that your build will fail if your code style isn't following the config you've defined!

## Milestone 2: Routing with React-Router
One major feature missing from React by default is routing. We could build a router ourselves, but **React-Router** has become a go-to routing solution for React projects. We’ll be using v3. Note that there is currently a v4, but it’s still in alpha.

Let’s start by installing react-router v3:

```
npm install --save react-router
```

Be sure you’ve installed v3 by looking at your package.json file. Because React-Router is required by the code we run on the browser, we install it as a 'dependency'.

Let’s also create some files that represent pages within our application. This will help showcase routing, as well as incremental loading of our app. It will also be the start of our simple progressive web-app. Create a *pages* directory within *src*. This directory will hold the pages of our website that a user can navigate to. Add the following files:

### Container.js
```
import React from 'react';
import { Link } from 'react-router';

class Container extends React.Component {
    render() {
        return (
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/signIn">Sign In</Link></li>
                    </ul>
                </nav>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.object.isRequired
};
export default Container;
```

### Home.js
```
import React from 'react';

class Home extends React.Component {
    render() {
        return (
            <div>
                <h1>Home</h1>
            </div>
        );
    }
}
export default Home;
```

### SignIn.js
```
import React from 'react';

class SignIn extends React.Component {
    render() {
        return (
            <div>
                <h1>Sign In</h1>
            </div>
        );
    }
}
export default SignIn;
```

*Home.js* and *SignIn.js* are very simple, self-explanatory pages. *Container.js*, however, is a bit more complicated. It contains the nav-bar of the application, which contains **react-router** Links for navigation. Container is also responsible for showing the component associated with the current route. How does React-Router know to associate routes with specific components? It doesn’t yet, so let’s add this configuration. Within the *pages* directory, create a *routes.js* file. *routes.js* will contain some boiler-plate for our application to load routes dynamically:

```
import Container from './Container';

function errorLoading(error) {
    throw new Error(`Dynamic page loading failed: ${error}`);
}

function loadRoute(cb) {
    return module => cb(null, module.default);
}

export default {
    path: '/',
    component: Container,
    indexRoute: {
        getComponent(location, cb) {
            System.import('./Home')
            .then(loadRoute(cb))
            .catch(errorLoading);
        }
    },
    childRoutes: [
        {
            path: 'signIn',
            getComponent(location, cb) {
                System.import('./SignIn')
                .then(loadRoute(cb, false))
                .catch(errorLoading);
            }
        },
        {
            path: '*',
            getComponent(location, cb) {
                System.import('./Home')
                .then(loadRoute(cb))
                .catch(errorLoading);
            }
        }
    ]
};
```

How does this work? During the build of the app, Webpack is smart enough to take calls to 'System.import' and bundles those contents separately from the main application code. When React-Router takes the path from the URL, it calls ‘getComponent’, which attempts to grab the source for the component by calling 'System.import'. Now, 'System.import' makes a request to the server to retrieve the bundle for this specific component and then loads the route and displays it. Basically, use this 'getComponent' and 'System.import' boiler-plate to generate dynamic routes that are lazy-loaded within your application.

Note that *Container* is our root component, which renders `this.props.children`. `this.props.children` will be replaced with whatever page component the current route of the app is configured to display. Basically, 'Container' will wrap all of the other pages in the application. Because we have defined the nav-bar in 'Container', it will be present in all of the other 'childRoutes' of the application. Note that our 'indexRoute', or default route, is set to 'Home'. Any routes that aren't resolved by the router will be sent to 'Home', which is handled by the childRoute with the wildcard path '*'. You could also create a 'NotFound' rather than route the user to the Home page if you desired.

Finally, React-Router needs to know to use this *routes* definition. Modify *src/index.js* to look like this:

```
import React from 'react';
import { Router, browserHistory } from 'react-router';
import { render } from 'react-dom';

import routes from './pages/routes';

class Main extends React.Component {
    render() {
        return (
            <Router history={browserHistory} routes={routes} />
        );
    }
}
render(<Main/>, document.getElementById('root'));
```

We've imported 'Router' and 'browserHistory' from React-Router, and we're now rendering 'Router' instead of `<h1>Hello, world!</h1>`. 'Router' will use 'routes.js' to set up routes and load the necessary component based on the current route. Run `npm run start`, open 'localhost:8001' in Chrome and open up the dev-tools. As you navigate, you can see the routes are lazy-loading!

## Milestone 3: Hot-loading
In part 1, we configured our server to be able to Hot Reload our application code without us having to rebuild or refresh. We need to add a little extra configuration for this to work, so let's do it now.

We have 3 modules that we installed earlier that work together to allow the app to do Hot Reloading:

1. webpack-dev-middleware
2. webpack-hot-middleware
3. react-hot-loader

We set all of these up in part one. The last thing we have to do in our application is configure the modules to be able to reload themselves after they've been updated. Let's do this now.

The first step is to separate out the Main component of the app into its own file rather than having it live in *index.js*. Create a *Main.js* file in the *src* folder and pull out the Main class and its dependencies, excluding 'routes.js'. After we're done, *index.js* should look like this:

```
import React from 'react';
import { render } from 'react-dom';

import routes from './pages/routes';
import Main from './Main';

render(<Main routes={routes}/>,
        document.getElementById('root'));
```

and *Main.js* should look like this:

```
import React from 'react';
import { Router, browserHistory } from 'react-router';

class Main extends React.Component {
    render() {
        return (
            <Router history={browserHistory} routes={this.props.routes} />
        );
    }
}
Main.propTypes = {
    routes: React.PropTypes.node.isRequired
};
export default Main;
```

Note that we'll be passing in the routes via props now rather than importing them. Next, we need to modify *index.js* to Hot Reload our application. We need to include a dependency on 'AppContainer' from the 'react-hot-loader' module. *AppContainer* is simply a wrapper provided by React-Hot-Loader that we need to include so that Hot Reloading preserves our application's current state. We need to wrap our 'Main' like so:

```
render(<AppContainer>
            <Main routes={routes}/>
       </AppContainer>,
        document.getElementById('root'));
```

Now the AppContainer is set up, we need to add the following below the `render` function:

```
if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./pages/routes', () => {
        const updatedRoutes = require('./pages/routes').default;
        render(
            <AppContainer>
                <Main routes={updatedRoutes} />
            </AppContainer>,
            document.getElementById('root')
        );
    });
}
```

This block of code is responsible for reloading our application code when a change is made. In part 1, if we tried to make a change to the app, we would get a warning in the console saying "This module doesn't know how to reload itself". That's because we didn't include this section of code! 

Now, let's add the last configuration we need for hot reloading to work correctly. We need to add 'react-hot-loader' as the first entry point to our application in *webpack.config.js*. This is how HMR is enabled for React components.
```
entry: {
        app: [
            'react-hot-loader/patch',
            'webpack-hot-middleware/client',
            path.join(__dirname, './src/index.js')
        ]
    },
```

Next, we need to modify our *.babelrc* so Babel knows about react-hot-loader:

```
{
    "presets": ["latest", "react"],
    "env": {
        "development": {
            "plugins": [
                "react-hot-loader/babel"
            ]
        }
     }
}
```

Not a lot of explanation is done as to why and how this configuration works, but it's necessary for hot-reloading to work with React components. See [here](https://github.com/gaearon/react-hot-loader/blob/next/docs/README.md#migrating-from-create-react-app) for the original set up instructions.

Finally, we need to make a small fix for Webpack 2 and Hot Module reloading to play nice. Open up *routes.js*. Notice that our dynamic routes are all using System.import. Sadly, dynamic routing doesn't work fully with Hot Module Reloading yet, so we need to add the following to the top of our *routes.js* file:

```
if(process.env.NODE_ENV === 'development' && module.hot) {
    require('./Home');
    require('./SignIn');
}
```

This simply requires all of the routes we might load dynamically so a server request is no longer needed to grab them. What this basically means is that lazy-loading routes will only work in production, not in development. In development, those files will be packaged up with the rest of the app code. That's not a huge deal, but we should be sure that every time we add a new route, we should add it both to this code block and the code block that gets exported at the bottom of *routes.js*. Not a big deal - it should be fixed soon!

Now, run `npm run start` and open our app in a browser. Make a change in *SignIn.js* or *Home.js* and you should see it reflected automatically in the browser after you save the file!
