const vscode = acquireVsCodeApi();

window.addEventListener("message", (event) => {
	const colors = event.data;
	const backgroundColor = colors.backgroundColor;
	const outlineColor = colors.outlineColor;
	const textColor = colors.textColor;
	const secondaryHighlightColor= colors.secondaryHighlightColor;

	const bodyInput = document.getElementById("body");
	const outlineInput = document.getElementById("outline");
	const textInput = document.getElementById("text");
	const secondaryColorInput = document.getElementById("secondaryColor");

	bodyInput.value = backgroundColor;
	outlineInput.value = outlineColor;
	textInput.value = textColor;
	secondaryColorInput.value=secondaryHighlightColor;

	updateLivePreview(backgroundColor, outlineColor, textColor, secondaryHighlightColor);

	bodyInput.addEventListener(
		"input",
		debounce(() => {
			const bgColor = bodyInput.value;
			const olColor = outlineInput.value;
			const tColor = textInput.value;
			const sbColor = secondaryColorInput.value;
			updateLivePreview(bgColor, olColor, tColor, sbColor);
			sendSelectedColors(bgColor, olColor, tColor, sbColor);
		}, 50),
	);

	outlineInput.addEventListener(
		"input",
		debounce(() => {
			const bgColor = bodyInput.value;
			const olColor = outlineInput.value;
			const tColor = textInput.value;
			const sbColor = secondaryColorInput.value;
			updateLivePreview(bgColor, olColor, tColor, sbColor);
			sendSelectedColors(bgColor, olColor, tColor, sbColor);
		}, 50),
	);

	textInput.addEventListener(
		"input",
		debounce(() => {
			const bgColor = bodyInput.value;
			const olColor = outlineInput.value;
			const tColor = textInput.value;
			const sbColor = secondaryColorInput.value;
			updateLivePreview(bgColor, olColor, tColor, sbColor);
			sendSelectedColors(bgColor, olColor, tColor, sbColor);
		}, 50),
	);
});

function sendSelectedColors(bgColor, olColor, tColor, sbColor) {
	const message = {
		type: "selectedColors",
		backgroundColor: bgColor,
		outlineColor: olColor,
		textColor: tColor,
		secondaryHighlightColor: sbColor,
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

function updateLivePreview(bgColor, olColor, tColor, sbColor) {
	document.querySelector(".live-preview").style.backgroundColor = bgColor;
	document.querySelector(".live-preview").style.outlineColor = olColor;
	document.querySelector(".live-preview").style.color = tColor;
	document.querySelector(".live-preview").style
}
