var chalk = require('chalk');
var path  = require('path');

function setQuestions(projectName, folderName, config, isConfig) {
    var project;

    if (isConfig) {
        project = config.getProject(projectName);

        if (!project) {
            console.log(chalk.cyan(config.getName()) + ', I didn\'t find a project with this name - ' + chalk.bgRed.white(projectName));
            return [];
        }
    }

    var questions = [];

    var userQ = {
        name: 'userName',
        when: function() {
            return !config.getName()
        },
        message: chalk.green.bold('Hello!') + ' Looks like we\'ve never met before. What is your name, ' +
        chalk.yellow(config.getRandomName().toLowerCase()) + '?'
    };

    var projectNameQ = {
        name: 'projectNameConfirm',
        default: projectName && !config.isNameOccupied(projectName) ? projectName : folderName,
        when: function() {
            return !projectName || (!isConfig && config.isNameOccupied(projectName));
        },
        message: function(ans) {
            var name = config.getName();

            if (!name) {
                name = ans.userName ? ans.userName : config.getRandomName();
                console.log('\n  Well, nice to meet you, ' + chalk.cyan(name) + '!\n');
            }

            return chalk.cyan(name) + ', what is the name of the project?';
        }
    };

    var imagesConfirmQ = {
        type: 'confirm',
        name: 'imagesConfirm',
        default: true,
        when: function(ans) {
            return ans.projectNameConfirm || projectName;
        },
        message: function(ans) {
            var name = config.getName();

            if (!ans.projectNameConfirm && !name) {
                name = ans.userName ? ans.userName : config.getRandomName();
                console.log('\n  Well, nice to meet you, ' + chalk.cyan(name) + '!\n');
            }

            var text = !projectName ? 'Do you wish your images to be optimized?' : chalk.cyan(name) +
            ', do you wish your images to be optimized?';

            return text;
        }
    };

    var imagesPathQ = {
        when: function(ans) {
            return ans.imagesConfirm && (ans.projectNameConfirm || projectName);
        },
        name: 'imagesPath',
        message: function() {
            return chalk.green('Great') + '! I\'m going to need a ' + chalk.yellow('RELATIVE') +
                ' path to the images folder then. \n  ' +
                'You can write several paths separated with a semicolon like so: \n  ' +
                chalk.green('path/to/some/folder/') + ';' + chalk.blue('another/one/here/') + '\n \n ' +
                chalk.grey(path.normalize(process.cwd() + '/')) + '>'
        }
    };

    var styleProcessorQ = {
        when: function(ans) {
            return ans.projectNameConfirm || projectName;
        },
        type: 'list',
        choices: [
            {
                name: 'I\'ll be fine with good old CSS',
                value: false
            },
            {
                name: 'LESS',
                value: 'less'
            }
        ],
        message: 'Do you want to use a style pre-processor?\n',
        default: 'less',
        name: 'styleProcessor'
    };

    var stylePathQ = {
        when: function(ans) {
            return ans.styleProcessor && (ans.projectNameConfirm || projectName);
        },
        name: 'stylePath',
        message: chalk.green('Great') + '! I\'m going to need a ' + chalk.magenta('RELATIVE') +
        ' path to the style-file then. \n  ' +
        'You can write several paths separated with a semicolon like so: \n  ' +
        chalk.green('path/to/some/file.less') + ';' + chalk.blue('another/one/here.less') + '\n  ' +
        chalk.grey(path.normalize(process.cwd() + '/')) + '>'
    };

    var styleCssPathQ = {
        when: function(ans) {
            return ans.styleProcessor && (ans.projectNameConfirm || projectName);
        },
        name: 'styleCssPath',
        default: 'same folder',
        message: 'Alright, we have a generated ' + chalk.magenta('CSS-file') +
        ' (or even several files) here. Where do I put it?\n  ' + chalk.grey(process.cwd()) + '>'
    };

    var prefQ = {
        when: function(ans) {
            return ans.styleProcessor && (ans.projectNameConfirm || projectName);
        },
        type: 'confirm',
        name: 'styleAutoprefixConfirm',
        message: 'Do you want to use Autoprefixer?'
    };

    var prefParamQ = {
        when: function(ans) {
            return ans.styleAutoprefixConfirm && (ans.projectNameConfirm || projectName);
        },
        default: 'last 3 versions',
        name: 'styleAutoprefixParam',
        message: 'Autoprefixer param is '
    };

    var spriteConfirmQ = {
        when: function(ans) {
            return ans.projectNameConfirm || projectName;
        },
        name: 'spriteConfirm',
        message: function(ans) {
            var name = config.getName() ? config.getName() : ans.userName;
            return chalk.cyan(name) + ', do you want me to build ' + chalk.green('sprites') + ' for you?'
        },
        type: 'confirm',
        default: true
    };

    var spriteImagesQ = {
        name: 'spriteImagesPath',
        default: isConfig && project.spriteSourcePath ? project.spriteSourcePath : '',
        message: 'Well... Where is the sprite images/parts folder? \n ' +
        chalk.grey(path.normalize(process.cwd() + '/')) + '>',
        when: function(ans) {
            return ans.spriteConfirm && (ans.projectNameConfirm || projectName);
        }
    };

    var spritePathQ = {
        name: 'spritePath',
        default: isConfig && project.spritePath ? project.spritePath : '',
        message: 'And where do I put a sprite? \n ' + chalk.grey(process.cwd()) + '>',
        when: function(ans) {
            return ans.spriteConfirm && (ans.projectNameConfirm || projectName);
        }
    };

    var spriteCssQ = {
        name: 'spriteCssPath',
        default: isConfig && project.spriteCssPath ? project.spriteCssPath : '',
        message: 'Got it! Almost forgot, I need to know where do I put generated sprite-styles file...\n' +
        chalk.grey(process.cwd()) + '>',
        when: function(ans) {
            return ans.spriteConfirm && (ans.projectNameConfirm || projectName);
        }
    };

    if (isConfig) {
        if (project.imagesPath) {
            imagesPathQ.default = project.imagesPath.join(';');
        }
        if (project.stylePath) {
            stylePathQ.default = project.stylePath.join(';');
        }
        if (project.spriteSourcePath) {
            spriteImagesQ.default = project.spriteSourcePath;
        }
        if (project.spritePath) {
            spritePathQ.default = project.spritePath;
        }
        if (project.spriteCssPathPath) {
            spriteCssQ.default = project.spriteCssPathPath;
        }

        styleCssPathQ.default = project.styleCssPath ? project.styleCssPath : 'same folder';
        prefParamQ.default    = project.styleAutoprefixer ? project.styleAutoprefixer : 'last 3 versions';
    }

    questions.push(userQ, projectNameQ, imagesConfirmQ, imagesPathQ, styleProcessorQ, stylePathQ, styleCssPathQ, prefQ, prefParamQ, spriteConfirmQ, spriteImagesQ, spritePathQ, spriteCssQ);

    return questions;
}

module.exports = setQuestions;