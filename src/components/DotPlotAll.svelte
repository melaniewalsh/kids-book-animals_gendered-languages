<script>
	import Toggle from "$components/helpers/migrate/Toggle.svelte";
	import BarPlot from "$components/BarPlot.svelte";

	import animalgenderData from "$data/animal-gender-languages.csv";
	import { scaleLinear } from "d3-scale";
	import _ from "lodash";

	const { id } = $props();
	const languageColorMap = {
		French: "var(--color-green)",
		German: "var(--category-purple)",
		English: "var(--color-blue)",
		Spanish: "var(--color-yellow)",
		Italian: "var(--color-orange-light)",
		Russian: "var(--category-red)",
		Portuguese: "var(--category-cyan)",
		Arabic: "var(--color-white)",
		Hindi: "var(--color-pink-light)",
		Greek: "var(--color-gray-200)",
		Polish: "var(--color-green-bright)"

		// Add more as needed...
	};

	let tooltipData = $derived(() =>
		animalgenderData.map((d, i) => ({
			...d,
			id: i
		}))
	);
	let animalFilter = $state("");
	let languageFilter = $state("");

	// Filtering
	const animals = $derived(() =>
		_.uniq(animalgenderData.map((d) => d.animal)).sort()
	);
	const languages = $derived(
		_.uniq(animalgenderData.map((d) => d.Language)).sort()
	);
	let language1 = $state("French");
	let language2 = $state("German");

	// const faceOffMode = $derived(
	// 	() => language1 && language2 && language1 !== language2
	// );

	const labelWidth = 82;
	let faceOffMode = $state("on");

	let faceOffColors = $derived({
		[language1]: "var(--color-green)",
		[language2]: "var(--category-purple)"
	});

	function isOverlap(animal) {
		const d1 = tooltipData().find(
			(d) => d.animal === animal && d.Language === language1
		);
		const d2 = tooltipData().find(
			(d) => d.animal === animal && d.Language === language2
		);

		if (!d1 || !d2) return false;
		return xGet(d1) === xGet(d2);
	}

	const margin = {
		left: labelWidth + 10,
		right: 0,
		top: 0,
		bottom: 0
	};

	let oneLine = id === "all";
	let fullWidth = $state(0);
	let chartWidth = $derived(fullWidth - (margin.left - margin.right));
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
	// 	animalgenderData
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
	const xGet = (d) => {
		const val = +d.proportion_female;
		const offset = val === 0 ? 1.5 : val === 100 ? -3 : 0;
		return val + offset;
	}; // const xGet = (d) => +d.proportion_female - 3;

	const xAxisLabels = ["Masculine", "", "Neuter/Varies", "", "Feminine"];
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
		return animalgenderData.find(
			(d) => d.animal === animal && d.Language === lang
		);
	});

	// function getConnectorStyle(animal) {
	// 	const entries = tooltipData().filter(
	// 		(d) =>
	// 			d.animal === animal &&
	// 			(d.Language === language1 || d.Language === language2)
	// 	);

	// 	if (entries.length < 2) return "";

	// 	const entry1 = entries.find((e) => e.Language === language1);
	// 	const entry2 = entries.find((e) => e.Language === language2);

	// 	if (!entry1 || !entry2) return "";

	// 	// 🚫 Skip if proportions are equal (visually meaningless to connect)
	// 	if (+entry1.proportion_female === +entry2.proportion_female) return "";

	// 	const pos1 = xScale(xGet(entry1)) - 100;
	// 	const pos2 = xScale(xGet(entry2)) + 100;

	// 	if (Math.abs(pos1 - pos2) < 1) return "";

	// 	const left = Math.min(pos1, pos2) + 70;
	// 	const width = Math.abs(pos2 - pos1) - 80;
	// 	const direction = pos1 < pos2 ? "right" : "left";

	// 	return {
	// 		style: `left: ${left}px; right: ${left}px; width: ${width}px; top: 0px;`,
	// 		direction
	// 	};
	// }

	let selectedAnimal = $derived(() =>
		animals().filter((a) => !animalFilter || a === animalFilter)
	);
</script>

