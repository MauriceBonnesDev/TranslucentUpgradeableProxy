# TranslucentUpgradeableProxy

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Accounts

- Account #0:
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

- Account #1:
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

- Account #2:
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (10000 ETH)
  Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

- Account #3:
  0x90F79bf6EB2c4f870365E785982E1f101E93b906 (10000 ETH)
  Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

- Account #4:
  0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 (10000 ETH)
  Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

## Setup

Account 0 is always the owner (able to upgrade the implementation contract)
Other accounts are able to interact with the implementation contracts through the proxy
On first interaction with a new version, the account has to provide an EIP712 signature
to acknowledge the upgrade, instead of blindly interacting with a different smart contract.
