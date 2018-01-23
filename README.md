# Reshape Component

This plugin is a minor change to [reshape-include](https://raw.githubusercontent.com/reshape/include) that transfers
node attributes from the `component` tag to the first top-level node in the included file.

For example, the following template:

```html
<component src="components/card.html" id="card1" class="active">
```

The `id` and `class` attributes (any attributes other than `src`) will be copied to the first top-level node in the
`components/card.html` file.
