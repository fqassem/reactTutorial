#Part 5: Navbar, Registration, Sign-out, and Protected Routes
Now that we have an application with very minimum functionality, let's add some more features! We've already given the user the ability to sign-in with any username and password they choose to. Let's make this a bit more realistic by having the user register for an account and using that account to sign-in. Also, let's give the user the ability to sign out too! That way, we won't need to refresh the app if we want to start over. Let's also create a protected route, something only a signed-in user can access. We demonstrated something similar in concept the last part of the tutorial. Now, instead of simply showing something on the page if the user is signed-in, we'll use React-Router to protect a whole page from unauthorized access!

Before we do any of that, let's first modify our navbar to be 'responsive'. If we are signed-in, we probably don't want the navbar to show a sign-in link. That wouldn't serve much purpose. So let's customize the navbar to show different items based on the user's role! Let's get started!

#Milestone 1: Navbar
So far, our navbar has been a simply unordered list that lives inside of *Container.js*. While this is a great place for it to exist, it's going to become bigger and more complicated. It probably makes more sense for it to live as a separate component that gets used by *Container.js* instead. Create a *components* folder in the root of our app. Next, within this folder, create a *Navbar.js* file that will contain our nav-bar component. The render function should basically be copied and pasted from the nav-bar code in *Container.js*:

```
import React from 'react';
import { Link } from 'react-router';

class Navbar extends React.Component {
    render() {
        return (
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/signIn">Sign In</Link></li>
                </ul>
            </nav>
        );
    }
}
export default Navbar;
```

Now, let's simply replace the navbar logic we had in *Container.js* with this component:

```
...
    render() {
        return (
            <div>
                <Navbar/>
                {this.props.children}
            </div>
        );
    }
...
```

If you run the application, you'll see that nothing's changed! Great, just what we want! Now, let's make some changes to our navbar. Let's have it accept a user role via props. If the user has a role of 'GUEST', let's show a 'Home', 'Sign In', and 'Register' link. If the user is a 'MEMBER', let's show a 'Home' and 'Sign Out' link. Let's add a `createRoleBasedNavbar` function that accepts a role and returns a list to the render function with the proper nav links.

```
mport React from 'react';
import { Link } from 'react-router';

import { GUEST, MEMBER } from '../constants/Roles';

class Navbar extends React.Component {
    createRoleBasedNavbar = (role) => {
        const { onSignOut } = this.props;
        switch(role) {
            case MEMBER:
                return (
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link onClick={() => onSignOut()}>Sign Out</Link></li>
                    </ul>
                );
            case GUEST:
            default:
                return (
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/register">Register</Link></li>
                        <li><Link to="/signIn">Sign In</Link></li>
                    </ul>
                );
        }
    }

    render() {
        const { role } = this.props;
        return (
            <nav>
                { this.createRoleBasedNavbar(role)}
            </nav>
        );
    }
}
Navbar.propTypes = {
    role: React.PropTypes.string.isRequired,
    onSignOut: React.PropTypes.func.isRequired
};
export default Navbar;
```

The 'register' link doesn't do anything yet! It tries to load a 'register' route, but we haven't yet defined it in our application. When we create the *Register* page and add it to *routes.js*, it should work without us changing anything!

Notice that, along with the role, we also pass in `onSignOut`. This allows us more flexibility in defining what we want to happen when the user signs out. In the future, we'll use it to dispatch a signOut action that reroutes the user to the Home page upon completion. Note that we could even define a 'signOut' route that the user can follow, which shows them a spinner or even a 'Please wait...' page like Gmail. Anything's possible!

While we're at it, let's also create a *constants* folder in the root of the app to hold these user roles so we don't accidentally mistype one of them. In the *constants* folder, create a *Roles.js* file:

```
const GUEST = 'GUEST';
const MEMBER = 'MEMBER';
```

We've already included this in our *Navbar.js* code, so we're good to go! Finally, let's tell our Navbar what the current user's role in by connecting *Container.js* to Redux and passing the role in to *Navbar* via props:

```
import React from 'react';
import { connect } from 'react-redux';

import Navbar from '../components/Navbar';

class Container extends React.Component {
    render() {
        const { userRole } = this.props;
        return (
            <div>
                <Navbar role={userRole} onSignOut={() => alert('signing out')}/>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.node,
    userRole: React.PropTypes.string.isRequired
};
const mapStateToProps = (state) => {
    return {
        userRole: state.user.role
    };
};
export default connect(mapStateToProps)(Container);
```

Note that, for now, we simply alert the user with a placeholder 'signing out' message. When we create the signOut functionality, we'll come back and replace our placeholder alert message! For now, it seems our navbar is finished.

## Milestone 2: Registration, Sign-out, and Protected Routes