{#if faceOffMode == "on"}
	<div class="controls">
		<div>
			<label for="toggle">Face-Off Mode</label>
			<Toggle id="toggle" bind:value={faceOffMode} />
		</div>
		<!-- <div class="dropdown-filters"> -->
		<div>
			<label for="animal-select">Filter by animal</label>
			<select id="animal-select" bind:value={animalFilter}>
				<option value="">All Animals</option>
				{#each _.uniq(animalgenderData.map((d) => d.animal)).sort() as animal}
					<option value={animal}>
						{_.upperFirst(animal)}
					</option>
				{/each}
			</select>
		</div>
		<!-- <div class="language-filters"> -->
		<div>
			<label for="lang1-select">Language 1</label>
			<select id="lang1-select" bind:value={language1}>
				<option value="">Choose Language</option>
				{#each languages as lang}
					<option value={lang}>{lang}</option>
				{/each}
			</select>

			<label for="lang2-select">Language 2</label>
			<select id="lang2-select" bind:value={language2}>
				<option value="">Choose Language</option>
				{#each languages as lang}
					<option value={lang}>{lang}</option>
				{/each}
			</select>
		</div>
		<!-- </div>
		</div> -->
	</div>
{:else}
	<div class="controls">
		<div>
			<label for="toggle">Face Off Mode</label>
			<Toggle id="toggle" bind:value={faceOffMode} />
		</div>
		<div>
			<label for="animal-select">Filter by animal</label>
			<select id="animal-select" bind:value={animalFilter}>
				<option value="">All Animals</option>
				{#each _.uniq(animalgenderData.map((d) => d.animal)).sort() as animal}
					<option value={animal}>
						{_.upperFirst(animal)}
					</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="lang-select">Filter by language</label>
			<select id="lang-select" bind:value={languageFilter}>
				<option value="">All Languages</option>
				{#each _.uniq(animalgenderData.map((d) => d.Language)).sort() as lang}
					<option value={lang}>{lang}</option>
				{/each}
			</select>
		</div>
	</div>
{/if}

{#if faceOffMode === "on"}
	<h3>
		<span
			class="language-title"
			style="background: {languageColorMap[language1]};"
			>{language1 || "Language 1"}
		</span>
		vs.
		<span
			class="language-title"
			style="background: {languageColorMap[language2]}"
			>{language2 || "Language 2"}</span
		>
	</h3>
{/if}

<!-- {#if faceOffMode === "on"}
	<BarPlot {animalFilter} {language1} {language2} />
{/if} -->

<!-- show one animal -->
<figure id={`dot-plot-id`}>
	<div class="inner">
		<div
			class="arrows"
			style:margin-left={`${margin.left}px`}
			style:width={`${chartWidth}px`}
		></div>

		<div class="rows-faceoff" bind:clientWidth={fullWidth}>
			<!-- alphabetize  -->
			{#if faceOffMode === "on"}
				{#key `${language1}-${language2}`}
					{#each _.uniq(filteredFaceOffData.map((d) => d.animal)) as animal}
						<div class="row">
							<div class="label" style:width={`${labelWidth}px`}>
								<span style:font-weight={isOverlap(animal) ? "normal" : "bold"}>
									{_.upperFirst(animal)}
								</span>
							</div>

							<div class="line">
								{#each [language1, language2] as lang, i}
									{#each tooltipData().filter((d) => d.animal === animal && d.Language === lang) as d}
										<div
											id={d.id}
											class="animal-faceoff {lang === language2
												? 'language2'
												: ''}"
											style:left={`${
												xScale(xGet(d)) +
												(isOverlap(animal) ? (i === 0 ? -15 : 15) : 0)
											}px`}
											style:background={languageColorMap[d.Language]}
											onmouseenter={onMouseEnter}
											onmouseleave={() => {
												if (selectedId === null) hoveredId = null;
											}}
										>
											<a
												href={`https://en.wiktionary.org/wiki/${d.Translation.split(" (")[0]}#${d.Language}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												<img
													src={`assets/animals2x/${d.animal}@2x.png`}
													alt="{d.animal} illustration"
												/>
											</a>
										</div>
									{/each}
								{/each}

								<!-- {#if getConnectorStyle(animal)}
									{#key animal}
										<div
											class="faceoff-connector {getConnectorStyle(animal)
												.direction}"
											style={getConnectorStyle(animal).style}
										/>
									{/key}
								{/if} -->
							</div>
						</div>
					{/each}
				{/key}
				<div
					class="x-axis"
					style:left={`${margin.left}px`}
					style:width={`${chartWidth + "px"}`}
				>
					{#each xAxisLabels as label}
						<div class="marker">
							<div class="vertical" class:equal={label === "Equal"} />
							<div class="label" class:one-animal={animalFilter}>{label}</div>
						</div>
					{/each}
				</div>
			{:else}
				{#each filteredData as d}
					<div class="row">
						<div
							class="label"
							style:width={`${labelWidth}px`}
							class:portuguese-line={d.Language === "Portuguese"}
						>
							{d.Language}
						</div>
						<div class="line" class:english-line={d.Language === "English"}>
							<div
								id={d.id}
								class="animal"
								class:english-animal={d.Language === "English"}
								style:left={`${
									xScale(xGet(d)) +
									(d.Language === "Portuguese" ? -11 : 0) +
									(d.Gender === "Masculine"
										? -15
										: d.Gender === "Varies"
											? -15
											: d.Gender === "Neuter"
												? -15
												: 0)
								}px`}
								onmouseenter={onMouseEnter}
								onmouseleave={() => {
									if (selectedId === null) hoveredId = null;
								}}
							>
								<a
									href={`https://en.wiktionary.org/wiki/${d.Translation.split(" (")[0]}#${d.Language}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<img
										src={`assets/animals2x/${d.animal}@2x.png`}
										text={d.Translation}
										alt="{d.animal} illustration"
									/>
								</a>
							</div>
						</div>
					</div>
				{/each}
				<div
					class="x-axis"
					style:left={`${margin.left}px`}
					style:width={`${chartWidth + "px"}`}
				>
					{#each xAxisLabels as label}
						<div class="marker">
							<div class="vertical" class:equal={label === "Equal"} />
							<div class="label" class:one-animal-off={animalFilter}>
								{label}
							</div>
						</div>
					{/each}
				</div>
			{/if}
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
		<i>
			{(() => {
				const entry = tooltipData().find((d) => d.id === hoveredId);
				return entry
					? entry.Name_with_Article === "-"
						? entry.Translation
						: entry.Name_with_Article
					: "Not found";
			})()}
		</i>
	</div>
	<div
		style:background={Colors[
			tooltipData().find((d) => d.id === hoveredId)?.Gender
		] || null}
		style:font-size={tooltipData().find((d) => d.id === hoveredId)?.Language ===
		"English"
			? "1rem"
			: undefined}
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

	/* @media (max-width: 600px) {
		.controls {
			display: inline-grid;
		}
	} */
	.dropdown-filters {
		align-items: flex-start !important;
		gap: 0.5rem;
	}
	.language-filters {
		flex-direction: column;
	}

	select {
		border: 4px solid black;
	}

	h3 {
		text-align: center;
	}

	button,
	select {
		font-family: var(--sans);
	}

	.language-title {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		color: var(--color-fg);
		font-weight: bold;
		font-size: var(--36px);
		margin: 0 0.5rem;
	}
	.controls {
		display: flex;
		gap: 0.5rem;
		justify-content: space-between;
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
	.controls > div:nth-last-child(2) {
		display: flex;
		flex-direction: column;
		align-items: end;
	}

	.animal-faceoff.language2 {
		opacity: 0;
		transform: translateX(20px) translateY(-50%);
		animation: fadeSlideIn 2s ease forwards;
		animation-delay: 0.01s;
		/* animation-timing-function: ease-in; */
	}
	.animal {
		cursor: pointer;
	}
	.animal-faceoff {
		cursor: pointer;
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

	.rows-faceoff {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 22px;
		margin-right: 4rem;
		margin-top: 1rem;
	}

	/* .rows-faceoff {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 22px;
		margin-right: 4rem;
		margin-top: 1rem;
	} */

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
	.portuguese-line {
		width: 95px !important;
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
		padding-right: 5px;
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

	/* .marker .label {
		position: absolute;
		transform: translate(-50%, 50%);
		white-space: nowrap;
		font-size: var(--14px);
		bottom: 104%;
		font-weight: bold;
	} */
	.marker .label {
		top: -2.5rem; /* or a calculated px value */
		transform: translateX(-50%);
		position: absolute;
		white-space: nowrap;
		font-size: var(--14px);
		font-weight: bold;
	}

	.marker .label-off {
		position: absolute;
		transform: translate(-50%, 50%);
		white-space: nowrap;
		font-size: var(--14px);
		bottom: 104.5%;
		font-weight: bold;
	}

	.one-animal-off {
		bottom: 108.5% !important;
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
	.one-animal {
		bottom: 183% !important;
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

	@media (max-width: 600px) {
		h3 {
			font-size: var(--22px);
		}

		.description {
			flex-direction: column;
			gap: 0;
		}

		.controls {
			font-size: var(--18px);
		}

		.controls > div:first-child {
			flex: none;
			width: 100%;
		}

		.grid {
			grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
			grid-auto-rows: 36px;
		}

		.animal {
			margin: -8px;
		}

		.bar-segment:nth-of-type(1) .bar-label,
		.bar-segment:nth-of-type(2) .bar-label {
			transform: translate(0, 50%);
			left: 6px;
		}
	}
</style>
