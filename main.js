{
	const parseBackgroundImage = function (value) {
		const m = value.match(/^url\(["']?([^"']*)["']?\)$/);
		return m ? m[1] : null;
	};

	const fetchRaw = async function (url) {
		const response = await fetch(url);
		if (!response.ok)
			throw new Error("cannot fetch");

		return response.arrayBuffer();
	};

	const dummyPhotoHashQ = new Int32Array(
		[964187606, 488554096, -870350548, 472781212, 1943860014, 704953838, 2044389021, 107628121]
	);

	const dummyPhotoHashX = new Int32Array(
		[611287218, 603312897, 1091126894, 1620666705, 741685090, -1196905154, -1942782605, -1239619627]
	);

	const arrayEqual = function (a1, a2) {
		a1 = new Int32Array(a1);
		a2 = new Int32Array(a2);

		if (a1.byteLength != a2.byteLength)
			return false;

		for (let i = 0; i < a1.length; ++i) {
			if (a1[i] != a2[i])
				return false;
		}

		return true;
	};

	const isDummyFoto = async function (imgUrl) {
		// TODO: cache in local storage
		const imgData = await fetchRaw(imgUrl);
		const imgHash = await crypto.subtle.digest('SHA-256', imgData);
		return arrayEqual(imgHash, dummyPhotoHashQ) || arrayEqual(imgHash, dummyPhotoHashX);
	};

	const getInitials = function (fotoDiv) {
		const name = fotoDiv.closest('.prispevek').children('.obsah').find('.autor .df_autor_jmeno span[data-vizitka]').text();
		if (!name)
			throw new Error("cannot find name");

		return name.split(' ').filter(n => !n.includes('.')).map(x => x[0]).join('');
	};

	const addInitials = function (fotoDiv) {
		let initialsDiv = fotoDiv.children('.initials');
		if (!initialsDiv.length)
			initialsDiv = $('<div class="initials">').appendTo(fotoDiv);

		initialsDiv.text(getInitials(fotoDiv));
	};

	const fotoCallback = async function (fotoDiv) {
		fotoDiv = $(fotoDiv);

		const imgUrl = parseBackgroundImage(fotoDiv.css('background-image'));
		if (imgUrl && await isDummyFoto(imgUrl)) {
			// TODO: implement known photo replacements
			addInitials(fotoDiv);
		}
	};

	const setStyle = function () {
		let style = $('style#plkfotkator');
		if (!style.length)
			style = $('<style id="plkfotkator">').appendTo('body');

		style.text(`
			.foto .initials {
				right: 50%;
				bottom: 50%;
				transform: translate(50%,50%);
				position: absolute;

				font: 2em bold;
				color: #C00;
				text-shadow: #FFF -0.1em -0.1em 0.2em, #FFF 0.1em -0.1em 0.2em, #FFF -0.1em 0.1em 0.2em, #FFF 0.1em 0.1em 0.2em;
			}
		`);
	}

	const main = async function () {
		setStyle();

		await $.getScript('https://cdn.jsdelivr.net/gh/uzairfarooq/arrive@v2.4.1/minified/arrive.min.js');
		$('div#discussion').arrive('div.foto[data-vizitka]', {existing: true}, fotoCallback);
		Arrive.unbindAllArrive();
	};

	main();
}
