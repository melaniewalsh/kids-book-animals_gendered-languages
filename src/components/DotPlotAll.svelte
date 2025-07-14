<script>
	import booksData from "$data/dot-plot-books.csv";
	import surveyData from "$data/dot-plot-survey.csv";
	import chatData from "$data/dot-plot-chat.csv";
	import allData from "$data/dot-plot-all.csv";
	import { scaleLinear } from "d3-scale";
	import _ from "lodash";

	const { id, title, sub, featured_animal } = $props();
	let animalFilter = $state("");
	let languageFilter = $state("");

	// Filtering
	const animals = $derived(() => _.uniq(booksData.map((d) => d.animal)).sort());
	const languages = $derived(() =>
		_.uniq(booksData.map((d) => d.Language)).sort()
	);

	const dataOptions = {
		books: booksData,
		survey: surveyData,
		chat: chatData,
		all: allData
	};

	const data = dataOptions[id];
	const labelWidth = 92;

	const margin = {
		left: labelWidth + 10,
		right: 0,
		top: 0,
		bottom: 0
	};

	let oneLine = id === "all";
	let fullWidth = $state(0);
	let chartWidth = $derived(fullWidth - margin.left - margin.right);
	let selectedId = $state(null);

	const xScale = $derived(
		scaleLinear().domain([0, 100]).range([0, chartWidth])
	);

	const filteredData = $derived(() =>
		booksData
			.filter((d) => !animalFilter || d.animal === animalFilter)
			.filter((d) => !languageFilter || d.Language === languageFilter)
			.sort((a, b) => a.Language.localeCompare(b.Language))
	);

	// slight adjustment to make it more on the line — probably a better way to do this
	const xGet = (d) => +d.proportion_female - 3;
	const xAxisLabels = ["100%", "75%", "Equal", "75%", "100%"];
	let tooltipCoords = $state({ x: 0, y: 0 });
	let hoveredId = $state(null);
	const onMouseEnter = (e) => {
		// if (selectedId !== null) return;

		hoveredId = e.target.id; // will now be something like "cat-German"
		const rect = e.target.getBoundingClientRect();
		const overHalfwayAcross = rect.left + rect.width > window.innerWidth / 2;
		const x = rect.left + (overHalfwayAcross ? -200 : rect.width);
		const y = rect.top + rect.height + window.scrollY;
		tooltipCoords = { x, y };
	};

	const hoveredData = $derived(() => {
		if (!hoveredId) return null;
		const [animal, lang] = hoveredId.split("-");
		return booksData.find((d) => d.animal === animal && d.Language === lang);
	});

	console.log("hoveredData", hoveredData);
</script>

<h3>Explore All <br /> Animals and Languages</h3>
<div class="description"></div>

