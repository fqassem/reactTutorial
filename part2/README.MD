# Part 2: ESLint, Routing, and Hot-Loading
Now that we have a very basic, working framework for writing applications, let's add on to it. In this part, we will be adding:

* ESLint, for enforcing code-style and catching bugs
* Routing using React-Router
* Hot-Loading for faster development

Let's begin!

## Milestone 1: ESLint
**ESLint** is a very useful development tool. It helps us standardize our code and avoid bugs that we might otherwise miss. ESLint is configurable, allowing you to turn off, on, or modify certain rules to enforce a consistent code style across your team. Let's install it now as a devDependency:

```
npm install --save-dev eslint
npm install --save-dev eslint-loader
```

Note that we've also installed **eslint-loader** in order for Webpack to know that we want ESLint to process certain files during the build.

Now that we have the ESLint loader and core installed, let’s tell Webpack to run our files through ESLint during the build. Open the *webpack.config.js* file and add the following rule:

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

Now, let's run `npm run start`. Notice that our build complains about 'No ESLint configuration found.'. This is because ESLint looks for a configuration named *.eslintrc*, which we haven't created yet. Let's create one now in the root of our app:

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

This tells ESLint that global ‘browser’ variables like `window` and `document` are expected and should not raise red flags. In `"parserOptions"`, we are telling ESLint that we will be using ES6 syntax and ES6 modules (source files that use `import` and `export`). We also tell it that we will use JSX in our code so that it doesn't complain. Because we are using ES6 modules and ES6 modules are in strict mode by default, we set `"impliedStrict"` to true so that any unnecessary "use strict" declarations in our code are caught.

By default, ESLint uses a parser called 'Espree'. While this parser is useful for most general cases, it won't support all of the advanced syntax or experimental features that Babel knows about and uses to transpile our code. To get ESLint and Babel to play nice, let's use the **Babel-ESLint** parser instead of the default.

```
npm install --save-dev babel-eslint
```

Now, in your *.eslintrc* file, add the following line to tell ESLint we want to use Babel-ESLint as our parser:

```
    "parser": "babel-eslint"
```

Let’s set up ESLint to run automatically on our files within our environment, not just during our build. This will help us find syntax errors in real-time. Pick the environment you're using and follow the instructions to install the ESLint plugin:

