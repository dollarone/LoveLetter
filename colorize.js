"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colorize = void 0;
exports.colorize = new (/** @class */ (function () {
    function class_1() {
        this.color = function (code, ended) {
            if (ended === void 0) { ended = false; }
            var messages = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                messages[_i - 2] = arguments[_i];
            }
            return "\u001B[".concat(code, "m").concat(messages.join(" ")).concat(ended ? "\x1b[0m" : "");
        };
        this.black = this.color.bind(null, 30, false);
        this.red = this.color.bind(null, 31, false);
        this.green = this.color.bind(null, 32, false);
        this.yellow = this.color.bind(this, 33, false);
        this.blue = this.color.bind(this, 34, false);
        this.magenta = this.color.bind(this, 35, false);
        this.cyan = this.color.bind(this, 36, false);
        this.white = this.color.bind(this, 37, false);
        this.gray = this.color.bind(this, 90, false);
        this.brightBlack = this.color.bind(this, 90, false);
        this.brightRed = this.color.bind(this, 91, false);
        this.brightGreen = this.color.bind(this, 92, false);
        this.brightYellow = this.color.bind(this, 93, false);
        this.brightBlue = this.color.bind(this, 94, false);
        this.brightMagenta = this.color.bind(this, 95, false);
        this.brightCyan = this.color.bind(this, 96, false);
        this.brightWhite = this.color.bind(this, 97, false);
        this.bgBlack = this.color.bind(this, 40, true);
        this.bgRed = this.color.bind(this, 41, true);
        this.bgGreen = this.color.bind(this, 42, true);
        this.bgYellow = this.color.bind(this, 43, true);
        this.bgBlue = this.color.bind(this, 44, true);
        this.bgMagenta = this.color.bind(this, 45, true);
        this.bgCyan = this.color.bind(this, 46, true);
        this.bgWhite = this.color.bind(this, 47, true);
    }
    return class_1;
}()))();
