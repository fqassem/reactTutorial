# Part 4: State Management
In this part, we will focus on adding state management and the reasons for doing so.

## Milestone 1: State Management with Redux
### Setting up the store
The bigger a React application gets, the harder it becomes to deal reason about state. It's definitely possible to write React applications by just using `React.setState` calls. However, the bigger your application gets, the more difficult it becomes to share state between components. This is especially true if the components attempting to share state don't have a parent-child relationship.

There are quite a few libraries that allow you to manage state more efficiently. One of the most popular is **Redux**. Redux is a predictable state container for JavaScript apps based on **Flux**, an architecture for maintaining application state created by Facebook. Redux is based on 'functional programming', so it may be hard to reason about initially if you are unfamiliar with this paradigm. Redux is extremely powerful, but it comes at the cost of writing a bit of boilerplate code. There are libraries to help alleviate this problem, but we'll stick to using plain old Redux in this tutorial. Again, this is not a full-fledged Redux tutorial, so we won't be going into depth about all of its features.

### Side-note: Arrow Functions as class methods
If you want to use arrow functions as class methods instead of binding in the `render` or constructor, you'll need to install the **babel-transform-class-properties** plugin. This is still an experimental feature (not yet standardized) and Babel will need to know how to transpile it with a plugin. If you don't want to do any configuration changes, you can simply use the old syntax of binding the class functions in the constructor and instead use the old function declaration. If you want to use this syntax:

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

### Regularly scheduled program
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

So, now our *src/index.js* file looks like this:
```
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore } from 'redux';

import routes from './pages/routes';
import Main from './Main';

const store = createStore(() => {}); //empty placeholder root reducer
const rootElement = document.getElementById('root');

render(<AppContainer>
            <Main routes={routes} store={store}/>
        </AppContainer>,
        rootElement);

if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./pages/routes', () => {
        const updatedRoutes = require('./pages/routes').default;

        render(
            <AppContainer>
                <Main routes={updatedRoutes} store={store}/>
            </AppContainer>,
            rootElement
        );
    });
}

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
    firstName: null,
    lastName: null,
    username: null,
    role: 'GUEST'
};
```
A default user should have no id, firstName, lastName, userName. They should also have a role of 'GUEST', signifying they are not signed in.

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
                        dispatch(setUserData({ id: 1, firstName: 'Tom', lastName: 'Jones', username: 'tomjones', role: 'USER' }));
                        resolve();
                    } else {
                        reject(Error('Username or password was invalid'));
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
            return Object.assign({}, state, userData );
        }
        default:
            return state;
    }
};
```

To get us started, let's create the sign-in functionality. We define two actions: `setUserData`, a pure Redux action creator, and `signIn`, an asynchronous 'thunk' action. `signIn` is currently a placeholder until we plug in an actual backend, but it will behave similarly to a 'fetch' or 'XMLHttpRequest'. Unless the username we sign in with is 'fail', the hard-coded user data will be added to the state by the reducer, the promise will be resolved, and the user will be signed-in.

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

Now, we've got our reducer hooked up to our store. If we run our application, nothing useful will happen because we're not calling our `signIn` function any where! Let's fix that in the next section.

### Adding sign-in form
We have our state infrastructure defined, but there's nothing that uses it yet. Because we've already defined our signIn state management, let's create a 'sign-in' form. Let's create a new folder that houses the forms we're goign to create. In the root of our application, create a *src/forms* folder. Within this folder, create a *SignInForm.js* file:

```
import React from 'react';

class SignInForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: ''
        };
    }

    onSignIn = (event) => {
        const { username, password } = this.state;
        event.preventDefault();

        this.props.onSignIn(username, password); //call the passed in onSignIn function
    }

    handleUsernameChange = (event) => {
        const newUsername = event.target.value;
        this.setState({
            username: newUsername
        });
    }

    handlePasswordChange = (event) => {
        const newPassword = event.target.value;
        this.setState({
            password: newPassword
        });
    }

    render() {
        const { username, password } = this.state;
        const { isFetching, error } = this.props;
        return (
            <form onSubmit={this.onSignIn}>
                { isFetching && <div>Loading gif</div> }
                { error && <div>{error.message}</div> }
                <div>
                    <label>Username</label>
                    <input type="text" placeholder="Username" name="username"
                      onChange={this.handleUsernameChange} value={username}/>

                    <label>Password</label>
                    <input type="password" placeholder="Password" name="password"
                      onChange={this.handlePasswordChange} value={password}/>

                    <button type="submit">Sign In</button>
                </div>
            </form>
        );
    }
}
SignInForm.propTypes = {
    onSignIn: React.PropTypes.func.isRequired,
    isFetching: React.PropTypes.bool.isRequired,
    error: React.PropTypes.object.isRequired
};
export default SignInForm;
```

This is a fairly barebones form. It accepts three props:

* onSignIn - the function we want to be called when the form's 'signIn' button is pressed
* isFetching - a boolean that tells us if we should show a loading spinner so the user knows something is going on
* error - if an error occurs or if the user fails to sign in, we'll use this property to show the error to the user

We don't check username or password length, but that should be fairly trivial to implement on your own. We kept the state in this component to a bare minimum so it can be reused if we need to place it in case multiple places in the application.

Now that we've created our form, let's add it to our *pages/SignIn.js* page:
```
import React from 'react';
import { connect } from 'react-redux';