* [IntelliJ](https://plugins.jetbrains.com/plugin/7494)
* [Atom](https://atom.io/packages/eslint)

Now that we have ESLint running in our IDE, let's add some style rules. [Airbnb](https://airbnb.com) has published a very widely used ESLint configuration file (with React rules too!) for all to use. To install this configuration, run the following commands to install the configuration and its dependencies:

```
npm install --save-dev eslint-config-airbnb eslint-plugin-jsx-a11y@2.2.3 eslint-plugin-react eslint-plugin-import
```

Now, add `"extends": "airbnb"` to your *.eslintrc* config. This tells ESLint we want to use the Airbnb code style config we just installed.

You might end up with errors if you save your *.eslintrc* file and run `npm run start`. Depending on how you want your code styled, you can turn off, turn on, or modify certain rules in *.eslintrc*. For a good explanation of how this works, visit the ESLint [documentation](http://eslint.org/docs/user-guide/configuring#configuring-rules). I've added and modified the following rules in my *.eslintrc* file to fit my code style:

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

Let’s start by installing React-Router v3:

```
npm install --save react-router
```

Be sure you’ve installed v3 by looking at your package.json file. Because React-Router is required by the code we run on the browser, we install it as a 'dependency'.

Let’s also create some files that represent pages within our application. This will help showcase routing, as well as incremental loading, in our app. It will also be the start of our sample progressive web-app. Create a *pages* directory within *src*. This directory will hold the pages of our website that a user can navigate to. Add the following files:

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

Note that *Container* is our root component, which renders `this.props.children`. `this.props.children` will be replaced with whatever page component the current route of the app is configured to display. Basically, 'Container' will wrap all of the other pages in the application. Because we have defined the nav-bar in 'Container', it will be present in all of the other 'childRoutes' of the application. Note that our 'indexRoute', or default route, is set to 'Home'. Any routes that aren't resolved by the router will be sent to 'Home', which is handled by the childRoute with the wildcard path '*'. You could also create a 'NotFound' page rather than route the user to the Home page if you desired.

Finally, React-Router needs to know to use these *routes*. Modify *src/index.js* to look like this:

```
import 'babel-polyfill';
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

We've imported 'Router' and 'browserHistory' from React-Router, and we're now rendering 'Router' instead of `<h1>Hello, world!</h1>`. 'Router' will use the routes from *routes.js* to set up routes and load the necessary component based on the current route. Run `npm run start`, open 'localhost:8001' in Chrome and open up the dev-tools. As you navigate, you can see the routes are loading as they're needed!

## Milestone 3: Hot-loading
In part 1, we configured our server to be able to Hot Reload our application code without us having to rebuild or refresh. We need to add a little extra configuration for this to work, so let's do it now.

We have 3 modules that we installed earlier that work together to allow the app to do Hot Reloading:

1. webpack-dev-middleware
2. webpack-hot-middleware
3. react-hot-loader

The last thing we have to do in our application is configure the modules to be able to reload themselves after they've been updated. Let's do this now.

The first step is to separate out the Main component of the app into its own file rather than having it live in *index.js*. Create a *Main.js* file in the *src* folder and pull out the Main class and its dependencies, excluding 'routes.js'. After we're done, *index.js* should look like this:

```
import 'babel-polyfill';
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

This block of code is responsible for reloading our application code when a change is made. In part 1, if we tried to make a change to the app, we would get a warning in the console saying "This module doesn't know how to reload itself". That's because we didn't include this section of code! If we are in a development build, and the module is hot-reloaded, any components we change will try to reload themselves. This 'request' to change the component will bubble up until it gets to this block of code where we re-render our app with newly updated routes and the code they contain!

Now, let's add the last configuration we need for hot reloading to work correctly and play nice with the internal state of our React components. We need to add react-hot-loader as the first entry point to our application in *webpack.config.js*. This is how HMR is enabled for React components. If we omit React-Hot-Loader, our React component's local state would not be preserved!
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
    "plugins": ["transform-class-properties", "transform-object-rest-spread"],
    "env": {
        "development": {
            "plugins": [
                "react-hot-loader/babel"
            ]
        }
     }
}
```

Not a lot of explanation is given as to why and how this configuration works, but it's necessary for hot-reloading to preserve the state of React components. See [here](https://github.com/gaearon/react-hot-loader/blob/next/docs/README.md#migrating-from-create-react-app) for the original set up instructions.

Finally, we need to make a small fix for Webpack 2 and Hot Module Reloading to play nice. Open up *routes.js*. Notice that our dynamic routes are all using System.import. Sadly, dynamic routing doesn't yet function correctly with Hot Module Reloading, so we need to add the following to the top of our *routes.js* file:

```
if(process.env.NODE_ENV === 'development' && module.hot) {
    require('./Home');
    require('./SignIn');
}
```

This simply requires all of the routes we might load dynamically so a server request is no longer needed to grab them. What this basically means is that lazy-loading routes will only work in production, not in development. In development, those files will be packaged up with the rest of the app code. That's not a huge deal, but we should be sure that every time we add a new route, we should add it both to this code block and the code block that gets exported at the bottom of *routes.js*. Not a big deal - it should be fixed soon!

Now, run `npm run start` and open our app in a browser. Make a change in *SignIn.js* or *Home.js* and you should see it reflected automatically in the browser after you save the file!

## A few notes about React Components
Before we dive further into React and some of the code in this tutorial, we should talk a bit about how to structure our React Components, as well as things to watch out for. Again, this is not a full tutorial, but more about best practices and how to structure your code.

The purpose of React is to create reusable components that can be used throughout an application to compose our interactive UI. The majority of the components that comprise an application should be *stateless*. State becomes a huge concern when our app hierarchy grows in size and scope, so it definitely deserves its own section. We'll also talk about React types and how to make life easier with type checking.

### State in React
#### Overview
State is a huge topic in React. Remember that React is simply the 'V' in 'MVW'. You can handle state however you like. As you app grows, you'll find that without having a good way to organize your components, your code turns into a mess.

In React, it's good to understand the separation between 'presentational' and 'container' components. We'll go over the basics, but for more information, go to Dan Abramov's very detailed article [here](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.y590lz3f8).

'Presentational' components are components we create that don't contain application state or logic. They simply display what is given to them via props. They basically describe how things look on the page. It's perfectly ok for them to contain UI logic, like CSS and conditional styles. However, if they contain application state, we can introduce all kinds of bugs into our app code, as well as complicate our code base.

'Container' components compose these 'presentational' components. They know how to maintain the application's data, and they provide this data to the presentational components. Any communication with a state management library is done via these container components. Note that container components can contain other container components! 

Simply put, the container components are usually parent components, and the children usually presentational componenents. Anything the child needs is given to it by the parent. Data flow in React is generally one-way, from parent to child (children *react* to changes in the parent). Trying to get around this becomes messy, as we'll see in our next example.

####Example
Let's make this concrete with an example. Imagine we're creating a tic-tac-toe game very similar to the React [tutorial](https://facebook.github.io/react/tutorial/tutorial.html). Our `Board` component will represent the 3x3 grid. Our `Square` component will represent the individual squares that comprise the grid. A square can be blank, contain an 'X', or contain an 'O'. For simplicity's sake, we won't fully implement the game. We'll simply draw an 'X' on the square the user clicked.

If we think about this in a React way, we'll come to the conclusion that `Board` should be our container component. It should handle the logic of the game and contain all the state. `Square` should be a presentational component. Its only responsibility should be to display an 'X' or an 'O' when it's clicked. Let's purposely do things the wrong way to demonstrate why we need to define our components this way, and then go back and fix it.

```
class Board extends React.Component {
    render() {
        //While this could be done more compactly with loops, it's just easy to see this way:
        return (
            <div>
                <div className="board-row">
                    { <Square /> }
                    { <Square /> }
                    { <Square /> }
                </div>
                <div className="board-row">
                    { <Square /> }
                    { <Square /> }
                    { <Square /> }
                </div>
                <div className="board-row">
                    { <Square /> }
                    { <Square /> }
                    { <Square /> }
                </div>
            </div>
        );
    }
}

class Square extends React.Component {
    constructor() {
        super();
        this.state = { value: '' }
    }

    render() {
        return (
            <button className="square" onClick={() => this.setState({value: 'X'})}>
                {this.state.value}
            </button>
        );
    }
}
```

Notice that we're tracking state in the `Square` component, which is something we shouldn't do in our presentational components. Each individual square only knows about its current state and nothing about its neighboring squares. Imagine if we wanted to expand on this game and fully implement 'tic-tac-toe'. Each `Square` would have to communicate its state back to the board and the board would aggregate this data and process it. Trying to keep track of this would become a headache!

React has a philosophy of 'lifting' the state, which plays well with our container/presentational distinction. When you want to aggregate data from multiple child components or have two child components communicate with each other, 'lift' the state up so that it lives in the parent component. In our case, we should keep the state of the `Square`s in the `Board` component and simply pass data the `Square` needs via props. This way, the split between state and presentation is maintained!

If we did it this way, our `Board` now looks like this:

```
class Board extends React.Component {
    constructor() {
        super();
        this.state = { squares: Array(9).fill(null) }
    }

    renderSquare(i) {
        return <Square value={this.state.squares[i]} onClick={() => this.handleClick(i)} />;
    }

    handleClick(i) {
        const squares = this.state.squares.slice();
        squares[i] = 'X';
        this.setState({squares: squares});
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}
```

and our `Square` looks like this:
```
class Square extends React.Component {
    render() {
        return (
            <button className="square" onClick={() => this.props.handleClick()}>
                {this.props.value}
            </button>
        );
    }
}
```

Our `Square` is now stateless and super simple! All it's focused on is presentation. The `onClick` and current `value` it needs are passed in from the `Board` class, which manipulate state outside the scope of `Square`. `Square` is merely a trigger for these state changes to occur.

We can take this a step further by removing all of the syntactic sugar and creating what is called a 'functional stateless component'. Our `Square` component becomes this:

```
const Square = ({handleClick, value}) => {
    return (
        <button className="square" onClick={handleClick}>
            {value}
        </button>
    );
}
```

No boilerplate, no 'this' keyword - as simple as can be. Anything that's needed by `Square` is passed in via props, which we deconstruct in the parameters. This is the preferred way to write presentational components that don't need access to the DOM or the lifecycle functions React provides (e.g. *componentDidMount*). In the future, Facebook says that there may be performance benefits for using stateless, functional components too! For a nice list of benefits you get using stateless, functional components, visit this cool [article](https://medium.com/@housecor/react-stateless-functional-components-nine-wins-you-might-have-overlooked-997b0d933dbc).

This distinction between presentational and container components will be important as our application grows in size and scope. The larger a React app grows, the larger the component hierarchy becomes, and the more difficult it becomes to pass props from parent to child. That's where state libraries like Redux come in handy. We'll set up Redux in a later part of this tutorial.

### Types in React and JavaScript
In React code, you may see "PropTypes" declared. "PropTypes" are a very useful debugging tool and we should use them everywhere in our React code. They help enforce that the props being passed into a component exist and are of the correct type (function, object, array, etc). PropTypes are a runtime tool, so they'll only be checked for components in our current code path. For static type checking in JavaScript, **Flow** can help catch type errors in your code and save you hours of debugging time. We don't set up Flow in this tutorial, but it is definitely something worth checking out. For further information, go the Flow website's [React page](https://flowtype.org/docs/react.html).
