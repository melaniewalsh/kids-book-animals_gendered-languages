<script>
	import { setContext } from "svelte";
	import { browser } from "$app/environment";
	import Meta from "$components/Meta.svelte";
	import Index from "$components/Index.svelte";
	import copy from "$data/copy.json";
	import version from "$utils/version.js";

	let { data } = $props();

	version();

	const preloadFont = [
		"https://fonts.gstatic.com/s/baloobhai2/v29/sZlDdRSL-z1VEWZ4YNA7Y5IHbd7nqn5wFOxu.woff2",
		"https://fonts.gstatic.com/s/baloobhai2/v29/sZlDdRSL-z1VEWZ4YNA7Y5IHed7nqn5wFOxu.woff2",
		"https://fonts.gstatic.com/s/fredoka/v16/X7n64b87HvSqjb_WIi2yDCRwoQ_k7367_DWs89XgHPyhRMw.woff2"
	];

	const { title, description, url, keywords } = copy.meta;
	setContext("copy", copy);
	setContext("data", data);

	$effect(() => {
		document.addEventListener("click", (e) => {
			if (e.target.tagName === "A" && e.target.hash) {
				const target = document.querySelector(e.target.hash);
				const details = target?.closest("details");
				if (details && !details.open) {
					details.open = true;
				}
				target.scrollIntoView();
			}
		});
	});
</script>

<Meta {title} {description} {url} {preloadFont} {keywords} />
<Index />
