import { writable } from 'svelte/store';
// export const projects = new writable();

import DomParser from 'dom-parser';
const parser = new DomParser();

let projects;

export async function fetchProjects() {
	if (projects) return projects;

	const allFiles = import.meta.glob('/src/lib/projects/*.html', { as: 'raw' });
	const allProjects = await Promise.all(
		Object.entries(allFiles).map(async ([path, resolver]) => {
			let rawHtml = await resolver();

			// adjust image path
			rawHtml = rawHtml.replaceAll('../../../static', '');

			const dom = parser.parseFromString(rawHtml);

			// remove styles
			const link = dom.getElementsByTagName('link')[0]?.outerHTML;
			rawHtml = rawHtml.replaceAll(link, '');
			const script = dom.getElementsByTagName('script')[0]?.outerHTML;
			rawHtml = rawHtml.replaceAll(script, '');

			// get slug
			const slug = path.split('/').at(-1).replace('.html', '');
			const url = `/work/${slug}`;

			// get header-image
			const headerImagePath = dom.getElementById('header-image')?.getAttribute('src');

			// get title & subtitle
			const title = dom.getElementsByTagName('h1')[0]?.innerHTML;
			const subtitle = dom.getElementsByTagName('h2')[0]?.innerHTML;

			// get content html
			const contentHtml = dom.getElementById('content')?.outerHTML;

			return {
				slug,
				url,
				headerImagePath,
				title,
				subtitle,
				rawHtml,
				contentHtml
			};
		})
	);
	projects = allProjects;
	console.log('🚀 ~ fetchProjects ~ projects:', projects);
	return projects;
}