<div class="controls">
	<label>
		Animal:
		<select bind:value={animalFilter}>
			<option value="">All Animals</option>
			{#each _.uniq(booksData.map((d) => d.animal)).sort() as animal}
				<option value={animal}>
					{_.upperFirst(animal)}
				</option>
			{/each}
		</select>
	</label>

	<label>
		Language:
		<select bind:value={languageFilter}>
			<option value="">All Languages</option>
			{#each _.uniq(booksData.map((d) => d.Language)).sort() as lang}
				<option value={lang}>{lang}</option>
			{/each}
		</select>
	</label>
</div>

<!-- show one animal -->
<figure id={`dot-plot-id`} class:one-line={oneLine}>
	<div class="inner">
		<div
			class="arrows"
			style:margin-left={`${oneLine ? 0 : margin.left}px`}
			style:width={oneLine ? "100%" : `${chartWidth}px`}
		>
			<div>MASCULINE</div>
			<div>FEMININE</div>
		</div>

		<div class="rows" bind:clientWidth={fullWidth}>
			<!-- alphabetize  -->
			{#each booksData
				.filter((d) => !animalFilter || d.animal === animalFilter)
				.filter((d) => !languageFilter || d.Language === languageFilter)
				.sort((a, b) => {
					if (animalFilter) {
						// User picked an animal — just sort by language
						return a.Language.localeCompare(b.Language);
					} else {
						// No filter — sort by animal then language
						const animalComp = a.animal.localeCompare(b.animal);
						return animalComp !== 0 ? animalComp : a.Language.localeCompare(b.Language);
					}
				}) as d}
				<div class="row">
					<div class="label" style:width={`${labelWidth}px`}>
						{d.Language}
					</div>
					<div class="line" class:english-line={d.Language === "English"}>
						<div
							id={`${d.animal}-${d.Language}`}
							class="animal"
							class:english-animal={d.Language === "English"}
							style:left={`${xScale(xGet(d))}px`}
							onmouseenter={onMouseEnter}
							onmouseleave={() => {
								if (selectedId === null) hoveredId = null;
							}}
						>
							<img
								src={`assets/animals2x/${d.animal}@2x.png`}
								text={d.Translation}
								alt="{d.animal} illustration"
							/>
						</div>
					</div>
				</div>
			{/each}

			<div
				class="x-axis"
				style:left={`${oneLine ? "0" : margin.left}px`}
				style:width={`${oneLine ? "100%" : chartWidth + "px"}`}
			>
				{#each xAxisLabels as label}
					<div class="marker">
						<div class="vertical" class:equal={label === "Equal"} />
						<div class="label">{label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</figure>

<div
	class="tooltip"
	class:visible={hoveredId !== null}
	style="top: {tooltipCoords.y}px; left: {tooltipCoords.x}px;"
>
	<div>{hoveredId}</div>
	<div>{hoveredData?.Translation}</div>

	<span style:background="blue"> </span>
	<!-- <a href={hoveredData?.goodreads_link} -->
	<!-- target="_blank" -->
	<!-- rel="noopener noreferrer" -->
	<!-- onclick={(e) => e.stopPropagation()} -->
	<!-- ></a -->
</div>

<style>
	.controls {
		display: flex;
		gap: 0.5rem;
		/* justify-content: space-between; */
		justify-content: center;
		margin-top: 1rem;
		flex-wrap: wrap;
		margin-bottom: 2rem;
		font-size: var(--20px);
	}

	.controls > div {
		display: flex;
		flex-direction: column;
	}

	.controls > div:first-child {
		flex: 1;
	}

	.controls > div:last-child {
		display: flex;
		flex-direction: column;
		align-items: end;
	}

	.arrows {
		font-size: var(--18px);
		font-weight: bold;
		display: flex;
		justify-content: center;
		gap: 5rem;
	}

	.arrows div:first-child {
		text-align: end;
	}

	.arrows div {
		white-space: nowrap;
	}

	.inner {
		/* border: 8px solid var(--color-pink); */
		border-radius: 16px;
		/* background: var(--color-yellow); */
		padding: 8px;
		padding-bottom: 36px;
		margin-top: 16px;
	}

	.rows {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-right: 4rem;
		margin-top: 1rem;
	}

	.row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.one-line .rows {
		margin: 0 3rem;
	}

	.one-line .row {
		height: 4rem;
	}

	.one-line .line {
		background: none;
	}

	.line {
		position: relative;
		width: 100%;
	}

	.line:before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 1px;
		opacity: 0.5;
		border-top: 1px dashed var(--color-fg);
	}

	.animal {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		position: absolute;
		top: 0;
		transform: translate(0, -50%);
		width: 72px;
		height: 72px;
		line-height: 1;
		box-shadow: none;
		overflow: hidden;
	}

	.animal img {
		width: 100%;
		pointer-events: none;
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
	}

	.label {
		font-size: var(--18px);
		text-align: end;
	}

	.animal {
		position: absolute;
		top: 0;
		line-height: 1;
		transform: translate(0, -50%);
		z-index: 2;
	}

	.x-axis {
		position: absolute;
		display: flex;
		justify-content: space-between;
		height: 100%;
		pointer-events: none;
	}

	.marker .label {
		position: absolute;
		transform: translate(-50%, 50%);
		white-space: nowrap;
		font-size: var(--14px);
	}

	.vertical {
		width: 1px;
		height: 100%;
		background: var(--color-fg);
		opacity: 0.5;
	}

	.equal {
		background: var(--color-fg);
		opacity: 0.5;
		width: 2px;
	}

	figure {
		margin: 3rem 0;
	}

	h3 {
		text-align: center;
		margin-bottom: 0;
	}

	p {
		text-align: center;
		margin-top: 0;
	}

	@media (max-width: 600px) {
		h3 {
			font-size: var(--22px);
		}

		p {
			font-size: var(--16px);
			margin: 0.5rem 0;
		}

		.rows {
			margin-right: 1rem;
		}

		.one-line .rows {
			margin: 0 1rem;
		}

		.animal {
			height: 64px;
			width: 64px;
		}

		.x-axis .marker:nth-child(2) .label,
		.x-axis .marker:nth-child(4) .label {
			display: none;
		}

		.marker:nth-child(1) .label {
			transform: translate(-30%, 50%);
		}

		.marker:nth-child(5) .label {
			transform: translate(-70%, 50%);
		}

		.label {
			font-size: var(--16px);
		}
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

	.marker .vertical {
		background: var(--color-fg); /* default fallback */
		opacity: 0.5;
		width: 1px;
		height: 100%;
	}

	/* Left line — blue */
	.x-axis .marker:nth-child(1) .vertical {
		background: var(--color-blue-aaa);
		width: 5px;
		opacity: 1;
	}

	/* Left line — blue */
	.x-axis .marker:nth-child(3) .vertical {
		width: 5px;
		background: black;
		opacity: 1;
	}

	/* Right line — pink */
	.x-axis .marker:nth-child(5) .vertical {
		background: var(--color-pink-aaa);
		width: 5px;
		opacity: 1;
	}

	.animal.english-animal img {
		filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));
	}
	.line.english-line:before {
		border-top: 2px solid gold;
		opacity: 1;
	}
</style>
