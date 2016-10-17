# ember-select

Ready to use and extensible select component



## Installation

```bash
ember install ember-select
```


## Usage

Basic example:

```handlebars
{{x-select model=options onSelect=(action 'select')}}
```

Group example (`id` / `name` properties):
```handlebars
{{x-select model=groups value=value
  labelKey='name' valueKey='id'
  dropdown='select-dropdown-group'
  onSelect=(action 'select')}}
```


### Available actions

#### onChange(input)

Fired when input changes.


#### onClear()

Fired when the input was cleared.

Useful when `multiple` is enabled.


#### onCreate(option)

Avaliable when `multiple` is enabled.

Fired when a new option was created.

Note: Setting this will allow the creation of new options.


#### onRemove(option)

Available when `multiple` is enabled.

Fired when an option was removed.


#### onSelect(option, isSelected)

Fired when an option was selected.

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

Default: `select-dropdown`

Accepts: `component`

Dropdown component to be rendered.

For groups use `select-dropdown-group`.


#### freeText

Default: `false`

Accepts: `boolean`

Allow any input set and not just a provided option.


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

Note: IE placeholders are disabled because of a [bug](https://connect.microsoft.com/IE/feedback/details/810538/).


#### value

Default: ``

Accepts: ``, `string`, `option`

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



## License

[MIT License](https://github.com/btecu/ember-cli-bootstrap-datetimepicker/blob/master/LICENSE.md)
