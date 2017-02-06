# Part 5: Protected Routes, Register, Sign-out, and Edit Profile
In the last part, we added Redux to our application to manage state. We also added an Express.js API backend proxied through our development server. We also added Redux-Form to make creating and managing forms easy.

In this part, we will expand on our authentication flow by creating the APIs, actions, pages, and forms for the registration, sign-out, and 'edit profile' features. We will also protect certain application routes using React-Router so only logged in users can access them.

While we don't add much to our framework in this section, we expand on our application's functionality.

## Milestone 1: Register, Sign-out, and Edit Profile APIs
In the last part, we added the sign-in API. In this tutorial section, we will do the same for the rest of our auth flow APIs, starting with register.

### Register
In *server/apiServer.js*, let's add the register API:

```
router.post('/register', urlencodedParser, (req, res) => {
    const userInfo = req.body;

    if(!userInfo) {
        return res.sendStatus(400).send('User info not supplied');
    }

    if(!userInfo.username || !userInfo.password || !userInfo.firstName || !userInfo.lastName || !userInfo.email) {
        return res.status(400).send('Missing required field');
    }

    if(userInfo.password.length < 5) {
        return res.status(400).send('Password is less than 5 characters long');
    }

    const user = users[userInfo.username];
    if(user) {
        return res.status(400).send('User already exists!');
    }

    bcrypt.hash(userInfo.password, 10, (err, hashedPassword) => {
        if(err) throw err;
        if(hashedPassword) {
            users[userInfo.username] = {
                username: userInfo.username,
                password: hashedPassword,
                email: userInfo.email,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                role: 'USER'
            };
            return res.status(200).send();
        }
        return res.status(400).send();
    });
});
```
We enforce that a user's username must be unique since that's they key of our 'users' map. We check if the info we care about exists and if the password is more than 5 characters. There are many more checks we should do here to verify the data is what we expect, but we'll leave that as an exercise for you to do. If the checks for the registration data pass, we hash the user's password and add them to our 'users' map! Open up a DHC client and register some users! Remember, since our data is stored in the server's RAM, any time we restart the server, our registered users will be lost!