import { browserHistory } from 'react-router';
import { signIn } from '../state/user';
import SignInForm from '../forms/SignInForm';

class SignIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isFetching: false,
            error: null
        };
    }

    componentWillMount() {
        if(this.props.user.role !== 'GUEST') { //forward already signed-in users
            browserHistory.push('/');
        }
    }

    onSignIn = (username, password) => {
        const credentials = { username, password };

        this.setState({ isFetching: true, error: null });
        this.props.signIn(credentials)
            .then(() => this.setState({ isFetching: false }))
            .then(() => browserHistory.push('/'))
            .catch(error => this.setState({ isFetching: false, error }));
    }

    render() {
        const { isFetching, error } = this.state;
        return (
            <div>
                <h1>Sign In</h1>
                <SignInForm onSignIn={this.onSignIn} isFetching={isFetching} error={error}/>
            </div>
        );
    }
}
SignIn.propTypes = {
    signIn: React.PropTypes.func.isRequired,
    user: React.PropTypes.object
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
export default connect(mapStateToProps, { signIn })(SignIn);
```

The `onSignIn` function is the heart of this page. When it's called, we set `isFetching` to true and remove any errors that were present. Then we call the `signIn` Redux thunk action we defined earlier. If it completes successfully, we set `isFetching` to false and we redirect the user to the home page. If an error occurs during the `signIn` call, we capture it so the form can display it.

In the `render` function, we define our *SignInForm* and pass in the props it cares about.

Notice that we've added a `componentWillMount`. It's purpose is to check if the user is already signed-in. If that's the case, we simply forward them to the Home page.

### Adding 'hidden' content
Now that we have a way to sign in, let's greet the signed-in user on the home page! Let's start with something simple to demonstrate the concept. In *Home.js* , let's connect the page to Redux and if the user is signed in, let's display their username. After connecting our component and adding the display of username (if the user is signed in), our component looks like this:

```
import React from 'react';
import { connect } from 'react-redux';

class Home extends React.Component {
    render() {
        const { user } = this.props;
        return (
            <div>
                <h1>Home</h1>
                {user.role !== 'GUEST' && <p>Welcome, {user.username}</p>}
            </div>
        );
    }
}
Home.propTypes = {
    user: React.PropTypes.object
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
export default connect(mapStateToProps)(Home);
```

If the user does not have a role of 'GUEST', they should be signed in. If that's the case, we display their username on the homepage. Easy! Note that this is not a completely fool-proof method of verifying a user is who they say they are. A malicious user could still manipulate the role they are because all of this is being stored and rendered client-side! In a later tutorial, we will add user tokens and server-side authentication so that a malicious user can access and modify only what their token allows them to.

### Hot-Reloading reducers
One last thing to note: much like our routes, our reducers don't hot reload automatically either. So, if we make changes to our reducers, we won't see it reflected unless we add the following block of code our 'if development' block in *src/index.js*:

```
if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./state', () => {
        const nextReducer = require('./state').default;
        store.replaceReducer(nextReducer);
    });

    module.hot.accept('./pages/routes', () => {
        ...
    });
}
```

Finally, our *src/index.js* file ends up looking like this:

```
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './state';
import routes from './pages/routes';
import Main from './Main';

const store = createStore(rootReducer, applyMiddleware(thunk));
const rootElement = document.getElementById('root');

render(<AppContainer>
            <Main routes={routes} store={store}/>
        </AppContainer>,
        rootElement);

if(process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('./state/', () => {
        const nextReducer = require('./state').default;
        store.replaceReducer(nextReducer);
    });

    module.hot.accept('./pages/routes', () => {
        const updatedRoutes = require('./pages/routes').default;

        render(
            <AppContainer>
                <Main routes={updatedRoutes} store={store}/>
            </AppContainer>,
            rootElement
        );
    });
}
```
