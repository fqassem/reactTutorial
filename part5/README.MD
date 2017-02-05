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
            } else {
                return res.sendStatus(401).send('User not found');
            }
        }
    });
});
```

Now that the APIs are in place, let's add them to our *src/services/AuthenticationService.js* so we can call them from code easily! We'll also add a 'removeToken' method to be called on sign out.

```
static register(userInfo) {
    return fetch(`${API_ENDPOINT}/signIn`, {
        method: 'POST',
        body: `userInfo=${userInfo}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

static editProfile(userInfo, token) {
    return fetch(`${API_ENDPOINT}/signIn`, {
        method: 'POST',
        body: `userInfo=${userInfo}&token=${token}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
}

static removeToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}
```

Now that our let's create the Redux actions that call these APIs!

## Milestone 2: Register, Edit Profile, and Sign-Out actions
In the same way we created the Sign In action, let's also create the other actions our user can perform. In *src/state/user/index.js*, let's add these actions one-by-one.

### Register
Not a lot happens during registration. We simply call the 'register' API and handle any errors that might come back from the backend. If we receive a 200, we know our registration was successful. There isn't any explicit state modification being done here, only a call to the backend. If it fails, we throw an error so that Redux Form can display something went wrong.

```
export const register = (userInfo) => {
    return AuthenticationService.register(userInfo)
    .then((response) => {
        if(response.ok) {
            console.log('Successful Registration');
        } else {
            throw new SubmissionError({ _error: 'Registration Error' });
        }
    });
};
```

### Edit Profile
When the user requests to edit their profile, we'll need to call the backend with the changes they wish to make. We'll also need to update the user's profile information stored in Redux so we keep the state up-to-date.

```
```

### Sign Out
On sign-out, we'll need to reset the user data so that it's no longer stored in Redux. We should also call the 'removeToken' API we defined in *AuthenticationService* so the user token is no longer stored client-side.

```
```

That completes the state management code. Now, let's create the forms that call these actions and allow the user to register, edit their profile, and sign out!

##Milestone 3: Registration and Edit Profile Forms
Let's start by creating the register form. It'll be similar in structure to the *src/forms/SignInForm.js* that we created earlier, but with a few more fields.

```
```

##Milestone 4: Sign-Out Link and Protected Routes
