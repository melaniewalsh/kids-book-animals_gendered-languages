<script>
	import booksData from "$data/dot-plot-books.csv";
	import { scaleLinear } from "d3-scale";
	import _ from "lodash";

	const { id, title, sub, featured_animal } = $props();

	const labelWidth = 92;

	const margin = {
		left: labelWidth + 10,
		right: 0,
		top: 0,
		bottom: 0
	};

	const groupedByAnimal = $derived(() => {
		return groupBy(data, "animal");
	});

	const Colors = {
		Feminine: "var(--color-pink)",
		Masculine: "var(--color-blue)",
		Neuter: "var(--color-gray-200)",
		Varies: "var(--color-gray-200)"
	};

	let oneLine = id === "all";
	let fullWidth = $state(0);
	let chartWidth = $derived(fullWidth - margin.left - margin.right);
	let selectedId = $state(null);

	const xScale = $derived(
		scaleLinear().domain([0, 100]).range([0, chartWidth])
	);
	// slight adjustment to make it more on the line — probably a better way to do this
	const xGet = (d) => +d.proportion_female - 3;
	const xAxisLabels = ["100%", "75%", "Equal", "75%", "100%"];
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

	let tooltipData = $derived(() =>
		booksData.map((d, i) => ({
			...d,
			id: i
		}))
	);

	let hoveredData = $derived(() => {
		return tooltipData.find((d) => d.id === hoveredId);
	});
</script>

<!-- show one animal -->
<figure id={`dot-plot-${id}-${featured_animal}`} class:one-line={oneLine}>
	<h3>{title}</h3>
	{#if sub}<p>{sub}</p>{/if}

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
			{#each tooltipData()
				.filter((d) => d.animal == featured_animal)
				.sort((a, b) => a.Language.localeCompare(b.Language)) as d}
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
		{tooltipData().find((d) => d.id === hoveredId)?.Language || "Not found"}
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
