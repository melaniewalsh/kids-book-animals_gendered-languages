<script>
	import { getContext, onMount } from "svelte";
	import CMS from "$components/helpers/CMS.svelte";
	import Hero from "$components/Hero.svelte";
	import Footer from "$components/Footer.svelte";
	import Ul from "$components/Ul.svelte";
	import Details from "$components/Details.svelte";
	import Swiper from "$components/Swiper.svelte";
	import Figure from "$components/Figure.svelte";
	import DotPlot from "$components/DotPlot.svelte";
	import Table from "$components/Table.svelte";
	import Grid from "$components/Grid.svelte";
	import DotPlotAll from "$components/DotPlotAll.svelte";
	import BarPlot from "$components/BarPlot.svelte";

	import { register } from "swiper/element/bundle";

	const copy = getContext("copy");
	const { body } = copy;
	const { title, description, byline, others } = copy.meta;
	const components = {
		Ul,
		Details,
		Swiper,
		DotPlot,
		Figure,
		Table,
		Grid,
		DotPlotAll,
		BarPlot
	};
	// const data = getContext("data");

	onMount(() => {
		register();
	});
</script>

<article>
	<Hero {title} {description} {byline} {others}></Hero>
	<CMS {body} {components} />
</article>

<svelte:boundary onerror={(e) => console.error(e)}>
	<Footer recirc={true} />
</svelte:boundary>

<style>
</style>
