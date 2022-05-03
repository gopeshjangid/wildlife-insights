# Wildlife Insights

All around the world, people are setting up camera traps to capture pictures of wildlife. Some of these images get shared and put on the web for other people to use. But loads just stay in people's computers. All this information about how many species live on the planet, where they are, and how that changes over time, could be so useful for the global conservation community, but we don't make the most of the images we have.

So Imagine **a platform that allows anyone in the world to quickly identify (using artificial intelligence)** what's in each photo much faster and more easily than anything else. And then does all the hard work so that other people can see the images and the data derived from those images, and use them to make decisions about how to save the species.

That's our job.

---

Production site: [https://app.wildlifeinsights.org](https://app.wildlifeinsights.org)

Staging site: [https://staging.app.wildlifeinsights.org](https://staging.app.wildlifeinsights.org)

## Installation

Use the package manager [yarn](https://yarnpkg.com/en/) to install it.

```bash
yarn install
```

## Usage

Duplicate `.env.default` and rename to `.env`. Or just create a new one with next variables:

```bash
API_URL=https://staging.api.wildlifeinsights.org
ANALYSIS_URL=https://analytics.wildlifeinsights.org
GOOGLE_ANALYTICS='x-xxxxxxxxx'
SECRET_KEY=secret
TRANSIFEX_API_KEY=<API_KEY>
GOOGLE_MAPS_API_KEY=<API_KEY>
GOOGLE_RECAPTCHA_KEY=<CAPTCHA_KEY>
BACKEND_API_URL=<BACKEND_API_URL>
```

Start server for development:

```bash
yarn dev
```

Start server for production environment (you need to build it first with `yarn build`):

```bash
yarn start
```

## Contributing

Before contributing, make sure you have the following tools installed. They help us maintain the quality of the project.

- [Prettier](https://prettier.io/): it formats the code automatically for you and help us maintain consistency
- [EditorConfig](https://editorconfig.org/): it sets the default indentation and a few other styles
- [Eslint](https://eslint.org/): it lints your code and checks for basic errors

All of these tools can and should be installed in your text editor so you get the most of them.

In addition, if you use [Visual Studio Code](https://code.visualstudio.com/) as your text editor, it will also lint your code using the Typescript linter. This project doesn't use Typescript, but the linter can give you valuable information about some type issues.

## Tests

Some parts of the application are covered by unit tests written with [Jest](https://jestjs.io/). We write unit tests mainly to prevent the regression of bugs, but feel free to write tests for any new code.

To run the existing tests, execute `yarn test`.

## Deployment

We are using a continuous integration tool called **Jenkins**.

Production server: [http://jenkins.wildlifeinsights.org](http://jenkins.wildlifeinsights.org)

Staging server: [http://staging.jenkins.wildlifeinsights.org](http://staging.jenkins.wildlifeinsights.org)

## Documentation

You can find documentation about this app on the project's main repository: [Wildlife Insights](https://github.com/ConservationInternational/WildlifeInsights/blob/master/front-end/).

## License

[MIT](https://choosealicense.com/licenses/mit/)
