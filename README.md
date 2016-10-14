# formerjs

FormerJS allows you to automatically build *simple* forms, based on a JSON object descriptor.
The form will be attached to a root element, to be passed to the constructor.
You may also attach every input element of the form to different DOM elements in your page, provided they have a unique id attribute.

### Usage
1. load former.js with a `<script>` tag in your page
2. create an instance of `Former`, passing the source JSON data (file, Object or JSON string) and the root element to attach the form to
    * `var rootElement = document.getElementById("myDivID");`
    * `var f = new Former("form_descriptor.json", rootElement);`

### Sample JSON description
The JSON descriptor object has some mandatory properties and some optional ones.
A minimal setup would require the following:
```
[
  {

    "method":"POST",
    "action":"http://path/to/data/endpoint.php",
    "submitSuccessCallBack":"yourSubmitSuccessFunctionName",
    "submitErrorCallBack":"yourSubmitErrorFunctionName",
    "fields":[
          {
            "id":"name",
            "type":"text"
          },
          {
            "id":"pwd",
            "type":"password"
          },
          {
            "id":"sub",
            "type":"submit",
            "value":"submit"
          }
    ]

  }
]
```

### What does it do?
Once loaded, Former will build the form and add it to the DOM.
Upon submit, Former will:
  1. make a XHR request with the defined `method` to the `action` url
  2. send the *urlencoded* form data to the endpoint (in the key-values pairs, *key* will be the `id` attribute of the input field)
  3. trigger the `submitSuccessCallBack` or the `submitErrorCallBack`, based on the outcome.

**Make sure to define your callbacks and pass their names in the JSON object, in order to trigger the appropriate actions after submittting.**

### Additional properties for the JSON descriptor
In the fields property of the JSON data, every `Object` represents a single `<input>` element.
Every property in the Object will be set as attribute in the element. For instance, the above:
```
        {
            "id":"name",
            "type":"text"
          }
```
generates
```
<input type="text id="name" />
```
Therefore you may add custom CSS classes or any other attribute to the element.
**Example:**
```
        {
            "id":"name",
            "type":"text",
            "class":"myCustomStyle",
            "required":""
          }
```
outputs:
```
<input type="text id="name" class="myCustomStyle" required />
```


### Custom properties for the JSON descriptor
You may add the following special (and optional) properties to the JSON object, inside individual fields objects:

`"fjs-validate":"someFunctionName"` upon submit, the field will be validated invoking `someFunctionName()` (**you will have to define the function in your code**)

`"fjs-parent":"someElementID"` the input element will be attached to the DOM element with `id="someElementID"`, rather than to the one passed in the Former constructor

`"fjs-fieldName":"someName"` upon submit, when form data is collected and urlencoded, `someName` will be used instead of the input `id` attribute, as key in the key-value pair

Custom properties are NOT set as attributes in the generated DOM element.

### What about non-input elements?

#### select element
```
          {
            "id":"mySelect",
            "type":"select",
            "fjs-options":[
              {"data":"", "text":"Choose a product"},
              {"data":"p1", "text":"Product One"},
              {"data":"p2", "text":"Product Two", "selected":true}
            ]
          }
```
To create a select element, specify a `fjs-options` property (array of objects) in your JSON field element.

#### label element
```
          {
            "type":"label",
            "for":"myInputID",
            "fjs-content":"Name"
          }
```
A label element has a `fjs-content` property that defines the label text. You may optionally add an `id` property if you want to append an input element to the label (i.e. checkboxes or radio buttons)

#### textarea
```
          {
            "id":"comment",
            "type":"textarea",
            "rows":"5"
          }
```
Textareas are quite straightforward.

### Inline styles and callbacks
Since every property in the Object will be set as attribute in the element, you may define inline styles and callbacks directly in the JSON Object, as follows:

```
        {
            "id":"name",
            "type":"text",
            "style":"width:100px;height:200px;",
            "onclick":"myOnClickCallback()"
          }
```
generates
```
<input type="text id="name" style="width:100px;height:200px;" onclick="myOnClickCallback()" />
```
This is useful for onFocus/onBlur events or onChange events. If you use this method, you must include the parenthesis in the callback, as in the above example.


### Validating fields
There are two ways of validating a field.

1. **The easy way** (does **NOT** work for checkboxes and radio buttons) is to set a `required` property in your JSON Object and (optionally) a `fjs-emptyFieldCallBack` to invoke a custom function if the field is empty.
```
        {
            "id":"name",
            "type":"text",
            "required":"",
            "fjs-emptyFieldCallBack":"fillName"
          }
```
The above will automatically invoke `fillName()` (defined in your code) and give focus to the input field if it has no value.

2. **The custom way** is to set a `fjs-validate` property in your JSON Object and the name of a custom validation function.
```
        {
            "id":"name",
            "type":"text",
            "fjs-validate":"validateName"
          }
```
When you define `validateName` in your code, keep in mind that it will receive one parameter (a reference to the element being validated) and will have to return either true or false.
```
        function validateName(el) {
          if (el.value === '') {
            alert("please enter a name");
            el.focus();
            return false;
          } else {
            return true;
          }
        }
```

The easy and custom methods *can be used concurrently on the same element*. The library will *first check the easy way* and if validation passes, will proceed to the *custom one*.

### WIP
This is a work in progress, guys. Don't expect it to be perfect or to immediately suit all your needs. It's an experiment, so treat it as such :)
