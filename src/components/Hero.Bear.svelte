<script>
	import useWindowDimensions from "$runes/useWindowDimensions.svelte.js";

	let dimensions = new useWindowDimensions();
	let currentIndex = $state(0);
	let interval;

	const accessories = $derived([
		{ id: "la_rana", top: "93%", width: 150 },
		{ id: "greek_flag", top: "14%", left: "50.5%", width: 90 },
		{ id: "german_flag", top: "93%", left: "50.8%", width: 90 },
		{ id: "der_Frosch", top: "14%", left: "50.5%", width: 150 },
		{ id: "mexican_flag", top: "93%", width: 90 },
		{ id: "spanish_flag", top: "14%", left: "50.5%", width: 90 }

		// { id: "glasses", top: "42%", left: "51%", width: 150 },
		// { id: "mustache", top: "62%", left: "51%", width: 120 },
		// { id: "tiara", top: "19%", left: "49%", width: 90 },
		// { id: "cap", top: "12%" },
		// { id: "tophat", top: "4%" },
		// { id: "girl_glasses", top: "44%", left: "50.5%", width: 160 }
	]);

	$effect(() => {
		interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % accessories.length;
		}, 2000);
		return () => {
			clearInterval(interval);
		};
	});

	const getPosition = (i) => {
		const total = accessories.length;
		const diff = (i - currentIndex + total) % total;
		const visualIndex = diff > total / 2 ? diff - total : diff;

		if (visualIndex <= -3) return -100;
		if (visualIndex >= 3) return 200;

		return (visualIndex + 1) * 50;
	};
</script>

<div class="wrapper" class:ready={dimensions.width && dimensions.width > 0}>
	<img class="bear" src="assets/animals2x/frog@2x.png" alt="frog" />

	{#each accessories as { id, top, left, width }, i}
		{@const active = i === currentIndex}
		<img
			{id}
			class="accessory"
			class:active
			class:hidden={!dimensions.width ||
				getPosition(i) > 150 ||
				getPosition(i) < -50}
			alt={id}
			src={`assets/hero/${id}.png`}
			style:width={width ? `${width}px` : "100px"}
			style:left={left && active ? `${left}` : `${getPosition(i)}%`}
			style:top
		/>
	{/each}
</div>

<style>
	.wrapper {
		height: 250px;
		margin-top: 3rem;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		max-width: 600px;
		margin: 0 auto 3rem auto;
	}

	.bear {
		bottom: 0;
		position: absolute;
		width: 200px;
	}

	.accessory {
		position: absolute;
		transform: translate(-50%, 0);
		opacity: 0.5;
		transition:
			left 0.8s ease,
			opacity 0.8s ease;
	}

	#hair:not(.active) {
		z-index: -1;
	}

	.active {
		opacity: 1;
	}

	.hidden {
		opacity: 0;
	}
</style>
