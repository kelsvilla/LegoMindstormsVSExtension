const vscode = acquireVsCodeApi();

window.addEventListener("message", (event) => {
	//color values can be any CSS-compliant format. Convert these to 8-digit hex values for ease of use
	const colors = event.data;
	const backgroundColor =
		rgbaToHex(parseCSSColor(colors.backgroundColor)) || "#00000000";
	const outlineColor =
		rgbaToHex(parseCSSColor(colors.outlineColor)) || "#00000000";
	const textColor = rgbaToHex(parseCSSColor(colors.textColor)) || "#00000000";
	const secondaryHighlightColor =
		rgbaToHex(parseCSSColor(colors.secondaryHighlightColor)) || "#00000000";

	const bodyInput = document.getElementById("body");
	const outlineInput = document.getElementById("outline");
	const textInput = document.getElementById("text");
	const secondaryColorInput = document.getElementById("secondaryColor");
	const backgroundOpacitySlider =
		document.getElementById("backgroundOpacity");
	const outlineOpacitySlider = document.getElementById("outlineOpacity");
	const textOpacitySlider = document.getElementById("textOpacity");
	const selectionColorOpacitySlider =
		document.getElementById("selectionOpacity");
	const bodyEnabled = document.getElementById("bodyEnabled");
	const outlineEnabled = document.getElementById("outlineEnabled");
	const textEnabled = document.getElementById("textEnabled");
	const selectionEnabled = document.getElementById("selectionEnabled");

	bodyEnabled.checked =
		colors.backgroundColor !== "transparent" &&
		colors.backgroundColor !== "none" &&
		colors.backgroundColor !== "None";
	outlineEnabled.checked =
		colors.outlineColor !== "transparent" &&
		colors.outlineColor !== "none" &&
		colors.outlineColor !== "None";
	textEnabled.checked =
		colors.textColor !== "transparent" &&
		colors.textColor !== "none" &&
		colors.textColor !== "None";
	selectionEnabled.checked =
		colors.secondaryHighlightColor !== "transparent" &&
		colors.secondaryHighlightColor !== "none" &&
		colors.secondaryHighlightColor !== "None";

	bodyInput.value = backgroundColor.slice(0, 7);
	outlineInput.value = outlineColor.slice(0, 7);
	textInput.value = textColor.slice(0, 7);
	secondaryColorInput.value = secondaryHighlightColor.slice(0, 7);
	selectionColorOpacitySlider.style.setProperty(
		"background-image",
		`linear-gradient(to right, transparent, ${secondaryHighlightColor})`,
	);
	backgroundOpacitySlider.style.setProperty(
		"background-image",
		`linear-gradient(to right, transparent, ${backgroundColor})`,
	);
	outlineOpacitySlider.style.setProperty(
		"background-image",
		`linear-gradient(to right, transparent, ${outlineColor})`,
	);
	textOpacitySlider.style.setProperty(
		"background-image",
		`linear-gradient(to right, transparent, ${textColor})`,
	);

	const update = debounce(() => {
		const bgColor = bodyInput.value;
		const olColor = outlineInput.value;
		const tColor = textInput.value;
		const sbColor = secondaryColorInput.value;
		const sbOpacity = selectionColorOpacitySlider.value;
		const bgOpacity = backgroundOpacitySlider.value;
		const olOpacity = outlineOpacitySlider.value;
		const tOpacity = textOpacitySlider.value;
		sendSelectedColors(
			bgColor,
			olColor,
			tColor,
			sbColor,
			sbOpacity,
			bgOpacity,
			olOpacity,
			tOpacity,
			{
				bodyEnabled: bodyEnabled.checked,
				outlineEnabled: outlineEnabled.checked,
				textEnabled: textEnabled.checked,
				selectionEnabled: selectionEnabled.checked,
			},
		);
	}, 50);

	updateLivePreview(
		backgroundColor,
		outlineColor,
		textColor,
		secondaryHighlightColor,
		selectionColorOpacitySlider.value,
		backgroundOpacitySlider.value,
		outlineOpacitySlider.value,
		textOpacitySlider.value,
		{
			bodyEnabled: bodyEnabled.checked,
			outlineEnabled: outlineEnabled.checked,
			textEnabled: textEnabled.checked,
			selectionEnabled: selectionEnabled.checked,
		},
	);

	const InputHandler = () => {
		update();
		updateLivePreview(
			bodyInput.value,
			outlineInput.value,
			textInput.value,
			secondaryColorInput.value,
			selectionColorOpacitySlider.value,
			backgroundOpacitySlider.value,
			outlineOpacitySlider.value,
			textOpacitySlider.value,
			{
				bodyEnabled: bodyEnabled.checked,
				outlineEnabled: outlineEnabled.checked,
				textEnabled: textEnabled.checked,
				selectionEnabled: selectionEnabled.checked,
			},
		);
		UpdateSliderValues();
	};

	bodyInput.addEventListener("input", InputHandler);

	outlineInput.addEventListener("input", InputHandler);

	textInput.addEventListener("input", InputHandler);

	secondaryColorInput.addEventListener("input", InputHandler);

	selectionColorOpacitySlider.addEventListener("input", InputHandler);
	backgroundOpacitySlider.addEventListener("input", InputHandler);
	outlineOpacitySlider.addEventListener("input", InputHandler);
	textOpacitySlider.addEventListener("input", InputHandler);
	bodyEnabled.addEventListener("change", InputHandler);
	outlineEnabled.addEventListener("change", InputHandler);
	textEnabled.addEventListener("change", InputHandler);
	selectionEnabled.addEventListener("change", InputHandler);
});