### Sign-Out
Sign-out with token-based authentication is a bit interesting. There are a few ways to do it, each with a certain level of complexity. The simplest way is to just delete the token on the client. Though this is the simplest way, it can cause security issues if the client becomes compromised and the token gets stolen. This is mostly (but not fully) mitigated by setting a short expiration time for our tokens and refreshing them when necessary. In our app, we're using very simple JWTs to get the concept across, so that's out of scope of this tutorial. There are standards that define a way to refresh tokens, like [OAuth](https://oauth.net/2/), but we won't go in-depth here.

A second approach is to blacklist tokens for signed-out users. When the user signs out, they pass in their token to a 'signOut' REST call, and, on the server, we add it to a 'black-list'. Because our tokens have an expiry time, we can create a simple process to clear out expired tokens from the black list to prevent it from getting too large.

You can read more about the process [here](https://auth0.com/blog/blacklist-json-web-token-api-keys/) and [here](https://dadario.com.br/revoking-json-web-tokens/). There are some who don't think revoking token is worth the extra [complexity](https://www.dinochiesa.net/?p=1388). For our app, we'll keep things simple and just remove the token on the client-side, so we won't create an actual API for it. However, be aware of the options and their pros and cons.

### Edit Profile
The 'Edit Profile' call will look like a simplified version of our `register` call. We will accept multiple fields in the 'editProfile' API along with the users's token. We will validate the token is valid so we're sure the user attempting to edit their profile is who they say they are. We'll allow the user to change their firstName, lastName, and email address. The code for this API is as follows:

```
router.post('/editProfile', urlencodedParser, (req, res) => {
    const profileInfo = req.body;
    const token = profileInfo.token;

    //validate token

    if(!token || !profileInfo) {
        return res.sendStatus(400).send('Profile info or token not supplied');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if(err) {
            return res.sendStatus(401).send('Invalid token');
        } else {
            const currentUsername = decoded.username;
            const user = users[currentUsername];
            if(user) {
                const { firstName, lastName, email } = profileInfo;
                if(firstName) {
                    user.firstName = firstName;
                }
                if(lastName) {
                    user.lastName = lastName;
                }
                if(email) {
                    user.email = email;
                }
                return res.sendStatus(200);

            }
            return res.sendStatus(401).send('User not found');
        }
    });
});
```

Now that the APIs are in place, let's add them to our *src/services/AuthenticationService.js* so we can call them from code easily! We'll also add a `removeToken` method to be called on sign out and a `getToken` convenience method.

```
static register(userInfo) {
    return fetch(`${API_ENDPOINT}register`, {
        method: 'POST',
        body: `userInfo=${userInfo}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

static editProfile(userInfo) {
    const token = AuthenticationService.getToken();
    return fetch(`${API_ENDPOINT}editProfile`, {
        method: 'POST',
        body: `userInfo=${userInfo}&token=${token}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

static getToken() {
    return AuthenticationService.token;
}

static removeToken() {
    AuthenticationService.token = null;
}
```

Now  let's create the Redux actions that call these APIs!

## Milestone 2: Register, Edit Profile, and Sign-Out actions
In the same way we created the Sign In action, let's also create the other actions our user can perform. In *src/state/user/index.js*, let's add these actions one-by-one.

### Register
Not a lot happens during registration. We simply call the 'register' API and handle any errors that might come back from the backend. If we receive a 200, we know our registration was successful. In the SignIn page, we listen for props to know when the user sign-in was successful and we forward the user to the home page. To demonstrate another way of redirecting the user, we will forward the user to the Sign-in page based on the result of the API call directly in the action. If you wanted, you could make this more generic by passing in a redirect url instead of hardcoding a URL. You can see how this can be useful if you want to redirect a user based on their previous location.

There isn't any explicit state modification being done here, only a call to the backend. If it fails, we throw an error so that Redux Form can display something went wrong.

```
import { browserHistory } from 'react-router';
...

export const register = (userInfo) => {
    return AuthenticationService.register(userInfo)
    .then((response) => {
        if(response.ok) {
            browserHistory.push('/signIn');
        } else {
            throw new SubmissionError({ _error: 'Registration Failed' });
        }
    });
};
```

### Edit Profile
When the user requests to edit their profile, we'll need to call the backend with the changes they wish to make. We'll also need to update the user's profile information stored in Redux so we keep the state up-to-date.

```
```

### Sign Out
On sign-out, we'll need to reset the user data so that it's no longer stored in Redux. It's possible to do this by dispatching a SET_USER_DATA action with InitialUserState. Instead, let's create a CLEAR_USER_STATE action that explicitly does this. Note that we're not making a server call to clear any user tokens, so this is not an async action, but a plain Redux action. We'll need to add a constant, action creator, and add to the reducer:

```
export const CLEAR_USER_DATA = 'SIGN_OUT';
...

export const clearUserData = () => {
    return { type: CLEAR_USER_DATA };
};

...

export default (state = InitialUserState, action) => {
    switch(action.type) {
        case SET_USER_DATA: {
            const userData = action.userData;
            return { ...state, ...userData };
        }
        case CLEAR_USER_DATA: {
            return InitialUserState;
        }
        default:
            return state;
    }
};
```

That completes the state management code. Now, let's create the forms that call these actions and allow the user to register, edit their profile, and sign out!

##Milestone 3: Registration and Edit Profile Forms and Pages
Let's start by creating the register form. It'll be similar in structure to the *src/forms/SignInForm.js* that we created earlier, but with a few more fields.

```
```

Now the form is created, let's add create the *src/pages/Register.js* page that contains the form.

```
```

That completes the Registration flow. Now let's add the Edit Profile Flow. Let's add an *src/forms/EditProfileForm.js* to our application:

```
```

and the *src/pages/EditProfile.js* page:

```
```

That's all the hard work done. Now, we have just one small thing left to do: add these pages to our *src/pages/routes.js* file. First, add the Register and EditProfile pages in the `if development` block so hot reloading works:

```
if(process.env.NODE_ENV === 'development' && module.hot) {
    ...
    require('./Register');
    require('./EditProfile');
}
```
and also to the child routes array so that our app associates the the page with its respective route:
```
childRoutes: [
    {
        path: 'register',
        getComponent(location, cb) {
            System.import('./Register')
            .then(loadRoute(cb, false))
            .catch(errorLoading);
        }
    },
    {
        path: 'editProfile',
        getComponent(location, cb) {
            System.import('./editProfile')
            .then(loadRoute(cb, false))
            .catch(errorLoading);
        }
    }
    ...
```

And that should do it! We've just added Registration and Edit Profile flows to our application.

## Milestone 4: Sign-Out Link and Protected Routes
You may be asking - what about sign-out?! We'll add the sign-out now! Let's open our *src/pages/Container.js* component. We will want to add a button for sign-out whenever a user is connected. We'll need to connect it to the Redux store using `connect` from React-Redux. When the user clicks 'Sign Out', we'll call the 'CLEAR_USER_DATA' action we created. We'll also clear the user token and redirect the user to the home page. After all of this, the Container looks like this:

```
import React from 'react';
import { Link, browserHistory } from 'react-router';
import { connect } from 'react-redux';

import { clearUserData } from '../state/user';
import AuthenticationService from '../services/AuthenticationService';

class Container extends React.Component {
    render() {
        const { user } = this.props;
        return (
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        { !user.role && <li><Link to="/signIn">Sign In</Link></li> }
                        { !user.role && <li><Link to="/register">Register</Link></li> }
                        { user && user.role && <li><button onClick={this.props.signOut}>Sign Out</button></li> }
                    </ul>
                </nav>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.node,
    user: React.PropTypes.object,
    signOut: React.PropTypes.function
};
const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};
const mapDispatchToProps = (dispatch) => {
    return {
        signOut: () => {
            dispatch(clearUserData({}));
            AuthenticationService.removeToken();
            browserHistory.push('/');
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Container);
```

Finally, we'll protect the Edit Profile page from being accessed by unauthenticated users. If you try to access it now, you'll be able to go to the Edit Profile page and see the edit profile form. We'll need to restrict this page from being accessed by unauthorized users.

Remember, our routing is on the client side. That means the user can basically access any page they want to by modifying the JavaScript. The important part is that a malicious user won't be able to change user data on the server side because we've protected our 'editProfile' API with a token. **Any protected data *must* come from the server and *must* be protected by some sort of authentication.**

As you can see, 'protecting' a route is essentially a gentleman's agreement. However, it's worth doing because it improves the user experience and prevents inadvertent page navigation. We can protect routes two ways: through React or through React-Router. In a small application, doing it through React is fine. However, in a larger application where the 'is signed in' logic is reused on multiple pages, React-Router allows you to reuse the logic. Let's examine these options:

1. Using React, we can check to see if the user is logged-in like we do for the conditional rendering logic in the *SignIn.js* and *Container* pages. Before the component mounts, we can check the user's state (using `componentWillMount`). If they're not logged in, we'll redirect the user to some page. If they are, then we let the page component mount as normal.
2. In React-Router, we have two options. We can define an 'onEnter' callback that can be defined on routes. When a route is requested, the onEnter callback is fired, and does some checks. If those checks don't pass, we can 'replace' the route with a fallback route, signifying the user is not authorized. [Here's](https://github.com/ReactTraining/react-router/tree/master/examples/auth-flow) an example of an app that does this.

We can also do this by wrapping routes that need authentication a component like in this [example](https://medium.com/the-many/adding-login-and-authentication-sections-to-your-react-or-react-native-app-7767fd251bd1#.pyfrxelql).

To fix this in our application, let's add an 'onEnter' check to our Edit Profile route. How can we check if the user is logged? Our AuthenticationService is outside the scope of Redux. It's not a component we can connect to Redux. Lucky for us, we can simply check if a token is set for the user. If it's not, then we know the user is logged out.

We can also fix this by using the **Reselect** library, which allows us access to this data from anywhere by calling a 'selector' function. A selector simply returns computed information from the store. We can always export the store from where we create it as well.

We'll go the simpler route, but it's nice to know that there's another option.

In our *AuthenticationService*, let's add an `isLoggedIn` function:

```
static isLoggedIn() {
    return AuthenticationService.token !== null;
}
```

Next, in *routes.js*, let's `import AuthenticationService from '../services/AuthenticationService';`. Next, we'll create the `onEnter` callback function that will be called when the 'editProfile' route is accessed:

```
function isUserAuthenticated(nextState, replace) {
    if(!AuthenticationService.isLoggedIn()) {
        replace('/');
    }
}
```

Finally, let's add this callback to the 'editProfile' route:

```
...
{
    path: 'editProfile',
    onEnter: isUserAuthenticated,
    getComponent(location, cb) {
        System.import('./EditProfile')
        .then(loadRoute(cb, false))
        .catch(errorLoading);
    }
},
```

Now, if you go to `localhost:8001/editProfile` when you're logged out, you will be redirected to the login page!
