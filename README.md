# react-tool-kit
React tools kit generator

## Requirement
- Node >= 8.10.0

## Structure

The project consists of following packages:
- [react-tool-kit-cli]
- [react-tool-kit-server]

They're managed by [Lerna](https://github.com/lerna/lerna) so you don't need to `npm link` manually :D

## Getting started
```sh
npx react-tool-kit init myapp
```

## Contributing
```sh
# First, clone the repo
# then install
yarn

# Bootstrap packages
yarn bootstrap

# Build lib
yarn build:lib

# Ready to develop locally!
```

### Release packages flow

1. Create a new branch from latest `master`

2. Run release command

   ```sh
   # Release for `latest` tag (`latest` is the default tag installed by users)
   npm run release

   # or release for `next` tag (recommended for new pre-major version)
   npm run release:next

   # Tips: always pick `prerelease` when asked if you're still releasing `next` tag
   ```

3. Push the branch, and open PR
4. Merge to master
