# Part 4: Back-end, State Management, Forms, and Sign-in
In this part, we will create a simple Express.js backend for our application to make real REST API calls. We won't create an actual database component, but it should be simple enough to add if you wanted to (see an example [here](https://blog.risingstack.com/node-js-database-tutorial/).

Next, we'll focus on adding state management to our application using [Redux](http://redux.js.org/). Redux is a popular and very powerful state management library based on [Flux](https://facebook.github.io/flux/), an application architecture popularized by Facebook. We'll also want a way to manage our application's forms, so we will use [Redux-Form](http://redux-form.com/6.4.3/) to make creating, updating, and using forms quick and easy.

Finally, we'll create the first part of our sample application's auth flow: sign-in. It will demonstrate Redux's capabilities and also how to make API calls to our backend. After we are signed-in, we'll be able to see some restricted resources that only signed in users can access. Let's get started!

## Milestone 1: An Express.js Backend
### Big picture
Let's step back a bit. So far, we've been creating a framework from scratch. Along the way, we made a very simple application to demonstrate some features of the framework and to test that it was really working. We coded up a few pages that don't really do much. There's a nav-bar and two pages that just print out 'Home' or 'Sign-in' to the screen depending on your current route. As we add new technologies, we'll create features that demonstrate how to use them in our application. Remember, the focus of this tutorial is more on creating the framework rather than creating the application, but it's worth talking some about both.

Let's expand on what we've created so far by adding authentication to our application! Authentication is a huge pain in the backside. It's one of the tougher aspects of creating an application that lives client-side. There are a few server-side libraries to help make authentication a bit easier to implement, such as [Passport.js](http://passportjs.org/). We won't use these libraries, but we will create a working authentication flow that you can easily modify in the future.

We'll also need to create forms so the user can perform the authentication flow: register, sign-in, editing profile information, and sign-out. Forms are a large topic and can become unwieldy if you let them. Forms are arguably one of the more complicated pieces of client-side web development, so we'll use the Redux-Form library to make our lives a bit easier. We'll focus on the sign-in portion of the auth flow in this part of the tutorial. We'll add the rest in a later part.

When we finish this part of the tutorial, we will have set up state management within our application. We'll have also implemented a clean, easy-to-use method for creating forms that make requests to our back-end. We will use these forms to authenticate our user and access 'restricted' resources!

### Side note
In a real application, you should create a separate project to house your server code. We don't do this here to keep our tutorial compact, but it's something to keep in mind for production projects. One project/build for your client-side code and a separate project/build for your server-side code should be the goal for real applications.

### Setting up the back-end
Server code. Fun stuff. You're welcome to skip this part if you aren't interested in writing server-side code. You're also welcome to substitute this server with one you've already written, or some off the shelf implementation. If you choose to use the server we create in this section, be sure to add *apiServer.js* to your application and to modify *./devServer.js* so you have the server set up and ready to accept API calls. Grab those files from the repo and you should be good to go. For the more adventurous of you, continue on.

In the root of our application, let's create a file called *apiServer.js*. This file will hold all of the code for our back-end server. Let's piece it together:

```
import express from 'express';

const api = express();
const router = express.Router();

//Sample GET API
router.get('/testGet', (req, res) => {
    res.send('Hello!');
});

//Sample POST API
router.post('/testPost', (req, res) => {
    res.sendStatus(200);
});

//CORS
api.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Resolve '/api' prefixed routes
api.use('/api', router);

export default api;
```

This should look somewhat familiar. It's very similar to the code we wrote to get our devServer running. We create an 'express' instance and, because we need more control over routing than the devServer does, we'll also create a `Router` instance to handle our API calls.

