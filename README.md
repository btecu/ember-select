# ember-select
Minimalistic but ready to use and extensible select component.

<details>
  <summary>Why not use an existing solution?</summary>
  <p>
Existing components either do too much or too little.
I wanted a solution that would work for most cases, while still allows extensibility.

Some issues and dislikes of existing solutions:
 - `ember-select-box`
    * no css, have to style it
    * too abstract, over 50 files
    * multiple ways to do the same (compose, extend, create)
    * api surface very large
 - `ember-cli-selectize`
    * based on a jQuery plugin
    * dependent on bower
    * doesn't work properly with a plain array of objects
    * mutates the model directly
    * style issues (from `selectize`)
    * `selectize` not really maintained anymore
 - `ember-power-select`
    * [huge api surface](https://twitter.com/ember_map/status/761994924724260865)
    * very large payload
    * default style based on `select2` (ugly)
    * does things that do not belong in a select component, such as data fetching


Size is another issue. While the compressed code might not be huge, it's still code that will have to be executed on the client, which is not great for mobile devices.

Size difference based on `Ember 2.8`:

|                       | CSS     | CSS gzip | JS        | JS gzip  | Total gzip | Diff gzip |
|-----------------------|---------|----------|-----------|----------|------------|-----------|
| `ember-select`        | 2.26 KB | 837 B    | 27.63 KB  | 4.82 KB  | 4.83 KB    | -         |
| `ember-select-box`    | 0       | 0        | 47.25 KB  | 6.27 KB  | 6.27 KB    | +30%      |
| `ember-cli-selectize` | 9.06 KB | 1.91 KB  | 56.29 KB  | 16.58 KB | 18.49 KB   | +282%     |
| `ember-power-select`  | 6.07 KB | 1.27 KB  | 160.13 KB | 31.49 KB | 32.76 KB   | +578%     |

```
ember 2.8
 - size-47970b6d059982b357dbe80cc4712d57.js: 3.82 KB (1.15 KB gzipped)
 - size-d41d8cd98f00b204e9800998ecf8427e.css: 0 B
 - vendor-d41d8cd98f00b204e9800998ecf8427e.css: 0 B
 - vendor-e837a5027df7ab84378241e40df98e4f.js: 656.33 KB (175.75 KB gzipped)

ember-select
 - size-2f65552abd00039f0d5bfa9d0e7a7dcf.js: 5.09 KB (1.25 KB gzipped)
 - size-d41d8cd98f00b204e9800998ecf8427e.css: 0 B
 - vendor-26fa5313284eb3f6427de885adb3c822.js: 682.69 KB (180.47 KB gzipped
 - vendor-d76fdb92394f4633584380340f3b47b0.css: 2.26 KB (837 B gzipped)

ember-select-box
 - size-38dd07aa0fc28c4626ab725f96433857.js: 6.93 KB (1.35 KB gzipped)
 - size-d41d8cd98f00b204e9800998ecf8427e.css: 0 B
 - vendor-757f209cd9572d0bb899921420362ed7.js: 700.47 KB (181.82 KB gzipped)
 - vendor-d41d8cd98f00b204e9800998ecf8427e.css: 0 B

ember-selectize
 - size-26011fdbb8d0fc034b02071c70f76ba7.js: 3.95 KB (1.17 KB gzipped)
 - size-d41d8cd98f00b204e9800998ecf8427e.css: 0 B
 - vendor-30d3db96009d4a13d774196e28bf69e8.css: 9.06 KB (1.91 KB gzipped)
 - vendor-daa7db357610f9f28d4cfb83549b150e.js: 712.49 KB (192.31 KB gzipped)

ember-power-select
 - size-45386a78080a4cd7ad90b4ed4482e451.js: 12.14 KB (2.2 KB gzipped)
 - size-d41d8cd98f00b204e9800998ecf8427e.css: 0 B
 - vendor-70bc39ab67910a4925849ff8b9eae5b7.css: 6.07 KB (1.27 KB gzipped)
 - vendor-78b1f73b38fd153fd0c3509e5b2f2376.js: 808.14 KB (206.19 KB gzipped)
 ```
  </p>
</details>

## Installation

```bash
ember install ember-select
```


## Usage
Basic example:

```handlebars
<XSelect @model={{this.options}} @onSelect={{this.select}} />
```

Group example (`id` / `name` properties):
```handlebars
<XSelect
  @dropdown={{this.dropdown}}
  @labelKey="name"
  @model={{this.groups}}
  @value={{this.value}}
  @valueKey="id"
  @onSelect={{this.select}}
/>
```

```js
import SelectDropdownGroup from 'ember-select/components/select-dropdown-group';
```


### Available actions
#### onBlur()
Fired when the input is blurred.

#### onChange(input)
Fired when input changes.

#### onClear()
Fired when the input was cleared.  
Useful when `multiple` is enabled.

#### onCreate(option)
Avaliable when `multiple` is enabled.  
Fired when a new option was created.  
*Note*: Setting this will allow the creation of new options.

#### onRemove(option)
Available when `multiple` is enabled.  
Fired when an option was removed.

#### onSelect(value, option, isSelected)
Fired when an option was selected.  
`value` and `option` are different only when the model is an object.  
`isSelected` is useful if `freeText` is enabled.


### Available options
#### autofocus
Default: `false`  
Accepts: `boolean`  
Sets the focus on the element.

#### canSearch
Default: `true`  
Accepts: `boolean`  
Enable search.  
Disabling will result in a standard `select` dropdown.

#### disabled
Default: `false`  
Accepts: `boolean`  
Disable input.

#### dropdown
Default: `SelectDropdown`  
Accepts: `component`  
Dropdown component to be rendered.  
*Note*: For groups use `SelectDropdownGroup`.

#### freeText
Default: `false`  
Accepts: `boolean`  
Allow any input set and not just a provided option.

#### inputId
Default: _generated_  
Accepts: `string`  
Set the input element `id`.

#### labelKey
Default: `label`  
Accepts: `string`  
The property with the label, for objects.

#### openOnFocus
Default: `false`  
Accepts: `boolean`  
Open the dropdown when input has focus.

#### placeholder
Default: `Type...`  
Accepts: `string`  
Placeholder text to be displayed.  

#### required
Default: `false`  
Accepts: `boolean`  
Revert changes when leaving input if an option wasn't selected.

#### value
Default: empty `string`  
Accepts: `string`, `option`  
Selected value.

#### valueKey
Default: `value`  
Accepts: `string`  
The property with the value, for objects.

#### values
Default: `undefined`  
Accepts: `array`  
Array of selected values.  
Note: Setting this will enable `multiple` selections.


### Model structure
The component accepts both flat and complex (objects) lists.

```js
[
  'Amarillo',
  'Azul',
  'Blanco',
  'Naranja',
  'Negro',
  'Rojo',
  'Rosa',
  'Verde'
]
```

```js
[
  { value: 0, label: 'Alfa Romeo' },
  { value: 1, label: 'Audi' },
  { value: 2, label: 'Citroën' },
  { value: 3, label: 'Fiat' },
  { value: 4, label: 'Opel' },
  { value: 5, label: 'Peugeot' },
  { value: 6, label: 'Seat' },
  { value: 7, label: 'Skoda' }
]
```

```js
[
  { value: 0, label: 'Fruit' },
  { value: 101, label: 'Banana', parentId: 0 },
  { value: 102, label: 'Lemon', parentId: 0 },
  { value: 103, label: 'Orange', parentId: 0},
  { value: 104, label: 'Raspberry', parentId: 0 },
  { value: 1, label: 'Vegetable' },
  { value: 111, label: 'Cucumber', parentId: 1 },
  { value: 112, label: 'Eggplant', parentId: 1 },
  { value: 113, label: 'Garlic', parentId: 1 },
  { value: 114, label: 'Onion', parentId: 1 }
]
```
Note: Groups require a `parentId`.