function sendSelectedColors(
	bgColor,
	olColor,
	tColor,
	sbColor,
	sbOpacity,
	bgOpacity,
	olOpacity,
	tOpacity,
	{ bodyEnabled, outlineEnabled, textEnabled, selectionEnabled },
) {
	const message = {
		type: "selectedColors",
		backgroundColor: bodyEnabled
			? bgColor + componentToHex(Math.floor(bgOpacity * 255))
			: "none",
		outlineColor: outlineEnabled
			? olColor + componentToHex(Math.floor(olOpacity * 255))
			: "none",
		textColor: textEnabled
			? tColor + componentToHex(Math.floor(tOpacity * 255))
			: "none",
		secondaryHighlightColor: selectionEnabled
			? sbColor + componentToHex(Math.floor(sbOpacity * 255))
			: "none",
	};
	vscode.postMessage(message);
}

function debounce(func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function updateLivePreview(
	bgColor,
	olColor,
	tColor,
	sbColor,
	sbOpacity,
	bgOpacity,
	olOpacity,
	tOpacity,
	{ bodyEnabled, outlineEnabled, textEnabled, selectionEnabled },
) {
	const livePreviewEl = document.querySelector(".live-preview");
	const backgroundRGB = hexToRgb(bgColor);
	livePreviewEl.style.backgroundColor = bodyEnabled
		? `rgba(${backgroundRGB.r}, ${backgroundRGB.g}, ${backgroundRGB.b}, ${bgOpacity})`
		: "none";
	const outlineRGB = hexToRgb(olColor);
	livePreviewEl.style.outlineColor = outlineEnabled
		? `rgba(${outlineRGB.r}, ${outlineRGB.g}, ${outlineRGB.b}, ${olOpacity})`
		: "none";
	const fontRGB = hexToRgb(tColor);
	livePreviewEl.style.color = textEnabled
		? `rgba(${fontRGB.r}, ${fontRGB.g}, ${fontRGB.b}, ${tOpacity})`
		: "none";
	const selectionRGB = hexToRgb(sbColor);
	livePreviewEl.style.setProperty(
		"--selection-color",
		selectionEnabled
			? `rgba(${selectionRGB.r}, ${selectionRGB.g}, ${selectionRGB.b}, ${sbOpacity})`
			: "none",
	);
}

function UpdateSliderValues() {
	document
		.getElementById("backgroundOpacity")
		.style.setProperty(
			"background-image",
			`linear-gradient(to right, transparent, ${
				document.getElementById("body").value
			})`,
		);
	document
		.getElementById("outlineOpacity")
		.style.setProperty(
			"background-image",
			`linear-gradient(to right, transparent, ${
				document.getElementById("outline").value
			})`,
		);
	document
		.getElementById("textOpacity")
		.style.setProperty(
			"background-image",
			`linear-gradient(to right, transparent, ${
				document.getElementById("text").value
			})`,
		);
	document
		.getElementById("selectionOpacity")
		.style.setProperty(
			"background-image",
			`linear-gradient(to right, transparent, ${
				document.getElementById("secondaryColor").value
			})`,
		);
}

function hexToRgb(hex) {
	if (hex.length === 7) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
			  }
			: null;
	} else if (hex.length === 9) {
		const result =
			/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
					a: parseInt(result[4], 16),
			  }
			: null;
	}
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbaToHex(rgba) {
	if (!rgba) return null;
	const [r, g, b, a] = rgba;
	return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(
		b,
	)}${componentToHex(Math.floor(a * 255))}`;
}

// (c) Dean McNamee <dean@gmail.com>, 2012.
//
// https://github.com/deanm/css-color-parser-js
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

// http://www.w3.org/TR/css3-color/
const kCSSColorTable = {
	transparent: [0, 0, 0, 0],
	aliceblue: [240, 248, 255, 1],
	antiquewhite: [250, 235, 215, 1],
	aqua: [0, 255, 255, 1],
	aquamarine: [127, 255, 212, 1],
	azure: [240, 255, 255, 1],
	beige: [245, 245, 220, 1],
	bisque: [255, 228, 196, 1],
	black: [0, 0, 0, 1],
	blanchedalmond: [255, 235, 205, 1],
	blue: [0, 0, 255, 1],
	blueviolet: [138, 43, 226, 1],
	brown: [165, 42, 42, 1],
	burlywood: [222, 184, 135, 1],
	cadetblue: [95, 158, 160, 1],
	chartreuse: [127, 255, 0, 1],
	chocolate: [210, 105, 30, 1],
	coral: [255, 127, 80, 1],
	cornflowerblue: [100, 149, 237, 1],
	cornsilk: [255, 248, 220, 1],
	crimson: [220, 20, 60, 1],
	cyan: [0, 255, 255, 1],
	darkblue: [0, 0, 139, 1],
	darkcyan: [0, 139, 139, 1],
	darkgoldenrod: [184, 134, 11, 1],
	darkgray: [169, 169, 169, 1],
	darkgreen: [0, 100, 0, 1],
	darkgrey: [169, 169, 169, 1],
	darkkhaki: [189, 183, 107, 1],
	darkmagenta: [139, 0, 139, 1],
	darkolivegreen: [85, 107, 47, 1],
	darkorange: [255, 140, 0, 1],
	darkorchid: [153, 50, 204, 1],
	darkred: [139, 0, 0, 1],
	darksalmon: [233, 150, 122, 1],
	darkseagreen: [143, 188, 143, 1],
	darkslateblue: [72, 61, 139, 1],
	darkslategray: [47, 79, 79, 1],
	darkslategrey: [47, 79, 79, 1],
	darkturquoise: [0, 206, 209, 1],
	darkviolet: [148, 0, 211, 1],
	deeppink: [255, 20, 147, 1],
	deepskyblue: [0, 191, 255, 1],
	dimgray: [105, 105, 105, 1],
	dimgrey: [105, 105, 105, 1],
	dodgerblue: [30, 144, 255, 1],
	firebrick: [178, 34, 34, 1],
	floralwhite: [255, 250, 240, 1],
	forestgreen: [34, 139, 34, 1],
	fuchsia: [255, 0, 255, 1],
	gainsboro: [220, 220, 220, 1],
	ghostwhite: [248, 248, 255, 1],
	gold: [255, 215, 0, 1],
	goldenrod: [218, 165, 32, 1],
	gray: [128, 128, 128, 1],
	green: [0, 128, 0, 1],
	greenyellow: [173, 255, 47, 1],
	grey: [128, 128, 128, 1],
	honeydew: [240, 255, 240, 1],
	hotpink: [255, 105, 180, 1],
	indianred: [205, 92, 92, 1],
	indigo: [75, 0, 130, 1],
	ivory: [255, 255, 240, 1],
	khaki: [240, 230, 140, 1],
	lavender: [230, 230, 250, 1],
	lavenderblush: [255, 240, 245, 1],
	lawngreen: [124, 252, 0, 1],
	lemonchiffon: [255, 250, 205, 1],
	lightblue: [173, 216, 230, 1],
	lightcoral: [240, 128, 128, 1],
	lightcyan: [224, 255, 255, 1],
	lightgoldenrodyellow: [250, 250, 210, 1],
	lightgray: [211, 211, 211, 1],
	lightgreen: [144, 238, 144, 1],
	lightgrey: [211, 211, 211, 1],
	lightpink: [255, 182, 193, 1],
	lightsalmon: [255, 160, 122, 1],
	lightseagreen: [32, 178, 170, 1],
	lightskyblue: [135, 206, 250, 1],
	lightslategray: [119, 136, 153, 1],
	lightslategrey: [119, 136, 153, 1],
	lightsteelblue: [176, 196, 222, 1],
	lightyellow: [255, 255, 224, 1],
	lime: [0, 255, 0, 1],
	limegreen: [50, 205, 50, 1],
	linen: [250, 240, 230, 1],
	magenta: [255, 0, 255, 1],
	maroon: [128, 0, 0, 1],
	mediumaquamarine: [102, 205, 170, 1],
	mediumblue: [0, 0, 205, 1],
	mediumorchid: [186, 85, 211, 1],
	mediumpurple: [147, 112, 219, 1],
	mediumseagreen: [60, 179, 113, 1],
	mediumslateblue: [123, 104, 238, 1],
	mediumspringgreen: [0, 250, 154, 1],
	mediumturquoise: [72, 209, 204, 1],
	mediumvioletred: [199, 21, 133, 1],
	midnightblue: [25, 25, 112, 1],
	mintcream: [245, 255, 250, 1],
	mistyrose: [255, 228, 225, 1],
	moccasin: [255, 228, 181, 1],
	navajowhite: [255, 222, 173, 1],
	navy: [0, 0, 128, 1],
	oldlace: [253, 245, 230, 1],
	olive: [128, 128, 0, 1],
	olivedrab: [107, 142, 35, 1],
	orange: [255, 165, 0, 1],
	orangered: [255, 69, 0, 1],
	orchid: [218, 112, 214, 1],
	palegoldenrod: [238, 232, 170, 1],
	palegreen: [152, 251, 152, 1],
	paleturquoise: [175, 238, 238, 1],
	palevioletred: [219, 112, 147, 1],
	papayawhip: [255, 239, 213, 1],
	peachpuff: [255, 218, 185, 1],
	peru: [205, 133, 63, 1],
	pink: [255, 192, 203, 1],
	plum: [221, 160, 221, 1],
	powderblue: [176, 224, 230, 1],
	purple: [128, 0, 128, 1],
	rebeccapurple: [102, 51, 153, 1],
	red: [255, 0, 0, 1],
	rosybrown: [188, 143, 143, 1],
	royalblue: [65, 105, 225, 1],
	saddlebrown: [139, 69, 19, 1],
	salmon: [250, 128, 114, 1],
	sandybrown: [244, 164, 96, 1],
	seagreen: [46, 139, 87, 1],
	seashell: [255, 245, 238, 1],
	sienna: [160, 82, 45, 1],
	silver: [192, 192, 192, 1],
	skyblue: [135, 206, 235, 1],
	slateblue: [106, 90, 205, 1],
	slategray: [112, 128, 144, 1],
	slategrey: [112, 128, 144, 1],
	snow: [255, 250, 250, 1],
	springgreen: [0, 255, 127, 1],
	steelblue: [70, 130, 180, 1],
	tan: [210, 180, 140, 1],
	teal: [0, 128, 128, 1],
	thistle: [216, 191, 216, 1],
	tomato: [255, 99, 71, 1],
	turquoise: [64, 224, 208, 1],
	violet: [238, 130, 238, 1],
	wheat: [245, 222, 179, 1],
	white: [255, 255, 255, 1],
	whitesmoke: [245, 245, 245, 1],
	yellow: [255, 255, 0, 1],
	yellowgreen: [154, 205, 50, 1],
};

function clamp_css_byte(i) {
	// Clamp to integer 0 .. 255.
	i = Math.round(i); // Seems to be what Chrome does (vs truncation).
	return i < 0 ? 0 : i > 255 ? 255 : i;
}

function clamp_css_float(f) {
	// Clamp to float 0.0 .. 1.0.
	return f < 0 ? 0 : f > 1 ? 1 : f;
}

function parse_css_int(str) {
	// int or percentage.
	if (str[str.length - 1] === "%")
		return clamp_css_byte((parseFloat(str) / 100) * 255);
	return clamp_css_byte(parseInt(str));
}

function parse_css_float(str) {
	// float or percentage.
	if (str[str.length - 1] === "%")
		return clamp_css_float(parseFloat(str) / 100);
	return clamp_css_float(parseFloat(str));
}

function css_hue_to_rgb(m1, m2, h) {
	if (h < 0) h += 1;
	else if (h > 1) h -= 1;

	if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
	if (h * 2 < 1) return m2;
	if (h * 3 < 2) return m1 + (m2 - m1) * (2 / 3 - h) * 6;
	return m1;
}

function parseCSSColor(css_str) {
	// Remove all whitespace, not compliant, but should just be more accepting.
	const str = css_str.replace(/ /g, "").toLowerCase();

	// Color keywords (and transparent) lookup.
	if (str in kCSSColorTable) return kCSSColorTable[str].slice(); // dup.

	// #abc and #abc123 syntax.
	if (str[0] === "#") {
		if (str.length === 4) {
			var iv = parseInt(str.substr(1), 16); // TODO(deanm): Stricter parsing.
			if (!(iv >= 0 && iv <= 0xfff)) return null; // Covers NaN.
			return [
				((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
				(iv & 0xf0) | ((iv & 0xf0) >> 4),
				(iv & 0xf) | ((iv & 0xf) << 4),
				1,
			];
		} else if (str.length === 7) {
			var iv = parseInt(str.substr(1), 16); // TODO(deanm): Stricter parsing.
			if (!(iv >= 0 && iv <= 0xffffff)) return null; // Covers NaN.
			return [(iv & 0xff0000) >> 16, (iv & 0xff00) >> 8, iv & 0xff, 1];
		} else if (str.length === 9) {
			const parts = [
				parseInt(str[1] + str[2], 16),
				parseInt(str[3] + str[4], 16),
				parseInt(str[5] + str[6], 16),
				parseInt(str[7] + str[8], 16) / 255,
			];
			if (!parts[0]) parts[0] = 0;
			if (!parts[1]) parts[1] = 0;
			if (!parts[2]) parts[2] = 0;
			return parts;
		}

		return null;
	}

	var op = str.indexOf("("),
		ep = str.indexOf(")");
	if (op !== -1 && ep + 1 === str.length) {
		var fname = str.substr(0, op);
		var params = str.substr(op + 1, ep - (op + 1)).split(",");
		var alpha = 1; // To allow case fallthrough.
		switch (fname) {
			case "rgba":
				if (params.length !== 4) return null;
				alpha = parse_css_float(params.pop());
			// Fall through.
			case "rgb":
				if (params.length !== 3) return null;
				return [
					parse_css_int(params[0]),
					parse_css_int(params[1]),
					parse_css_int(params[2]),
					alpha,
				];
			case "hsla":
				if (params.length !== 4) return null;
				alpha = parse_css_float(params.pop());
			// Fall through.
			case "hsl":
				if (params.length !== 3) return null;
				var h = (((parseFloat(params[0]) % 360) + 360) % 360) / 360; // 0 .. 1
				// NOTE(deanm): According to the CSS spec s/l should only be
				// percentages, but we don't bother and let float or percentage.
				var s = parse_css_float(params[1]);
				var l = parse_css_float(params[2]);
				var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
				var m1 = l * 2 - m2;
				return [
					clamp_css_byte(css_hue_to_rgb(m1, m2, h + 1 / 3) * 255),
					clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
					clamp_css_byte(css_hue_to_rgb(m1, m2, h - 1 / 3) * 255),
					alpha,
				];
			default:
				return null;
		}
	}

	return null;
}
