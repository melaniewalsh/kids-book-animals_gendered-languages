<script>
	import animalgenderData from "$data/animal-gender-languages.csv";
	import _ from "lodash";

	const Colors = {
		Feminine: "var(--color-pink)",
		Masculine: "var(--color-blue)",
		"Neuter/Varies": "var(--color-gray-200)"
	};

	const margin = {
		left: 10,
		right: 0,
		top: 0,
		bottom: 0
	};

	const GENDERS = ["Masculine", "Feminine", "Neuter/Varies"];
	let fullWidth = $state(0);
	let chartWidth = $derived(
		fullWidth - (margin.left + 10) - (margin.right + 10)
	);
	// ⛳ Use shared global state
	let hoveredId = $state(null);
	let tooltipCoords = $state({ x: 0, y: 0 });

	const { animalFilter, language1, language2 } = $props();

	let tooltipData = $derived(() =>
		animalgenderData.map((d, i) => ({
			...d,
			id: i,
			Gender:
				d.Gender === "Neuter" || d.Gender === "Varies"
					? "Neuter/Varies"
					: d.Gender
		}))
	);

	const onMouseEnter = (e, d) => {
		hoveredId = d.id;
		const rect = e.target.getBoundingClientRect();
		tooltipCoords = {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height + window.scrollY + 8
		};
	};

	const onMouseLeave = () => {
		hoveredId = null;
	};

	let filtered = $derived(() =>
		tooltipData().filter(
			(d) =>
				(!animalFilter || d.animal === animalFilter) &&
				[language1, language2].includes(d.Language)
		)
	);

	let grouped = $derived(() =>
		_.groupBy(filtered(), (d) => `${d.Language}|${d.Gender}`)
	);

	const getGroup = (lang, gender) => grouped()[`${lang}|${gender}`] || [];
</script>

<div class="bargrid-container" bind:clientWidth={fullWidth}>
	<div class="bargrid1" style:width={`${chartWidth / 2}px`}>
		<div class="barrow1 title-row">
			<!-- <div class="gender-label"></div>
			<div class="lang-label-left">{language1}</div> -->
		</div>
		{#each GENDERS as gender}
			<div class="barrow1">
				<!-- <div class="gender-label">{gender}</div> -->
				<div class="bar lang1" style="background: {Colors[gender] || '#ccc'}">
					{#each getGroup(language1, gender) as d}
						<div
							class="animal"
							id={d.id}
							onmouseenter={(e) => onMouseEnter(e, d)}
							onmouseleave={onMouseLeave}
						>
							<img src={`assets/animals2x/${d.animal}@2x.png`} alt={d.animal} />
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Divider -->
	<div class="divider"></div>

	<!-- Right side -->
	<div class="bargrid2" style:width={`${chartWidth / 2}px`}>
		<div class="barrow2 title-row">
			<!-- <div class="gender-label"></div> -->
			<!-- <div class="lang-label-right">{language2}</div> -->
		</div>
		{#each GENDERS as gender}
			<div class="barrow2">
				<div class="bar lang2" style="background: {Colors[gender] || '#ccc'}">
					{#each getGroup(language2, gender) as d}
						<div
							class="animal"
							id={d.id}
							onmouseenter={(e) => onMouseEnter(e, d)}
							onmouseleave={onMouseLeave}
						>
							<img src={`assets/animals2x/${d.animal}@2x.png`} alt={d.animal} />
						</div>
					{/each}
				</div>
				<!-- <div class="gender-label2">{gender}</div> -->
			</div>
		{/each}
	</div>
</div>

<!-- Tooltip copied from your original -->
<div
	class="tooltip"
	class:visible={hoveredId !== null}
	style="top: {tooltipCoords.y}px; left: {tooltipCoords.x}px;"
>
	<div>
		<b
			>{tooltipData().find((d) => d.id === hoveredId)?.Language ||
				"Not found"}</b
		>
	</div>
	<div>
		{tooltipData().find((d) => d.id === hoveredId)?.animal || "Not found"}
	</div>

	<div>
		<i
			>{tooltipData().find((d) => d.id === hoveredId)?.Name_with_Article ||
				"Not found"}</i
		>
	</div>
	<div
		style:background={Colors[
			tooltipData().find((d) => d.id === hoveredId)?.Gender
		] || null}
	>
		{tooltipData().find((d) => d.id === hoveredId)?.Gender || "Not found"}
	</div>

	<!-- <a href={hoveredData?.goodreads_link} -->
	<!-- target="_blank" -->
	<!-- rel="noopener noreferrer" -->
	<!-- onclick={(e) => e.stopPropagation()} -->
	<!-- ></a -->
</div>

<style>
	.bargrid1 {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.bargrid2 {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.bargrid1,
	.bargrid2 {
		max-width: 100%;
		overflow-wrap: break-word;
	}

	.barrow1 {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.barrow2 {
		display: flex;
		align-items: left;
		justify-content: left;
		gap: 0.5rem;
	}

	.gender-label {
		width: 120px;
		text-align: right;
		font-weight: bold;
		font-size: var(--18px);
	}

	.gender-label2 {
		width: 120px;
		text-align: left;
		font-weight: bold;
		font-size: var(--18px);
	}

	.bar {
		display: flex;
		/* gap: 4px; */
		min-height: 52px;
		padding: 0.25rem;
		border-radius: 4px;
		/* flex: 1; */
		width: fit-content;
		max-width: 100%;
		flex-wrap: wrap;
	}

	.bar.lang1 {
		justify-content: left;
		display: inline-masonry;
		/* border-top-left-radius: 16px;
		border-bottom-left-radius: 16px; */
	}

	.bar.lang2 {
		justify-content: left;
		/* display: inline-masonry; */

		/* border-top-right-radius: 16px;
		border-bottom-right-radius: 16px; */
	}

	.animal {
		width: 36px;
		height: 36px;
	}

	.animal img {
		width: 100%;
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
	}

	.animal img {
		width: 100%;
		height: auto;
		pointer-events: none;
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
	}

	.bargrid-container {
		display: flex;
		flex-direction: row;
		gap: -2rem;
		align-items: flex-start;
	}

	.divider {
		width: 2px;
		/* background: #000000; */
		margin: 0 1rem;
		align-self: stretch; /* ✅ Makes it fill the full height of its flex row */
	}

	.tooltip {
		z-index: 1000;
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: auto;
		background: white;
		width: 220px;
		padding: 1rem;
		display: none;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	}

	.tooltip.visible {
		display: flex;
	}
	.lang-label-left {
		text-align: left;
	}
	.lang-label-right {
		text-align: left;
	}
</style>
