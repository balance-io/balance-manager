# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/)

## [Unreleased]

### Added

* Added Czech language translation
* Added Polish language translation
* Added Brazilian Portuguese language translation #276
* Added Portuguese translation
* New util function for transaction prep
* General componetisation of the modals
* General improvement to readability/maintainability of the modals

### Changed

### Removed

## [0.6.0](https://github.com/balance-io/balance-manager/releases/tag/0.6.0)

### Added
* Support for Shapeshift
* Support for Trezor
* Support for Unique (non fungible) tokens
* Added language selector to wallet connection page
* Added English language fallback to i18n initialisation
* Incoming and outgoing pending transactions for Shapeshift
* Versioning for local storage
* Exchange button and modal
* Account Type component for displaying active wallet logo

### Changed
* Fix txn fee conversion
* DrodpownAsset improved logic
* Refactor Send and Exchange modals/reducers for consistency
* Fix unit time references
* Moved missing language strings
* Automatically route users to '/transactions' when pending transaction is initiated

### Removed
* Account interactions tab
* Duplicative code

## [0.5.4](https://github.com/balance-io/balance-manager/releases/tag/0.5.3)

### Added

* Bookmark Reminder (anti-phishing) Ribbon
* Dropdown on account view for choosing language
* Link to Ledger support page on Ledger connection page
* Ledger affiliate link to wallet selection screen
* Donate ETH button and modal
* Input fetching animation


### Changed

* Layout padding definition locations
* Fix mobile layout on the wallet selection screen (#232)
* Update spanish translation with consistent voice (tu vs usted)
* Changed a few strings that weren't handled by i18n
* Fix overflow padding for dropdowns

### Removed

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
