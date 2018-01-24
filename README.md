# Reshape Component

This plugin is a minor change to [reshape-include](https://raw.githubusercontent.com/reshape/include) that transfers
node attributes from the `component` tag to the first top-level node in the included file.

For example, in the following use of `component`:

```html
<component src="components/card.html" id="card1" class="active"></component>
```

The `id` and `class` attributes (any attributes other than `src`) will be copied to the first top-level node in the
`components/card.html` file.

NOTE: The `class` attribute will be appended to the template's value; other attributes will be over-written.

## Custom tag substitution

Custom tags can be used as placeholders in a template and will be substituted with content from the component.

Component template (`components/card.html`):
```html
<div class="card">
	<h1><card-title/></h1>
	<div><card-body/></div>
</div>
```

Code that uses the component:
```html
<component src="components/card.html" class="active">
	<card-title>My Title</card-title>
	<card-body>My Body Content</card-body>
</component>
```

Result:
```html
<div class="card active">
	<h1>My Title</h1>
	<div>My Body Content</div>
</div>
```
