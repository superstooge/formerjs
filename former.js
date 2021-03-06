(function () {
  var Former = function(formData, parentEl) {
      this.parentEl = parentEl || document.body;
      this.formObj = {};
      if (typeof formData === 'object') {
          init(formData);
      } else if (typeof formData === 'string') {
          try {
              init(JSON.parse(formData));
          } catch (e) {
              loadData.call(this, formData);
          }
      }

  }


  function loadData(file) {
      var xobj = new XMLHttpRequest();
      xobj.open('GET', file, true);
      xobj.onreadystatechange = function() {
          if (xobj.readyState == 4 && xobj.status == "200") {
              init.call(this, JSON.parse(xobj.responseText));
          }
      }.bind(this);
      xobj.send(null);
  }

  function init(formData) {
      this.struc = formData[0].fields;
      this.formAttributes = formData[0];
      render.call(this);
  }


  function buildFormObj() {
      for (var formAttr in this.formAttributes) {
          if (formAttr === "fields") {
              continue;
          }
          if (this.formAttributes.hasOwnProperty(formAttr)) {
              this.formObj[formAttr] = this.formAttributes[formAttr];
          }
      }
      this.namespace = window[this.formObj.namespace] || window;
  }

  function render() {
      buildFormObj.call(this);
      var nodeParent;
      for (var i = 0; i < this.struc.length; i++) {
          nodeParent = this.parentEl;
          var node;

          switch (this.struc[i].type) {
              case 'select':
                  node = document.createElement("select")
                  for (var j = 0; j < this.struc[i]["fjs-options"].length; j++) {
                      var opt = document.createElement("option")
                      opt.data = this.struc[i]["fjs-options"][j].data;
                      opt.text = this.struc[i]["fjs-options"][j].text;
                      if (this.struc[i]["fjs-options"][j].hasOwnProperty("selected") && this.struc[i]["fjs-options"][j].selected === true) {
                          opt.setAttribute("selected", "selected")
                      }
                      node.appendChild(opt);
                  }
                  break;
              case 'textarea':
                  node = document.createElement("textarea");
                  break;
              case 'label':
                  node = document.createElement("label");
                  break;
              default:
                  node = document.createElement("input");

          }


          var attributesObj = this.struc[i];
          for (var att in attributesObj) {
              if (attributesObj.hasOwnProperty(att) && att.substr(0, 4) !== 'fjs-') {
                  node.setAttribute(att, attributesObj[att]);
              }
          }
          // submit ? add listener
          if (attributesObj.type === "submit") {
              node.addEventListener("click", validate.bind(this));
          }

          // innerHTML defined ?
          if (attributesObj["fjs-content"] !== undefined) {
              node.innerHTML = attributesObj["fjs-content"];
          }


          // node parent element defined ?
          if (attributesObj["fjs-parent"] !== undefined) {
              nodeParent = document.getElementById(attributesObj["fjs-parent"]);
              if (!nodeParent) {
                  console.error("Could not find element with ID", attributesObj["fjs-parent"]);
                  return;
              }
          }

          if (nodeParent.nodeName === 'LABEL') {
              nodeParent.insertBefore(node, nodeParent.firstChild);
          } else {
              nodeParent.appendChild(node);
          }

      }
  }



  function validate(e) {
      e.preventDefault();
      e.stopPropagation();
      var v = true;
      for (var i = 0; i < this.struc.length; i++) {


          var attributesObj = this.struc[i];
          // skip submit and labels
          if (this.struc[i].type.toLowerCase() === 'submit' || this.struc[i].type.toLowerCase() === 'label') {
              continue;
          }
          var item = document.getElementById(this.struc[i].id);
          // skip disabled elements
          if (item.hasAttribute("disabled")) {
              continue;
          }
          if (attributesObj.hasOwnProperty("required")) {

              if (item.value === '' || (item.options && item.selectedIndex === 0)) {
                  v = false;
                  if (attributesObj.hasOwnProperty("fjs-emptyFieldCallBack")) {
                      this.namespace[attributesObj["fjs-emptyFieldCallBack"]](item);
                  }

                  if (stopOnValidationError.call(this)===true) {
                    item.focus();
                    return;
                  }
              }
          }
          if (attributesObj.hasOwnProperty("fjs-validate") && attributesObj["fjs-validate"] !== '') {
              try {
                  v = this.namespace[attributesObj["fjs-validate"]](item);
              } catch (e) {
                  console.error("Error: function", this.namespace + "." + attributesObj["fjs-validate"], "is not defined");
              }
              if (!v && stopOnValidationError.call(this)===true) {
                  return
              }
          }

      }
      if (this.formObj.hasOwnProperty("onValidationComplete")) {
        this.namespace[this.formObj.onValidationComplete](v)
      }
      if (v) {
          submit.call(this);
      }
  }

  function stopOnValidationError() {
    if (this.formObj.hasOwnProperty("haltOnValidationError") && this.formObj.haltOnValidationError===true) {
      return true
    } else if (!this.formObj.hasOwnProperty("haltOnValidationError")){
      return true
    } else {
      return false
    }

  }

  function harvest() {
      var urlEncodedData = "";
      var urlEncodedDataPairs = [];

      for (var i = 0; i < this.struc.length; i++) {
          // skip submit and labels
          if (this.struc[i].type.toLowerCase() === 'submit' || this.struc[i].type.toLowerCase() === 'label') {
              continue;
          }

          var item = document.getElementById(this.struc[i].id);

          // skip disabled elements
          if (item.hasAttribute("disabled")) {
              continue;
          }

          var itemValue = item.value;
          if (this.struc[i].type === 'checkbox' || this.struc[i].type === 'radio') {
              itemValue = item.checked;
          }
          urlEncodedDataPairs.push(encodeURIComponent(this.struc[i]["fjs-fieldName"] || this.struc[i].id) + '=' + encodeURIComponent(itemValue));

      }
      urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
      return urlEncodedData;
  }

  function submit() {
      var data = harvest.call(this);
      var XHR = new XMLHttpRequest();
      XHR.onreadystatechange = function() {
          if (XHR.readyState == 4 && XHR.status == 200) {
              console.log(XHR.responseText);
              if (this.formObj.submitSuccessCallBack !== undefined) {
                  this.namespace[this.formObj.submitSuccessCallBack]();
              }
          } else if (XHR.readyState == 4 && XHR.status >= 400) {
              if (this.formObj.submitErrorCallBack !== undefined) {
                  this.namespace[this.formObj.submitErrorCallBack]();
              }
          }
      }.bind(this)



      XHR.open(this.formObj.method, this.formObj.action);
      XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      XHR.send(data);
  }

  window.Former = Former;

})()
