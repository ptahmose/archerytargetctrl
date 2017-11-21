/*
 * Name: TypeScript Color Utilities
 * Author: Donald Jones (pwdonald)
 * Date: June 8, 2014
 *
 * Contains useful code for dealing with colors in hex/rgb/hsv representations.
 */
var ColorUtils;
(function (ColorUtils) {
    /*
     * Object representation of RGB (red/green/blue) values for a color.
     */
    class RGB {
        constructor(r, g, b) {
            this.red = r;
            this.green = g;
            this.blue = b;
        }
    }
    ColorUtils.RGB = RGB;
    /*
     * Object representation of HSV (hue/saturation/value) values for a color.
     */
    class HSV {
    }
    ColorUtils.HSV = HSV;
    /*
     * Contains methods to manipulate colors both in RGB and HSV form.
     */
    class ColorHelper {
        /*
         * Returns a HSV value given a RGB value.
         *
         * @param rgb Object containing red, green, blue values.
         */
        static rgbToHsv(rgb) {
            var hsv = new HSV();
            var min = Math.min(rgb.red, rgb.green, rgb.blue);
            var max = Math.max(rgb.red, rgb.green, rgb.blue);
            hsv.value = max;
            var delta = max - min;
            if (max != 0) {
                hsv.saturation = delta / max;
            }
            else {
                // r = g = b = 0
                hsv.saturation = 0;
                hsv.hue = -1;
                return hsv;
            }
            if (rgb.red === max) {
                // between yellow & magenta
                hsv.hue = (rgb.green - rgb.blue) / delta;
            }
            else if (rgb.green === max) {
                // between cyan & yellow
                hsv.hue = 2 + (rgb.blue - rgb.red) / delta;
            }
            else {
                // between magenta & cyan
                hsv.hue = 4 + (rgb.red - rgb.green) / delta;
            }
            // degrees
            hsv.hue *= 60;
            if (hsv.hue < 0) {
                hsv.hue += 360;
            }
            return hsv;
        }
        /*
         * Returns a RGB value give a HSV value.
         *
         * @param hsv Object containing hue, saturation, value.
         */
        static hsvToRgb(hsv) {
            var i, f, p, q, t;
            var rgb = new RGB(0, 0, 0);
            if (hsv.saturation === 0) {
                // schromatic (grey)
                rgb.red = rgb.green = rgb.blue = hsv.value;
                return rgb;
            }
            hsv.hue /= 60;
            i = Math.floor(hsv.hue);
            // factorial part of h
            f = hsv.hue - i;
            p = hsv.value * (1 - hsv.saturation);
            q = hsv.value * (1 - hsv.saturation * f);
            t = hsv.value * (1 - hsv.saturation * (1 - f));
            switch (i) {
                case 0:
                    {
                        rgb.red = hsv.value;
                        rgb.green = t;
                        rgb.blue = p;
                        break;
                    }
                case 1:
                    {
                        rgb.red = q;
                        rgb.green = hsv.value;
                        rgb.blue = p;
                        break;
                    }
                case 2:
                    {
                        rgb.red = p;
                        rgb.green = hsv.value;
                        rgb.blue = t;
                        break;
                    }
                case 3:
                    {
                        rgb.red = p;
                        rgb.green = q;
                        rgb.blue = hsv.value;
                        break;
                    }
                case 4:
                    {
                        rgb.red = t;
                        rgb.green = p;
                        rgb.blue = hsv.value;
                        break;
                    }
                default:
                    {
                        rgb.red = hsv.value;
                        rgb.green = p;
                        rgb.blue = q;
                        break;
                    }
            }
            return rgb;
        }
        /*
         * Returns the hexadecimal representation of a RGB valu.e
         *
         * @param rgb Object containing red, green, blue values of a color.
         */
        static rgbToHex(rgb) {
            // source: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
            return "#" + ((1 << 24) + (rgb.red << 16) + (rgb.green << 8) + rgb.blue).toString(16).slice(1);
        }
        /*
         * Returns the RGB representation given a hexadecimal number.
         *
         * @param hex String containing a valid hexadecimal color.
         */
        static hexToRgb(hex) {
            // source: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
            // Expand shorthand form (e.g."03F") to full form (e.g."0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, (m, r, g, b) => {
                return r + r + g + g + b + b;
            });
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return {
                red: parseInt(result[1], 16),
                green: parseInt(result[2], 16),
                blue: parseInt(result[3], 16)
            };
        }
        /*
         * Returns true if the colors match within the tolerance range.
         *
         * @param color RGB representation of a color to compare with the target.
         * @param targetcolor RGB representation of the target color for comparison.
         * @param tolerance Allowed difference between the color and targetcolor to consider a match.
         */
        static colorMatch(color, targetcolor, tolerance) {
            // calculate the eucledian distance between the two colors
            var distance;
            var r1 = Math.max(color.red, targetcolor.red) - Math.min(color.red, targetcolor.red) ^ 2;
            var g1 = Math.max(color.green, targetcolor.green) - Math.min(color.green, targetcolor.green) ^ 2;
            var b1 = Math.max(color.blue, targetcolor.blue) - Math.min(color.blue, targetcolor.blue) ^ 2;
            distance = Math.sqrt(r1 + g1 + b1);
            return (distance < tolerance) ? true : false;
        }
    }
    ColorUtils.ColorHelper = ColorHelper;
})(ColorUtils || (ColorUtils = {}));
//# sourceMappingURL=ColorUtils.js.map