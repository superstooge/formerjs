var Former = function (formData, parentEl){
      this.parentEl = parentEl || document.body;
      this.formObj = {};
      if (typeof formData === 'object') {
        this.init(formData);
      } else if (typeof formData === 'string') {
        try {
            this.init(JSON.parse(formData));
        } catch (e) {
            this.loadData(formData);
        }
      }

}


Former.prototype.loadData = function(file) {
    // console.log("loadData");
    var xobj = new XMLHttpRequest();
    xobj._this = this;
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            this._this.init(JSON.parse(xobj.responseText));
          }
    };
    xobj.send(null);
 }

 Former.prototype.init = function(formData){
   this.struc = formData[0].fields;
   this.formAttributes = formData[0];
   this.render();
 }


Former.prototype.buildFormObj = function(){
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

Former.prototype.render = function(){
  this.buildFormObj();
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
          node.appendChild(opt);
        }
        break;
        case 'textarea':
          node = document.createElement("textarea");
          break;
      default:
        node = document.createElement("input");

    }

    var attributesObj = this.struc[i];
    for (var att in attributesObj) {
      if (attributesObj.hasOwnProperty(att) && att.substr(0,4) !== 'fjs-') {
        node.setAttribute(att, attributesObj[att]);
      }
    }
    // submit ? add listener
    if (attributesObj.type === "submit") {
      node.addEventListener("click", this.validate.bind(this));
    }

    // node parent element defined ?
    if (attributesObj["fjs-parent"] !== undefined) {
      nodeParent = document.getElementById(attributesObj["fjs-parent"]);
      if (!nodeParent) {
        console.error("Could not find element with ID", attributesObj["fjs-parent"]);
        return;
      }
    }

    nodeParent.appendChild(node);
    if (attributesObj.hasOwnProperty("label")) {
      var lab = document.createElement("label");
      lab.innerHTML = attributesObj["label"];
      lab.setAttribute("for", attributesObj["id"])
      nodeParent.appendChild(lab);
      lab.insertBefore(node, lab.firstChild);

      // move class attribute from node to label
      lab.setAttribute("class",node.getAttribute("class"));
      node.setAttribute("class", "")
    }

  }
}



Former.prototype.validate = function(){
  var v = true;
  for (var i = 0; i < this.struc.length; i++) {
    var attributesObj = this.struc[i];
    var item = document.getElementById(this.struc[i].id);
    if (attributesObj.hasOwnProperty("required")) {

      if (item.value === '' || (item.options && item.selectedIndex === 0)) {
        v = false;
        if (attributesObj.hasOwnProperty("fjs-emptyFieldCallBack")) {
          this.namespace[attributesObj["fjs-emptyFieldCallBack"]](item);
        }
        item.focus();
        return;
      }
    }
      if (attributesObj.hasOwnProperty("fjs-validate")) {
        try {
          v = this.namespace[attributesObj["fjs-validate"]](item);
        } catch (e) {
          console.error("Error: function", this.namespace+"."+attributesObj["fjs-validate"], "is not defined");
        }
        if (!v) {
          return
        }
      }

  }
  if (v) {
    this.submit();
  }
}

Former.prototype.harvest = function(){
  var urlEncodedData = "";
  var urlEncodedDataPairs = [];
  for (var i = 0; i < this.struc.length; i++) {
    // skip submit
    if (this.struc[i].type === 'submit') {
      continue;
    }
    var item = document.getElementById(this.struc[i].id);
    var itemValue = item.value;
    if (this.struc[i].type === 'checkbox' || this.struc[i].type === 'radio') {
      itemValue = item.checked;
    }
    urlEncodedDataPairs.push(encodeURIComponent(this.struc[i]["fjs-fieldName"] || this.struc[i].id) + '=' + encodeURIComponent(itemValue));

  }
   urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
   return urlEncodedData;
}

Former.prototype.submit = function(){
  var data = this.harvest();
  var XHR = new XMLHttpRequest();
  XHR._this = this;
  XHR.onreadystatechange = function() {
    if(XHR.readyState == 4 && XHR.status == 200) {
        console.log(XHR.responseText);
        if (this._this.formObj.submitSuccessCallBack !== undefined) {
          this._this.namespace[this._this.formObj.submitSuccessCallBack]();
        }
    } else if (XHR.readyState == 4 && XHR.status >= 400) {
      if (this._this.formObj.submitErrorCallBack !== undefined) {
        this._this.namespace[this._this.formObj.submitErrorCallBack]();
      }
    }
  }



  XHR.open(this.formObj.method, this.formObj.action);
  XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  XHR.send(data);
}
