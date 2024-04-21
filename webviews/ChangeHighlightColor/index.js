const vscode = acquireVsCodeApi();

window.addEventListener("message", (event) => {
	const colors = event.data;
	const backgroundColor = colors.backgroundColor;
	const outlineColor = colors.outlineColor;
	const textColor = colors.textColor;
	const secondaryHighlightColor = colors.secondaryHighlightColor;

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

	bodyInput.value = backgroundColor;
	outlineInput.value = outlineColor;
	textInput.value = textColor;
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
) {
	const message = {
		type: "selectedColors",
		backgroundColor: bgColor + componentToHex(Math.floor(bgOpacity * 255)),
		outlineColor: olColor + componentToHex(Math.floor(olOpacity * 255)),
		textColor: tColor + componentToHex(Math.floor(tOpacity * 255)),
		secondaryHighlightColor:
			sbColor + componentToHex(Math.floor(sbOpacity * 255)),
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
) {
	const livePreviewEl = document.querySelector(".live-preview");
	const backgroundRGB = hexToRgb(bgColor);
	livePreviewEl.style.backgroundColor = `rgba(${backgroundRGB.r}, ${backgroundRGB.g}, ${backgroundRGB.b}, ${bgOpacity})`;
	const outlineRGB = hexToRgb(olColor);
	livePreviewEl.style.outlineColor = `rgba(${outlineRGB.r}, ${outlineRGB.g}, ${outlineRGB.b}, ${olOpacity})`;
	const fontRGB = hexToRgb(tColor);
	livePreviewEl.style.color = `rgba(${fontRGB.r}, ${fontRGB.g}, ${fontRGB.b}, ${tOpacity})`;
	const selectionRGB = hexToRgb(sbColor);
	livePreviewEl.style.setProperty(
		"--selection-color",
		`rgba(${selectionRGB.r}, ${selectionRGB.g}, ${selectionRGB.b}, ${sbOpacity})`,
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
