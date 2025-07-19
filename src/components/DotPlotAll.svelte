<script>
	import Toggle from "$components/helpers/migrate/Toggle.svelte";
	import BarPlot from "$components/BarPlot.svelte";

	import booksData from "$data/dot-plot-books.csv";
	import { scaleLinear } from "d3-scale";
	import _ from "lodash";

	const { id } = $props();
	const languageColorMap = {
		French: "var(--color-green)",
		German: "var(--category-purple)",
		English: "var(--color-blue-aaa)",
		Spanish: "var(--color-yellow)",
		Italian: "var(--color-orange-light)",
		Russian: "var(--category-red)",
		Portuguese: "var(--category-cyan)",
		Arabic: "var(--color-white)",
		Hindi: "var(--color-pink-light)"
		// Add more as needed...
	};

	let tooltipData = $derived(() =>
		booksData.map((d, i) => ({
			...d,
			id: i
		}))
	);
	let animalFilter = $state("");
	let languageFilter = $state("");

	// Filtering
	const animals = $derived(() => _.uniq(booksData.map((d) => d.animal)).sort());
	const languages = $derived(_.uniq(booksData.map((d) => d.Language)).sort());
	let language1 = $state("French");
	let language2 = $state("German");

	// const faceOffMode = $derived(
	// 	() => language1 && language2 && language1 !== language2
	// );

	const labelWidth = 92;
	let faceOffMode = $state("on");

	let faceOffColors = $derived({
		[language1]: "var(--color-green)",
		[language2]: "var(--category-purple)"
	});

	const margin = {
		left: labelWidth + 10,
		right: 0,
		top: 0,
		bottom: 0
	};

	let oneLine = id === "all";
	let fullWidth = $state(0);
	let chartWidth = $derived(
		fullWidth - (margin.left + 10) - (margin.right + 10)
	);
	let selectedId = $state(null);

	const xScale = $derived(
		scaleLinear().domain([0, 100]).range([0, chartWidth])
	);

	const Colors = {
		Feminine: "var(--color-pink)",
		Masculine: "var(--color-blue)",
		Neuter: "var(--color-gray-200)",
		Varies: "var(--color-gray-200)"
	};

	// const filteredData = $derived(() =>
	// 	booksData
	// 		.filter((d) => !animalFilter || d.animal === animalFilter)
	// 		.filter((d) => !languageFilter || d.Language === languageFilter)
	// 		.sort((a, b) => a.Language.localeCompare(b.Language))
	// );

	let filteredFaceOffData = $derived(
		tooltipData()
			.filter((d) => !animalFilter || d.animal === animalFilter)
			.filter(
				(d) =>
					(!language1 && !language2) ||
					(language1 && d.Language === language1) ||
					(language2 && d.Language === language2)
			)
			.sort((a, b) => {
				if (animalFilter) {
					return a.Language.localeCompare(b.Language);
				} else {
					const animalComp = a.animal.localeCompare(b.animal);
					return animalComp !== 0
						? animalComp
						: a.Language.localeCompare(b.Language);
				}
			})
	);

	let filteredData = $derived(
		tooltipData()
			.filter((d) => !animalFilter || d.animal === animalFilter)
			.filter((d) => !languageFilter || d.Language === languageFilter)
			.sort((a, b) => {
				if (animalFilter) {
					// User picked an animal — just sort by language
					return a.Language.localeCompare(b.Language);
				} else {
					// No filter — sort by animal then language
					const animalComp = a.animal.localeCompare(b.animal);
					return animalComp !== 0
						? animalComp
						: a.Language.localeCompare(b.Language);
				}
			})
	);

	// let filteredFaceOffData = $derived(
	// 	tooltipData()
	// 		.filter((d) => !animalFilter || d.animal === animalFilter)
	// 		.filter(
	// 			(d) =>
	// 				(!language1 && !language2) ||
	// 				(language1 && d.Language === language1) ||
	// 				(language2 && d.Language === language2)
	// 		)
	// 		.sort((a, b) => {
	// 			if (animalFilter) {
	// 				return a.Language.localeCompare(b.Language);
	// 			} else {
	// 				const animalComp = a.animal.localeCompare(b.animal);
	// 				return animalComp !== 0
	// 					? animalComp
	// 					: a.Language.localeCompare(b.Language);
	// 			}
	// 		})
	// );

	// slight adjustment to make it more on the line — probably a better way to do this
	const xGet = (d) => +d.proportion_female - 3;
	// const xGet = (d) => +d.proportion_female - 3;

	const xAxisLabels = ["", "", "", "", ""];
	let tooltipCoords = $state({ x: 0, y: 0 });
	let hoveredId = $state(null);
	const onMouseEnter = (e) => {
		// if (selectedId !== null) return;

		hoveredId = +e.target.id;
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

	function getConnectorStyle(animal) {
		const entries = tooltipData().filter(
			(d) =>
				d.animal === animal &&
				(d.Language === language1 || d.Language === language2)
		);

		if (entries.length < 2) return "";

		const entry1 = entries.find((e) => e.Language === language1);
		const entry2 = entries.find((e) => e.Language === language2);

		if (!entry1 || !entry2) return "";

		// 🚫 Skip if proportions are equal (visually meaningless to connect)
		if (+entry1.proportion_female === +entry2.proportion_female) return "";

		const pos1 = xScale(xGet(entry1)) - 5;
		const pos2 = xScale(xGet(entry2)) + 5;

		if (Math.abs(pos1 - pos2) < 1) return "";

		const left = Math.min(pos1, pos2) + 70;
		const width = Math.abs(pos2 - pos1) - 80;
		const direction = pos1 < pos2 ? "right" : "left";

		return {
			style: `left: ${left}px; right: ${left}px; width: ${width}px; top: 0px;`,
			direction
		};
	}

	let selectedAnimal = $derived(() =>
		animals().filter((a) => !animalFilter || a === animalFilter)
	);
</script>

<div class="faceoff-header">
	<h3>Explore All <br /> Animals and Languages</h3>
</div>

{#if faceOffMode == "on"}
	<div class="controls">
		<Toggle label="Face Off Mode" bind:value={faceOffMode} />

		<label
			>Animal:
			<select bind:value={animalFilter}>
				<option value="">All Animals</option>
				{#each _.uniq(booksData.map((d) => d.animal)).sort() as animal}
					<option value={animal}>
						{_.upperFirst(animal)}
					</option>
				{/each}
			</select>
		</label>
		<div class="language-filters">
			<label>
				Language 1:
				<select bind:value={language1}>
					<option value="">Choose Language</option>
					{#each languages as lang}
						<option value={lang}>{lang}</option>
					{/each}
				</select>
			</label>

			<label>
				Language 2:
				<select bind:value={language2}>
					<option value="">Choose Language</option>
					{#each languages as lang}
						<option value={lang}>{lang}</option>
					{/each}
				</select>
			</label>
		</div>
	</div>
{:else}
	<div class="controls">
		<Toggle label="Face Off Mode" bind:value={faceOffMode} />
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
{/if}

{#if faceOffMode === "on"}
	<h3>
		<span
			style="text-decoration: underline; text-decoration-color: {languageColorMap[
				language1
			]};"
			>{language1 || "Language 1"}
		</span>
		vs.
		<span
			style="text-decoration: underline; text-decoration-color: {languageColorMap[
				language2
			]};">{language2 || "Language 2"}</span
		>
	</h3>
{/if}

{#if faceOffMode === "on"}
	<BarPlot {animalFilter} {language1} {language2} />
{/if}

<!-- show one animal -->
<figure id={`dot-plot-id`} class:one-line={oneLine}>
	<div class="inner">
		<div
			class="arrows"
			style:margin-left={`${margin.left}px`}
			style:width={`${chartWidth}px`}
		>
			<!-- <div>MASCULINE</div>
			<div>FEMININE</div> -->
		</div>

		<div class="rows" bind:clientWidth={fullWidth}>
			<!-- alphabetize  -->
			{#if faceOffMode === "on"}
				{#key `${language1}-${language2}`}
					{#each _.uniq(filteredFaceOffData.map((d) => d.animal)) as animal}
						<div class="row">
							<div class="label" style:width={`${labelWidth}px`}>
								{_.upperFirst(animal)}
							</div>
							<div class="line">
								{#each [language1, language2] as lang, i}
									{#each tooltipData().filter((d) => d.animal === animal && d.Language === lang) as d}
										<div
											id={d.id}
											class="animal-faceoff {lang === language2
												? 'language2'
												: ''}"
											style:left={`${xScale(xGet(d)) + (i === 0 ? -20 : 20)}px`}
											style:background={languageColorMap[d.Language]}
											onmouseenter={onMouseEnter}
											onmouseleave={() => {
												if (selectedId === null) hoveredId = null;
											}}
										>
											<img
												src={`assets/animals2x/${d.animal}@2x.png`}
												alt="{d.animal} illustration"
											/>
										</div>
									{/each}
								{/each}

								{#if getConnectorStyle(animal)}
									{#key animal}
										<div
											class="faceoff-connector {getConnectorStyle(animal)
												.direction}"
											style={getConnectorStyle(animal).style}
										/>
									{/key}
								{/if}
							</div>
						</div>
					{/each}
				{/key}
			{:else}
				{#each filteredData as d}
					<div class="row">
						<div class="label" style:width={`${labelWidth}px`}>
							{d.Language}
						</div>
						<div class="line" class:english-line={d.Language === "English"}>
							<div
								id={d.id}
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
			{/if}

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
	.Toggle {
		/* position: absolute; */
		font-size: var(--18px);
	}
	.controls {
		display: flex;
		gap: 0.5rem;
		justify-content: space-between;
		justify-content: center;
		flex-direction: row; /* stack children vertically */
		align-items: center;
		margin-top: 1rem;
		/* flex-wrap: wrap; */
		margin-bottom: 2rem;
		font-size: var(--18px);
	}

	@media (max-width: 600px) {
		.controls {
			display: inline-grid;
		}
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

	.fixed-toggle {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.animal-faceoff.language2 {
		opacity: 0;
		transform: translateX(20px) translateY(-50%);
		animation: fadeSlideIn 2s ease forwards;
		animation-delay: 0.01s;
		/* animation-timing-function: ease-in; */
	}

	@keyframes fadeSlideIn {
		from {
			opacity: 0;
			transform: translateX(-1000px) translateY(-50%);
		}
		to {
			opacity: 1;
			transform: translateX(0) translateY(-50%);
		}
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
		gap: 20px;
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

	/* .animal {
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
	} */

	.animal {
		background: none; /* will be overridden by inline style if needed */
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
		border-radius: 50%; /* background hug the image in a circle */
		clip-path: circle(48%);
	}

	.animal-faceoff {
		background: none; /* will be overridden by inline style if needed */
		border: none;
		padding: 0;
		margin: 0;
		position: absolute;
		top: 0;
		transform: translate(0, -50%);
		width: 52px;
		height: 52px;
		line-height: 1;
		box-shadow: none;
		overflow: hidden;
		border-radius: 50%; /* background hug the image in a circle */
		clip-path: circle(48%);
	}

	.animal-faceoff img {
		width: 100%;
		pointer-events: none;
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2));
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

	.animal-faceoff {
		position: absolute;
		top: 0;
		line-height: 1;
		transform: translate(0, -50%);
		z-index: 2;
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
		opacity: 0;
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
	/* .line.english-line:before {
		border-top: 2px solid rgb(0, 0, 0);
		opacity: 1;
	} */
</style>
