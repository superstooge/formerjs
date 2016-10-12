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

### What about selects?
```
{
            "id":"mySelect",
            "type":"select",
            "fjs-options":[
              {"data":"", "text":"Choose a product"},
              {"data":"p1", "text":"Product One"},
              {"data":"p2", "text":"Product Two"}
            ]
          }
```
To create a select element, specify a `fjs-options` property (array of objects) in your JSON field element.

### WIP
This is a work in progress, guys. Don't expect it to be perfect or to immediately suit all your needs. It's an experiment, so treat it as such :)
