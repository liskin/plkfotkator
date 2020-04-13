{
	const s = document.createElement("script");
	s.src = chrome.runtime.getURL("main.js");
	s.type = 'text/javascript';
	document.body.appendChild(s);
}
