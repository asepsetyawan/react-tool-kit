const chalk = require('chalk');

function log(...args) {
  console.log(chalk.bgCyan(' react-tool-kit > '), chalk.cyan(...args));
}

module.exports = {
  log
};
