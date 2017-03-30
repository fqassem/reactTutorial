# Part 6: Styled Components, Navbar, and Grids
In this section of the tutorial, we're going to add some styling to our application. [Styled-Components](https://github.com/styled-components/styled-components) is a very popular library used for easily creating React components styled with CSS. Once we install Styled-Components, we'll use it to update our Navigation Bar. Finally, we'll talk about grids and how useful it is to use one in our application.

## Let's talk about CSS, baby
There are  many solutions for dealing with styles in React Application. At the very bottom of the complexity totem pole is the 'write plain CSS' method. This is definitely a valid way to create styles, but it's a bit 'Flintstones' in this era of front-end development.

So, what's wrong with CSS? By its very nature, CSS is global. It *cascades*, allowing elements to inherit and override. Within the realm of a React application, this is **bad**. React, after all, is a component-based library. If our components are inheriting some style from God-knows-where in our codebase, then our components aren't truly reusable. Components should be self-contained and modular. Therefore, depending on the 'global' nature of CSS is a recipe for trouble.

What do we lose from going away from the global, cascading nature of CSS? Not much. The only thing we really lose from making our styles local (instead of global) is more control over the cascade and easier-to-understand CSS hierarchies. Pushing aside the global aspect of CSS makes styling easier to reason about. That's not to say the all types of cascading are bad. We still want to be able to 'cascade' styles, but in a controlled manner - not an avalanche. That way we don't have to go fishing for some style hidden away in our code base that's overriding a style in our current component. If we make the cascade *explicit*, then we can control exactly what styles our component is using. That way we have modular, reusable components with explict styling!

