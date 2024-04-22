const vscode = acquireVsCodeApi();

window.addEventListener("message", (event) => {
	const colors = event.data;
	const backgroundColor = colors.backgroundColor;
	const outlineColor = colors.outlineColor;

	const bodyInput = document.getElementById("body");
	const outlineInput = document.getElementById("outline");

	bodyInput.value = backgroundColor;
	outlineInput.value = outlineColor;

	updateLivePreview(backgroundColor, outlineColor);

	bodyInput.addEventListener(
		"input",
		debounce(() => {
			const bgColor = bodyInput.value;
			const olColor = outlineInput.value;
			updateLivePreview(bgColor, olColor);
			sendSelectedColors(bgColor, olColor);
		}, 50),
	);

	outlineInput.addEventListener(
		"input",
		debounce(() => {
			const bgColor = bodyInput.value;
			const olColor = outlineInput.value;
			updateLivePreview(bgColor, olColor);
			sendSelectedColors(bgColor, olColor);
		}, 50),
	);
});

function sendSelectedColors(bgColor, olColor) {
	const message = {
		type: "selectedColors",
		backgroundColor: bgColor,
		outlineColor: olColor,
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

function updateLivePreview(bgColor, olColor) {
	document.querySelector(".live-preview").style.backgroundColor = bgColor;
	document.querySelector(".live-preview").style.outlineColor = olColor;
}
