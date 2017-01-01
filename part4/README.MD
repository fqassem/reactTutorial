# Part 4: State management and side-effect modeling
In this part, we will focus on adding state management and the reasons for doing so.

## Milestone 1: State Management with Redux
### Setting up the store
The bigger a React application gets, the harder it becomes to deal reason about state. It's definitely possible to write React applications by just using `React.setState` calls. However, the bigger your application gets, the more difficult it becomes to share state between components.

There are quite a few libraries that allow you to manage state more efficiently in JavaScript. One of the most popular is **Redux**. Redux is a predictable state container for JavaScript apps based on **Flux**, an architecture for maintaining application state created by Facebook. Redux is based on 'functional programming', so it may be hard to reason about initially if you are unfamiliar with this paradigm. One of the biggest drawbacks of Redux is the amount of boiler-plate you have to write. There are libraries to aid with this, but we will be using plain Redux in this tutorial. Again, this is not a full-fledged Redux tutorial, but mostly how to set it up and use it in our app.

Let's install and setup Redux in our application.

```
npm install --save redux
npm install --save react-redux
```

They are installed as regular 'dependency's because the browser needs them to manage our state. We also installed **React-Redux**, a library that includes useful bindings for more easily using Redux and React together. It's not necessary, but it makes using React and Redux together much nicer. Next, let's open up our *webpack.base.config.js* and add these libraries to our `vendor` entry so they're bundled with the other framework code:

```
    entry: {
        vendor: ['react', 'react-dom', 'react-router', 'redux', 'react-redux']
    },
    ...
```

Let's set up the Redux store. Open up *src/Main.js*. Let's import 'Provider' from 'react-redux' and add it to our app. 'Provider' connects our components to the Redux store. We'll only have to set it up here at the root component of our app. 'Provider' accepts a 'store' prop, which we will pass in from *index.js* much like we do for the `routes` prop. Your *Main.js* file should look like this now:

```
import React from 'react';
import { Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

class Main extends React.Component {
    render() {
        return (
            <Provider store={this.props.store}>
                <Router history={browserHistory} routes={this.props.routes} />
            </Provider>
        );
    }
}
Main.propTypes = {
    routes: React.PropTypes.object.isRequired,
    store: React.PropTypes.object.isRequired
};
export default Main;

```

Now, let's create the store and pass it in. Open *index.js* and import 'createStore' from 'redux'. This is the library function we will use to create our store. It accepts a rootReducer as a parameter. Because we haven't defined any reducers yet, let's simply define an empty function as a placeholder. While we're at it, let's clean the file up a bit by removing some duplication. Instead of us calling `document.getElementById('root')` multiple times in this file, let's replace it with `rootElement` constant we define at the top of the file.

Our *index.js* should look like this now:

```
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore } from 'redux';

import routes from './pages/routes';
import Main from './Main';

const rootElement = document.getElementById('root');
const store = createStore(rootReducer);

render(<AppContainer>
            <Main routes={routes} store={store}/>
        </AppContainer>,
        rootElement);

if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./pages/routes', () => {
        const updatedRoutes = require('./pages/routes').default;

        render(
            <AppContainer>
                <Main routes={updatedRoutes} />
            </AppContainer>,
            rootElement
        );
    });
}
```

Run `npm run start` and notice that we get no errors. We have a store set up now!

### Actions, Reducers, and State Shape
Now that we have a store set up, we need our store to do something useful! First, let's think about what we want our store to keep track of.

Let's think about the website we want to create. It shouldn't be too complex. At minimum, we'd like the following features:

* Register
* Log-in
* Log-out
* Edit profile
* See some pre-defined content while logged in

These are pretty standard features for any website. These features are essentially 'actions' that a user can perform by clicking a button. What is a user? A user is someone with an id, username, and first and last name (perhaps even an address, state, zipcode, etc). They may be registered or unregistered. Let's structure our user as follows:

```
{
    user: { id, username, firstName, lastName, role }
}
```

`user` is our user's state. Initially when a user comes to our website, they will not be logged in. An first-time, unauthenticated user will have no id, firstName, lastName, or username! If the user is not logged in, let's give them a role of 'GUEST'. If they are logged in, the 'user' state should be populated with an `id`, `firstName`, `lastName`, `userName`, and `role` from the backend. A user's role will affect the parts of the website that they can access. In our example website, only an authenticated user can access content other than the log-in page.

A user will also be interacting with a sign-in form. Should we store the state of the form in Redux? Does the rest of the application need access to the form state? Will other parts of the application affect the state of this form? Will the state of the form need to be kept after the component is unmounted from the DOM? If the answer to these questions is no, we can get away with just using `React.setState()` for component-level state. There are pros and cons for keeping all of your state in Redux. The general rule is to just go with what's easiest to understand and takes the least amount of code. If you find you can keep the whole app state in Redux in a clean manner, then go for it. In this tutorial, we'll keep component-level state and application-level state separate.

### User state
Create a *state* folder in the *src* folder of the application. This is where all of our state management code will go. Within this folder, create the following:

1. *index.js*, where our root reducer will live
2. *user* folder, where our user related state management will live
3. *user/InitialUserState.js*, an object the describes the shape of the 'user' state
4. *user/index.js*, where all of our user related actions, action creators, and reducers live

Note that we will be using a Redux 'philosophy' called '[Ducks](https://github.com/erikras/ducks-modular-redux)'. 'Ducks' keeps the Redux boiler-plate self-contained and easier to manage. The alternative is to define actions, action creators, and reducers in separate folders/files, which gets tedious when you need access to related files.

Also note that we are calling some files *index.js*. *index.js* is a special file name that can be imported easily in other files simply by referring to the path of the containing folder. For example, if I wanted to refer to the file that contains our user actions, creators, and reducers, rather than doing this:

```
import stuff from './redux/user/index.js'
```

you can shorten the path to just './redux/user'. It's a useful shorthand that we can use elsewhere.

Let's define each of these files, starting with the *user* folder

#### src/state/user/InitialUserState.js
```
export default {
    isFetching: false,
    error: null,
    id: null,
    firstName: '',
    lastName: '',
    username: '',
    role: 'GUEST'
};
```

While most of the fields are self-explanatory, notice that we added 'isFetching' and 'error'. Because our user data is coming from a backend somewhere, it's possible that we might get an error while retrieving the data. Because sign-in, sign-out, and registration are asynchronous, we will use these two fields to keep track of

#### src/state/user/index.js



Notice that we're using arrow functions in our ES6 classes to automatically bind `this` to our class methods. This is still an experimental feature and Babel will need to know how to transpile it. If you don't want to do any configuration changes, you can simply use the old syntax of binding the class functions in the constructor and instead use the old function declaration. If you want to use this syntax, you'll need to install the **babel-transform-class-properties** plugin:

```
npm install --save-dev babel-transform-class-properties
```

and modify our *.babelrc* to use this plugin during transpilation by adding it to (or creating) the 'plugins' array:

```
    ...,
    "plugins": ["transform-class-properties"],
    "env": ...

```

Another cool feature this plugin allows is declaring static class properties! We won't do that for now, but it's defintely a useful feature.

One last thing to note: much like our routes, our reducers don't hot reload automatically either. To fix this, we need to open up *src/index.js* and add the following to the `if` block:

```
if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./state/', () => {
        const nextReducer = require('./state').default;
        store.replaceReducer(nextReducer);
    });

    module.hot.accept('./pages/routes', () => {
        ...
    });
}
```