[CSS-Modules](https://github.com/css-modules/css-modules) is one of the first attempts to componentize and localize CSS. CSS-Modules can be considered a 'design philosophy' for CSS. Webpack's [CSS-Loader](https://github.com/webpack-contrib/css-loader) contains a CSS-Modules implementation that you can enable by setting a flag within your configuration. Now, you can write locally scoped, modularized CSS (or SASS or LESS).

While CSS-Modules solves the scoping problem, there's another problem we haven't yet solved: how do I associate styles with a component?

Since JSX allows you to write what is essentially HTML inside your React components, you can specify *id*s and *class*es for your components. You'll just need to import your CSS file and you can use the styles specified therein. This is a completely valid approach, and it's definitely one of the most common approaches. However, this means your CSS and your component are not **colocated**. If you're ok with (or even *prefer*) having your CSS live in a separate file, then CSS modules would be a great choice. Colocation may not seem like a huge deal, but it's a big time saver when creating a component. If you choose to go with the 'old-school' method, you still have the problem of manually associating styles with a component. While that's a valid and common approach, there's a more modern way to do this. We'll get to that, but let's first look at the libraries that try to solve the colocation problem:

[Aphrodite](https://github.com/Khan/aphrodite), [JSS](https://github.com/cssinjs/jss), and [Radium](https://github.com/FormidableLabs/radium) allow you to specify your styles within the React component's JavaScript file by writing your CSS in JavaScript. That removes the need for importing another CSS file and having to reference it constantly to figure out what styles your component needs. However, these libraries are a bit ugly. Because effectively require you to write CSS in JavaScript, you aren't writing in CSS anymore. You also lose the luxury of copy and pasting from StackOverflow :) Here's an example of using the Radium library to style a component:

```
import radium from 'radium';

const styles = {
  container: {
    margin: '0 auto',
    width: '100%',
    '@media screen and (min-width: 360px)': {
      maxWidth: '400px',
    },
    '@media screen and (min-width: 600px)': {
      maxWidth: '600px',
    },
  },
};

const App = () => (
  <div style={styles.container}>
    <Tweet data={data} />
  </div>
);

export default radium(App);
```

Notice how styles are being defined in a JavaScript object. While that's ok, it makes development a bit more difficult because you have to follow an almost unnatural way of writing CSS. You still have to manually associate the style to an HTML tag. While that's par for the course now-a-days, it does feel a bit old-school. Lucky for us, there's an even better solution: Styled-Components!

Styled-Components makes life easy by allowing you to write pure CSS and create a React component out of it without having to worry about how to map the CSS to the JavaScript. It also solves the scoping problem by locally scoping CSS. Here's an example:

```
import styled from 'styled-components';

const Container = styled.div`
  margin: 0 auto;
  width: 100%;

  @media screen and (min-width: 360px) {
    max-width: 400px;
  }

  @media screen and (min-width: 600px) {
    max-width: 600px;
  }
`;

const App = () => (
  <Container>
    <Tweet data={data} />
  </Container>
);
```

Notice how we're writing *real* CSS within the confines of a template string. *Container* in the code above, without any further intervention on our part, styles a div using plain old CSS and creates a stateless React component out of it. It's a simpler and cleaner way to create styled components in a React application. For a more detailed comparison, check out this [link](https://github.com/styled-components/comparison).

Using Styled-Components, you can inherit styles from other components, create themes, write media queries and use pseudo-selectors, and even read props to conditionally apply styles!

## Creating our Nav Bar
Let's use Styled-Components to create our Navbar! First, we'll need to install it:

```
npm install --save styled-components
```

No build configuration is necessary. We can get started immediately!

Inside of your *src* folder, create a *components* folder. This folder will contain our styled components. Create a *Nav* folder and, inside it, an *index.js* file:

```
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router';

const NavWrapper = styled.nav`
  font-weight: bold;
`;

const NavList = styled.ul`
  list-style: none;
  padding-right: 25px;
`;

const NavListElement = styled.li`
  display: inline-block;
  padding-right: 10px;
`;

const NavLink = styled(Link)`
  color: green;
`;

const Nav = ({ role, signOut }) => (
    <NavWrapper>
      <NavList>
        <NavListElement><NavLink to="/">Home</NavLink></NavListElement>
        { !role && <NavListElement><NavLink to="/signIn">Sign In</NavLink></NavListElement> }
        { !role && <NavListElement><NavLink to="/register">Register</NavLink></NavListElement> }
        { role && <NavListElement><NavLink to="/editProfile">Edit Profile</NavLink></NavListElement> }
        { role && <NavListElement><button onClick={signOut}>Sign Out</button></NavListElement> }
      </NavList>
    </NavWrapper>
);

Nav.propTypes = {
    role: React.PropTypes.string.isRequired,
    signOut: React.PropTypes.func
};

export default Nav;
```

This is our Navigation container that contains the links to display to the user. We're using Styled-Components to create the styling of our Nav component. We're even inheriting the 'Link' component from 'react-router' and adding a color to it, all within Styled-Components!

If you open *src/pages/Container.js*, you'll see that the Nav we just defined looks an awful lot like the navbar that's currently in the application. Let's remove the hardcoded navigation that's currently in the container and use the Nav component we just created:

```
import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import Nav from '../components/Nav';
import { clearUserData } from '../state/user';
import AuthenticationService from '../services/AuthenticationService';

class Container extends React.Component {
    render() {
        const { user, signOut } = this.props;
        return (
            <div>
                <Nav role={user.role} signOut={signOut}/>
                {this.props.children}
            </div>
        );
    }
}
Container.propTypes = {
    children: React.PropTypes.node,
    user: React.PropTypes.object,
    signOut: React.PropTypes.func
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

Now, if you run the application, you'll notice that the Nav-bar has now turned green, just like we specified in our Nav component. You can see how we're able to build modularized, reusable components quickly and easily using Styled-Components. We can re-write whole parts of our app to use reusable components: forms, navigation, buttons, headers - anything at all!

## Grids
Grids are immensely useful for creating a responsive, mobile-friendly, and easy-to-understand website layout. One of the easiest solutions to add a 'grid' to your application using Styled-Components is by simply using Flexbox. Flexbox is an easy to use, simple way to create a predictable layout for your website. By defining how you want a component to behave

If you so desired, you could even use a grid system like the ones provided by Bootstrap or Pure CSS while using Styled-Components. There's nothing preventing you from using 'className' or ids when using Styled-Components, so you have that option. However, this clutters up the JSX. It's definitely a viable option, but Flexbox is the easiest, cleanest way to create a responsive site.

Sadly, on older Webkit browsers and IE11, Flexbox is not fully supported. There are polyfills, but there not endorsed by any browser manufacturer and a lot of them aren't well maintained. We'll need something other than Flexbox to support old browsers.

[Grid-Styled](https://github.com/jxnblk/grid-styled) is a grid library built using Styled-Components that is dirt simple and doesn't use Flexbox. It's very useful for most cases. Our application is too simplistic to benefit from a Grid system. We could get away with just using `margin: 0 auto` to center our forms. Check out the [Grid-Styled demo](http://jxnblk.com/grid-styled/) for a cool example of it working on a webpage.

## Recap
Styled-Components is a superior way to create reusable, styled React components. Using Flexbox, Grid-Styled, or another grid system will help you create a responsive layout for your application.
