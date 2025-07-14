<script>
	import { scaleLinear } from "d3-scale";
	import _ from "lodash";
	import data from "$data/dot-plot-books.csv";

	const { id, title, sub, featured_animal } = $props();

	let animalFilter = $state("");
	let languageFilter = $state("");

	// Layout & scales
	let fullWidth = $state(0);
	const labelWidth = 100;
	const margin = { left: labelWidth + 10, right: 0 };
	let chartWidth = $derived(fullWidth - margin.left - margin.right);
	const xScale = $derived(
		scaleLinear().domain([0, 100]).range([0, chartWidth])
	);
	const xGet = (d) => +d.proportion_female - 3;

	// Tooltip
	let tooltipCoords = $state({ x: 0, y: 0 });
	let hoveredId = $state(null);

	// Filtering
	const animals = $derived(() => _.uniq(data.map((d) => d.animal)).sort());
	const languages = $derived(() => _.uniq(data.map((d) => d.Language)).sort());

	const filteredData = $derived(() =>
		data
			.filter((d) => !animalFilter || d.animal === animalFilter)
			.filter((d) => !languageFilter || d.Language === languageFilter)
			.sort((a, b) => a.Language.localeCompare(b.Language))
	);

	const onMouseEnter = (e) => {
		hoveredId = e.target.id;
		const rect = e.target.getBoundingClientRect();
		const x =
			rect.left + (rect.left > window.innerWidth / 2 ? -200 : rect.width);
		const y = rect.top + rect.height + window.scrollY;
		tooltipCoords = { x, y };
	};

	const hoveredData = $derived(() => {
		if (!hoveredId) return null;
		const [animal, lang] = hoveredId.split("-");
		return data.find((d) => d.animal === animal && d.Language === lang);
	});
	console.log(animals);
	console.log(data);
</script>

<div class="controls">
	<label>
		Animal:
		<select bind:value={animalFilter}>
			<option value="">All</option>
			{#each animals as animal}
				<option value={animal}>{animal}</option>
			{/each}
		</select>
	</label>

	<label>
		Language:
		<select bind:value={languageFilter}>
			<option value="">All</option>
			{#each languages as lang}
				<option value={lang}>{lang}</option>
			{/each}
		</select>
	</label>
</div>

<div class="dotplot" bind:clientWidth={fullWidth}>
	<div
		class="arrows"
		style:margin-left={`${margin.left}px`}
		style:width={`${chartWidth}px`}
	>
		<div>MASCULINE</div>
		<div>FEMININE</div>
	</div>

	{#each filteredData as d}
		<div class="row">
			<div class="label" style:width={`${labelWidth}px`}>{d.Language}</div>
			<div class="line">
				<div
					id={`${d.animal}-${d.Language}`}
					class="animal"
					style:left={`${xScale(xGet(d))}px`}
					onmouseenter={onMouseEnter}
					onmouseleave={() => (hoveredId = null)}
				>
					<img src={`assets/animals2x/${d.animal}@2x.png`} alt={d.animal} />
				</div>
			</div>
		</div>
	{/each}

	<!-- Axis -->
	<div
		class="x-axis"
		style:left={`${margin.left}px`}
		style:width={`${chartWidth}px`}
	>
		{#each ["100%", "75%", "Equal", "75%", "100%"] as label}
			<div class="marker">
				<div class="vertical" class:equal={label === "Equal"} />
				<div class="label">{label}</div>
			</div>
		{/each}
	</div>
</div>

<div
	class="tooltip"
	class:visible={hoveredId}
	style="top: {tooltipCoords.y}px; left: {tooltipCoords.x}px;"
>
	<div>{hoveredId}</div>
	<div>{hoveredData?.Translation}</div>
</div>

<style>
	.controls {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	select {
		padding: 0.25rem;
		border: 2px solid black;
	}

	.dotplot {
		position: relative;
		margin-bottom: 2rem;
	}

	.arrows {
		display: flex;
		justify-content: space-between;
		font-weight: bold;
		margin-bottom: 0.5rem;
	}

	.row {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	.label {
		text-align: right;
		padding-right: 1rem;
	}

	.line {
		flex: 1;
		position: relative;
		height: 1px;
		border-top: 1px dashed #999;
	}

	.animal {
		position: absolute;
		top: -36px;
		width: 64px;
		height: 64px;
		transform: translate(-50%, 0);
	}

	.animal img {
		width: 100%;
		pointer-events: none;
	}

	.x-axis {
		position: relative;
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

	.marker {
		position: relative;
		text-align: center;
	}

	.marker .vertical {
		width: 1px;
		height: 30px;
		background: #aaa;
		margin: 0 auto;
	}

	.marker .label {
		font-size: 0.8rem;
		margin-top: 4px;
	}

	.tooltip {
		position: absolute;
		background: white;
		padding: 0.5rem;
		border: 1px solid black;
		display: none;
	}

	.tooltip.visible {
		display: block;
	}
</style>