Next, we create two simple sample 'test' APIs - a GET and a POST. We also add some CORS configuration so that the server and client play nice. Note that this is NOT a production CORS config. Wildcard origins can cause security issues, so using this config in production would necessitate some [changes](https://www.w3.org/wiki/CORS_Enabled).

Then, we tell our server to use '/api' as the path to resolve requests. When we run our devServer, we'll also run our API server alongside it. Any requests made to '/api' will be handled by the API server. Any other requests will be handled by the devServer.

Finally, we simply export the API server. Now, let's modify our *devServer.js* to run the apiServer alongside it. To make this cleaner, we'll have our development server use a proxy to communicate to our backend server. That way we have less to keep track of during development - just a single endpoint that we hit to both serve our assets and make API calls. Neat!

Let's install **express-http-proxy** so we can set up a proxy from our dev server to our backend server.

```
npm install --save-dev express-http-proxy
```

Now, in *devServer.js*, `import proxy from 'express-http-proxy';`, and add the following code to create and use the proxy:

```
const apiProxy = proxy('http://localhost:8002/', {
    forwardPath: (req, res) => {
        return require('url').parse(req.baseUrl).path;
    }
});

app.use('/api/*', apiProxy);
```

Now, if you go to 'localhost:8001/api/testGet' in your browser, you should see 'Hello!'. Notice that our backend server is actually running on port 800*2*, so our dev server is proxying correctly! You can also test the POST request in a REST client and see it return a 200.

### APIs
Let's replace our test APIs with something a bit more useful. Our users will need to be able to sign-in, sign-out, register, and modify their data. Before we go further, let's create a simple map containing users so we can test and see the sign-in API is working correctly. We'll also add password hashing so we don't store passwords in plain-text. Obviously, a real implementation would utilize a database so data isn't volatile. If you wish to add a database component, that's up to you, but this should suffice for our purposes.

To add password hashing, we'll use **bcrypt**. [Why not MD5/SHA/etc?](https://codahale.com/how-to-safely-store-a-password/). This library provides both synchronous and asynchronous versions of its hashing and comparison functions. Because we don't want to create blocking code, we'll use the asynchronous versions. We'll use the sync version only once in our 'users' object setup for the sake of simplicity, but we'll use the async version everywhere else. Let's install 'bcrypt' now:

```
npm install --save-dev bcrypt
```

Next, in our *apiServer.js*, we'll begin using bcrypt: `import bcrypt from 'bcrypt';`. Next, let's add a global 'users' object in our application code. This 'users' object will mimic a database implementation.

```
const users = {
    tomjones: {
        username: 'tomjones',
        password: bcrypt.hashSync('password', 10),
        email: 'tom@jones.com',
        firstName: 'Tom',
        lastName: 'Jones',
        role: 'USER'
    }
};
```

Our 'users' object will contain... users. A user object will consist of a username, password, email, first name, last name, and role. Role can be one of two strings (for registered users): 'USER' or 'ADMIN'. We'll turn off/on certain features in our code based on the user's role.

We'll also use a JWT token for user authentication. Remember that the user can change *anything* on the client side. If they want to access a protected resource, they must go through the server and verify they have the permissions to see/use/modify the resource they're attempting to access. We'll use the JWT token every time the user attempts to access protected resources to verify they are who they say they are. Let's install the JWT library:

```
npm install --save-dev jsonwebtoken
```

We'll define a secret signing key in our server code along with a 'generateToken' function to create the JWT from user data and give it an expiration time:

```
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'SUPER_DUPER_SECURE_SECRET';

const generateToken = (user) => {
    return jwt.sign(user, JWT_SECRET, {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
    });
};
...
```

Our api server code should now look like this:
```
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const users = {
    tomjones: {
        username: 'tomjones',
        password: bcrypt.hashSync('password', 10),
        email: 'tom@jones.com',
        firstName: 'Tom',
        lastName: 'Jones',
        role: 'USER'
    }
};

const JWT_SECRET = 'SUPER_DUPER_SECURE_SECRET';

const api = express();
const router = express.Router();

const generateToken = (user) => {
    return jwt.sign(user, JWT_SECRET, {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
    });
};

//Sample GET API
router.get('/testGet', (req, res) => {
    res.send('Hello!');
});

router.post('/testPost', (req, res) => {
    res.send('Hello!');
});

//CORS
api.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Resolve '/api' prefixed routes
api.use('/api', router);

export default api;
```

#### Sign-in API
Our sign-in POST request will accept a username and a password in the body. Interestingly, POST requests are not immediately supported out-of-the-box in Express.js. The request body needs some special handling not installed by default. There are two ways to do add this functionality - manually or via a library called **body-parser**. We don't want to do it by hand, so we need to install **body-parser**:

```
npm install body-parser --save-dev
```

Next, in *apiServer.js*, we need to `import bodyParser from 'body-parser';`. Next, to support encoded request bodies, we define `const urlencodedParser = bodyParser.urlencoded({ extended: false });` near the top of our file. This is a parser that Express will use to process encoded request bodies. We'll add the parser as a parameter to the 'post' call we make for '/signIn'.

Here is our '/signIn' POST request:

```
router.post('/signIn', urlencodedParser, (req, res) => {
    const credentials = req.body;

    if(!credentials) {
        return res.sendStatus(400);
    }

    if(!credentials.username || !credentials.password) {
        return res.status(400).send('Missing username or password');
    }

    const user = users[credentials.username];
    if(user === undefined) {
        return res.status(400).send('User not found');
    }

    bcrypt.compare(credentials.password, user.password, (err, bcryptResult) => {
        if(err) throw err;
        if(bcryptResult) {
            //include only relevant user fields
            const truncatedUserData = {
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            };
            const userToken = generateToken(truncatedUserData);
            return res.status(200).send({ token: userToken, userData: truncatedUserData });
        }
        return res.status(401).send({ password: 'Username or password was invalid' });
    });
});
```

This is a pretty standard POST request. After we verify that our request contains what we expect, we call bcrypt's asynchronous `compare`. If `compare` succeeds, we return certain user information, along with a JWT token. This token is what the user will use to verify that they are who they say they are.

Run our application, open up a rest client, and make a POST request to 'localhost:8001/api/signIn' with 'username' of 'tomjones' and 'password' of 'password'. You should receive a 200 OK with 'tomjones' token and information in the response.

### Security
Remember that plain-text passwords are not secure over HTTP. You must use *HTTPS* to secure your user's information in a POST request while they are in transit from client to server.

## Milestone 2: State Management with Redux
Now that our signIn API is in place, let's switch to our client-side code and create the code for our authentication flow. We'll start by setting up Redux and Redux-Form. Then we'll create a protected resource only authorized user's can access.

### Setting up the store
The bigger a React application gets, the harder it becomes to deal reason about state. It's definitely possible to write React applications by just using `React.setState` calls. However, the more code you write, the more difficult it becomes to share state between components. This is especially true if the components attempting to share state don't have a parent-child relationship.

There are quite a few libraries that allow you to manage state more efficiently. One of the most popular is **Redux**. Redux is a predictable state container for JavaScript apps based on **Flux**, an architecture for maintaining application state created by Facebook. Redux is based on 'functional programming', so it may be hard to reason about initially if you are unfamiliar with this paradigm. Redux is extremely powerful, but it comes at the cost of writing a bit of boilerplate code. There are libraries to help alleviate this problem, but we'll stick to using plain old Redux in this tutorial. Again, this is not a full-fledged Redux tutorial, so we won't be going too in-depth about all of its features. For a detailed Redux tutorial, checkout Egghead.io's [tutorial](https://egghead.io/courses/getting-started-with-redux) by Dan Abramov - the creator of the library.

### Quick Redux Overview
If you've never seen or heard of Redux, this is a quick summary of what it is, why we use it, and how it works:

#### What is Redux?
Redux is a globally accessible, predictable state container for JavaScript applications based on [functional programming](https://medium.com/javascript-scene/master-the-javascript-interview-what-is-functional-programming-7f218c68b3a0#.2quwdduyi) concepts.

#### Why use Redux?
For large-scale React (or plain old JavaScript) applications, state can quickly become murky and hard to manage when it's divided amongst many disconnected components. Redux avoids this by giving state a defined place to live, making it globally accessible, and giving it an element of predictability.

But isn't global bad? We've been trained to believe this since we wrote our first 'Hello, world' program. The whole idea of 'global === bad' stems mostly from difficulty of debugging. If it's global, anything can modify it, which makes it hard to trace what happened and what caused the change. Since Redux state is easily tracked and managed, it doesn't suffer from this drawback. Every action is traceable and every state modification is recorded (and can even be reversed!).

#### How does it work?
In Redux, there is a global state object (the 'store') in which we *store* our application's state. We never modify the store directly. Any time we need to modify the store, we dispatch an action with a type and some payload. The store uses reducers that we define (or import) that listen for specific actions and modify the store accordingly. The reducers should behave predictably because they are defined as pure functions, meaning our store and our application state should behave predictably as well.

### Redux
Let's install and setup Redux in our application.

```
npm install --save redux
npm install --save react-redux
```

These libraries are installed as regular 'dependency's because the browser needs them to manage application state. **React-Redux** is a library that includes useful bindings for more easily using Redux and React together. It's not necessary, but it makes development much nicer.

Let's set up the Redux store. Open up *src/Main.js*. Let's `import 'Provider' from 'react-redux';` and add it to our app. 'Provider' connects our React components to the Redux store. We'll only have to set it up here at the root component of our app. 'Provider' accepts a 'store' prop, which we will pass in from *index.js* much like we do for the `routes` prop. Your *Main.js* file should look like this now:

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

Now, let's create the store and pass it in to Provider. Open *index.js* and `import 'createStore' from 'redux';`. This is the library function we will use to create our store. It accepts a root reducer as a parameter. Since we haven't defined any reducers yet, let's simply define an empty function as a placeholder. While we're at it, let's clean the file up a bit by removing some duplication. Instead of us calling `document.getElementById('root')` multiple times in this file, let's replace it with `rootElement` constant we define at the top of the file.

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

Run `npm run start` and notice that we get no errors. We have a store set up now! Before we continue, we need a little bit more setup. In order to write clean, asynchronous actions in Redux, we will need middleware called 'Redux-Thunk'. We need asynchronous actions to make calls to our back-end. Check out this quick [tutorial](http://blog.nojaf.com/2015/12/06/redux-thunk/) for the reasoning behind thunk. To summarize, writing asynchronous actions while obeying the laws of 'pure functions' can get ugly. The 'redux-thunk' middleware makes it slightly less ugly. Easy-peasy.

Let's install and set it up:

```
npm install --save redux-thunk
```

Now, open up *src/index.js*. We'll need to `import { applyMiddleware } from 'redux';`, which tells the Redux store we'll be using some middleware that we'll pass in as parameters. We also need to `import thunk from 'redux-thunk';` - our thunk middleware. Finally, we'll need to tell the store we're actually using the middleware. Our *src/index.js* should now look like this:

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

Now, we have our Redux and our middleware set up. Let's actually do some cool stuff!

### Actions, Reducers, and State Shape
Now that we have a store and middleware set up, we need our store to do something useful. What do we want our store to keep track of?

Let's think about the website we want to create to demonstrate our framework's features. At minimum, we'd like the following capabilities:

* Register
* Sign-in
* Sign-out
* Edit profile

These are pretty standard features for any website. These features are essentially 'actions' that a user can perform by clicking a button or submitting a form. These will match with the API calls we can make to the server. What is a user? We defined our user in the Express.js backend code we created!

```
{
    user: { username, email, firstName, lastName, role }
}
```

Our users will interact with the backend via forms. How do forms fit in the Redux ecosystem?

Let's step back and ask ourselves: When is it right to store state in Redux? When should we use `Component.setState()`? Can we use both? When creating components, we should ask ourselves if other parts of the application need access to the component's state? Will other parts of the application affect the state of this component? Will the state of the component need to be kept after the it's unmounted from the DOM? If the answer to these questions is no, we can get away with just using `Component.setState()` for component-level state.

However, this isn't set in stone. There are many reasons for keeping all of your state in Redux. However, the flip-side isn't true at all. You shouldn't store all of your state in your component's. That's the whole reason we're using Redux in the first place. The general rule is to just go with what's easiest to understand and takes the least amount of code. If you find you can keep the whole app state in Redux in a clean manner, then go for it. In this tutorial, we'll use **Redux-Form** to manage our form state, so naturally it will be kept in Redux. We will use `Component.setState()` where it makes sense. This will become clear with experience.

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
    email: null,
    role: 'GUEST'
};
```
A default user should have no id, firstName, lastName, userName, or email. They should also have a role of 'GUEST', signifying they are not signed in.

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
                        dispatch(setUserData({
                            id: 1,
                            firstName: 'Tom',
                            lastName: 'Jones',
                            username: 'tomjones',
                            email: 'tomjones@gmail.com',
                            role: 'MEMBER'
                        }));
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

Also notice that we have a placeholder div that contains the words 'Loading gif' that show when `isFetching` is true. When we update our application with CSS, we'll replace with something nicer.

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
                {user.role === 'MEMBER' && <p>Welcome, {user.username}</p>}
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

If the user has a role of 'MEMBER', they should be signed in currently (otherwise, they would still be a 'GUEST'). If they're a 'MEMBER', we will display their username on the homepage. Easy! Note that this is not a completely fool-proof method of verifying a user is who they say they are. A malicious user could still manipulate the role they are because all of this is being stored and rendered client-side! In a later tutorial, we will add user tokens and server-side authentication so that a malicious user can access and modify only what their token allows them to.

### Configuration updates
Notice that we've added quite a few libraries as 'dependency's. We'll need to add them to *webpack.base.config.js* so that they are correctly bundled with the other vendor code. Let's add Redux, React-Redux, and Redux-Thunk to our *vendor* bundle. If we don't add them, they will get bundled with the application code, and our caching becomes less efficient!

```
    entry: {
        vendor: ['react', 'react-dom', 'react-router', 'redux', 'react-redux', 'redux-thunk']
    },
    ...
```

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
