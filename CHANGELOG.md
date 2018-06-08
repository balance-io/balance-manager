# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/)

## [Unreleased]

### Added

* Incoming and outgoing pending transactions for Shapeshift
* Versioning for local storage
* Bookmark Reminder (anti-phishing) Ribbon
* Exchange button and modal
* Shapeshift endpoints
* Account Type component for displaying active wallet logo
* Link to Ledger support page on Ledger connection page
* Ledger affiliate link to wallet selection screen
* Donate ETH button and modal
* Input fetching animation

### Changed

* Fix txn fee conversion
* Layout padding definition locations
* Fix mobile layout on the wallet selection screen (#232)
* DrodpownAsset improved logic
* Refactor Send and Exchange modals/reducers for consistency
* Fix unit time references
* Moved missing language strings
* Fix overflow padding for dropdowns

### Removed

* Account interactions tab

## [0.5.3](https://github.com/balance-io/balance-manager/releases/tag/0.5.3)

### Added

* Add prettier and pre-commit rules

### Changed

* Refactor time and bignumber helper functions
* Fix network change not updating
* Fix failed transactions display
* Update Github PR and Issue templates
* More consistent api handlers
* Fix pending transaction never confirmed (#163)
* Fix lastTxHash incorrect because of pending tx (#167)
* Updated .gitignore file
* Updated dependencies
* Fix languages (i18n) initialization

### Removed

* Unused helper functions
* Infura handlers
* Unused references (kovan and rinkeby tokens)
* Deprecated componentWillReceiveProps lifecycle

## [0.5.2](https://github.com/balance-io/balance-manager/releases/tag/0.5.2)

### Added

* New token icons
* Add Github templates for Issues and PR

### Changed

* Improve hover performance of box-shadow on rows (Issue #180)
* Collapse Dropdown component onClick outside of Dropdown (Issue #172)
* Fix flickering AssetIcon due to unnecessary setState calls (Issue ##107)

### Removed

\*

## [0.5.1](https://github.com/balance-io/balance-manager/releases/tag/0.5.1)

### Added

* Log version changes

### Changed

* Proxy shapeshift, gas prices, balances and transactions with indexer.balance.io
* Display checksum addresses
* Walletconnect endpoints according to new spec
* Refactor BigNumber into smaller helper functions
* Refactor web3SendTransaction to a single handler
* Hide Exchange feature and WalletConnect on homepage

### Removed

* Packages removed (netlify-lambda && concurrently)
* Lambda functions from netlify
*

## [0.5.0](https://github.com/balance-io/balance-manager/releases/tag/0.5.0)

### Added

* Display Token Balances
* Display Transactions & Interactions
* Receive QR Code
* Send Transaction
* Lambda Functions
* Metamask Integration
* Ledger Integration

### Changed

\*

### Removed

\*
