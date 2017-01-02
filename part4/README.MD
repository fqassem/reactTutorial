# Part 4: State management and side-effect modeling
In this part, we will focus on adding state management and the reasons for doing so.

## Milestone 1: State Management with Redux
### Setting up the store
The bigger a React application gets, the harder it becomes to deal reason about state. It's definitely possible to write React applications by just using `React.setState` calls. However, the bigger your application gets, the more difficult it becomes to share state between components. This is especially true if the components attempting to share state don't have a parent-child relationship.

There are quite a few libraries that allow you to manage state more efficiently. One of the most popular is **Redux**. Redux is a predictable state container for JavaScript apps based on **Flux**, an architecture for maintaining application state created by Facebook. Redux is based on 'functional programming', so it may be hard to reason about initially if you are unfamiliar with this paradigm. Redux is extremely powerful, but it comes at the cost of writing a bit of boilerplate code. There are libraries to help alleviate this problem, but we'll stick to using plain old Redux in this tutorial. Again, this is not a full-fledged Redux tutorial, so we won't be going into depth about all of its features.

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
```

Run `npm run start` and notice that we get no errors. We have a store set up now! Before we continue, we need a little bit more setup.  In order to write clean, asynchronous actions in Redux, we will need middleware called 'Redux-Thunk'. To read more about the reasoning behind it, check out this quick [tutorial](http://blog.nojaf.com/2015/12/06/redux-thunk/). To summarize, writing asynchronous actions while obeying the laws of 'pure' functions can get ugly. The 'redux-thunk' middleware makes it slightly less ugly. Simple!

Let's install and set it up:

```
npm install --save redux-thunk
```

Now, open up *src/index.js*. We'll need `applyMiddleware` from Redux, which tells the Redux store we'll be using some middleware that we'll pass in as parameters.  We also need to import 'thunk' from Redux-Thunk, which is our middleware. Finally, we'll need to tell the store we're using the middleware. Our *src/index.js* should now look like this:

```
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore, applyMiddleware } from 'redux'; //import applyMiddleware library function
import thunk from 'redux-thunk'; //thunk middleware

import routes from './pages/routes';
import Main from './Main';

const store = createStore(() => {}, applyMiddleware(thunk)); //pass in 'applyMiddleware' with 'thunk' to the store
const rootElement = document.getElementById('root');
...
```

Now, we have our middleware set up, and we can create asynchronous actions!

### Actions, Reducers, and State Shape
Now that we have a store and middleware set up, we need our store to do something useful! First, let's think about what we want our store to keep track of.

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

you can shorten the path to just `'./redux/user'`. It's a very useful shorthand!

Let's define each of these files, starting with the *InitialUserState*

#### src/state/user/InitialUserState.js
```
export default {
    id: null,
    firstName: '',
    lastName: '',
    username: '',
    role: 'GUEST'
};
```
A default user should have no id, blank strings for their data, and a role of 'GUEST'.

#### src/state/user/index.js
```
import InitialUserState from './InitialUserState';

//Action constants
export const SET_USER_DATA = 'SET_USER_DATA';

//Actions
export const setUserData = (userData) => {
    return { type: SET_USER_DATA, userData };
};

export const signIn = (credentials) => {
    return (dispatch) => {
        return new Promise(
            (resolve, reject) => {
                setTimeout(() => {
                    if(credentials.username !== 'fail') {
                        dispatch(setUserData({}));
                        resolve();
                    } else {
                        reject(Error('Bad Creds'));
                    }
                }, 2000);
            }
        );
    };
};

//Reducer
export default (state = InitialUserState, action) => {
    switch(action.type) {
        case SET_USER_DATA: {
            const userData = action.userData;
            return Object.assign({}, state, { ...userData });
        }
        default:
            return state;
    }
};
```

We define two actions: `setUserData`, a pure Redux action creator, and `signIn`, an asynchronous 'thunk' action. `signIn` is currently a placeholder until we plug in an actual backend, but it will behave similarly to a 'fetch' or 'XMLHttpRequest'. Unless the username we sign in with is 'fail', the hard-coded user data will be added to the state by the reducer, the promise will be resolved, and the user will be signed-in.

Now that we have our user reducer and initial state defined, let's define our root reducer. In the *state* folder, create a file called *index.js*:

```
import { combineReducers } from 'redux';
import user from './user';

export default combineReducers({
    user
});
```

As we define more reducers, we'll add them to this file. Finally, let's add this root reducer to our main *index.js* in the root of our application (where we create our store):

```
import rootReducer from './state'; //import the root reducer
import thunk from 'redux-thunk'; //thunk middleware

import routes from './pages/routes';
import Main from './Main';

const store = createStore(rootReducer, applyMiddleware(thunk)); //pass in 'applyMiddleware' with 'thunk' to the store
const rootElement = document.getElementById('root');
```

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

Another cool feature this plugin allows is declaring static class properties! We won't do that for now, but it's definitely a useful feature.




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
