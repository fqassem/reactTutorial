# Part 2: ESLint, Routing, Hot-Loading, and State Management
Now that we have a good basic framework for writing applications, let's add on to it. In this part, we will be adding:

* ESLint, for enforcing code-style and catching bugs
* Routing using React-Router
* Hot-Loading for faster development
* State Management using Redux

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

This tells Webpack to run our '.js' files in the /src/ folder through ESLint before the other loaders are run (using 'enforce: pre'). Note that this differs a bit from Webpack 1 syntax where ‘preloaders’ was a separate section entirely.

Now, let's run `npm run start`. Notice that our build complains about 'No ESLint configuration found.'. This is because ESLint looks for a configuration named *.eslintrc*, which we haven't defined yet. Let's create one now:

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

This tells ESLint that global ‘browser’ variables should not raise red flags. In `"parserOptions"`, we are telling ESLint that we will be using ES6 and ES6 modules (source files that use ‘import’ and ‘export’) and that we will use JSX. Because we are using ES6 modules and ES6 modules are in strict mode by default, we set `"impliedStrict"` to true so that any "use strict" declarations in our code are caught.

Finally let’s set up ESLint to run automatically on our files within our environment. Pick the environment you're using and follow the instructions to install the ESLint plugin:

* [IntelliJ](https://plugins.jetbrains.com/plugin/7494)
* [Atom](https://atom.io/packages/eslint)

Now that we have ESLint running in our IDE, let's add some style rules. This section is optional, but it's useful if you want to use some industry standard ES6/React coding guidelines up-front. Airbnb has published a very widely used ESLint configuration file for all to use. To install this configuration, run the following commands to install the configuration and its dependencies:

```
npm install --save-dev eslint-config-airbnb eslint-plugin-jsx-a11y@2.2.3 eslint-plugin-react eslint-plugin-import
```

Now, add `"extends": "airbnb"` to your config. This tells ESLint we want to use the AirBnb code style config we just installed.

You might end up with errors if you save your *.eslintrc* file and run `npm run start`. Depending on how you want your code style, you can turn off, turn on, or modify certain rules in *.eslintrc*. For a good explanation of how this works, visit [here](http://eslint.org/docs/user-guide/configuring#configuring-rules). I've added and modified the following rules in my *.eslintrc* file to fit my code style:

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
