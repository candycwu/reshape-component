# Reshape Component

This plugin is based on [reshape-include](https://github.com/reshape/include) and supports the same functionality.
In addition it provides more component-like paramaterized includes by copying attributes and content from the
`component` tag to the template.

For example, in the following use of `component`:

```html
<component src="components/Card/Card.html" id="card1" class="active"></component>
```

The `id` and `class` attributes will be copied to the first top-level node in the `components/Card/Card.html` file.

## Attributes

* The `src` and `type` attributes are used by the `reshape-component` plugin and will not be copied
* The `class` attribute will be appended to any existing `class` attribute
* All other attributes will be copied

## The `type` attribute

This attribute provides a convenience for specifying component types by a short name, e.g.:

```html
<component type="Card" id="card1" class="active"></component>
```

is equivalent to:

```html
<component src="components/Card/Card.html" id="card1" class="active"></component>
```

The path is configurable in the options passed to the plugin via the `componentPath` property. The default value is:

```
'components/$type/$type.html'
```

Any occurrences of '$type' in the path will be replaced with the value of the `type` attribute.

## Custom tag substitution

Custom tags can be used as placeholders in a template and will be substituted with content from the component.

Card template:
```html
<div class="card">
	<h1><card-title/></h1>
	<div><card-body/></div>
</div>
```

Code that uses the component:
```html
<component type="Card" class="active">
	<card-title><span class="title">My Title</span></card-title>
	<card-body>My Body Content</card-body>
</component>
```

Result:
```html
<div class="card active">
	<h1><span class="title">My Title</span></h1>
	<div>My Body Content</div>
</div>
```
