"use strict";

var MyCustomComponent = function MyCustomComponent(_ref) {
  var triggerQuery = _ref.triggerQuery,
    model = _ref.model,
    modelUpdate = _ref.modelUpdate;
  return /*#__PURE__*/React.createElement("div", null, model.cj.collection.commands.map(function (command) {
    return /*#__PURE__*/React.createElement("div", {
      className: "card p-2"
    }, /*#__PURE__*/React.createElement("h4", null, command.prompt), /*#__PURE__*/React.createElement("form", {
      className: "",
      action: command.href,
      method: "POST",
      onSubmit: function onSubmit(e) {
        var form, nodes, data;
        data = [];
        form = e.target;
        nodes = form.elements;
        for (var i = 0, x = nodes.length; i < x; i++) {
          if (nodes[i].name && nodes[i].name !== '') {
            switch (nodes[i].type) {
              case 'checkbox':
                data.push({
                  name: nodes[i].name,
                  value: nodes[i].checked + ""
                });
                break;
              default:
                data.push({
                  name: nodes[i].name,
                  value: nodes[i].value + ""
                });
                break;
            }
          }
        }
        e.preventDefault();
        modelUpdate({
          cj: model.cj,
          form: {
            template: {
              data: data
            }
          }
        });
        setTimeout(function () {
          return triggerQuery(command.name);
        }, 1000);
      }
    }, command.data.map(function (datum) {
      var container = /*#__PURE__*/React.createElement("div", {
        hidden: datum.display === false,
        className: "mb-3"
      });
      container.appendChild( /*#__PURE__*/React.createElement("label", {
        className: "form-label-sm me-2",
        htmlFor: datum.name
      }, datum.prompt, ": "));
      switch (datum.type) {
        case 'select':
          container.appendChild( /*#__PURE__*/React.createElement("select", {
            id: datum.name,
            name: datum.name,
            value: datum.value,
            className: "form-select-sm"
          }, /*#__PURE__*/React.createElement("option", null), datum.suggest.map(function (sug) {
            return /*#__PURE__*/React.createElement("option", {
              value: sug.value
            }, sug.text);
          })));
          return container;
        case 'bool':
          container.appendChild( /*#__PURE__*/React.createElement("input", {
            type: "checkbox",
            id: datum.name,
            name: datum.name,
            value: datum.value === "true",
            className: "form-check-input-sm"
          }));
          return container;
        case 'date':
          return /*#__PURE__*/React.createElement("div", {
            hidden: datum.display === false,
            className: "mb-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "form-label-sm me-2",
            htmlFor: datum.name
          }, datum.prompt, ": "), /*#__PURE__*/React.createElement("input", {
            type: "date",
            id: datum.name,
            name: datum.name,
            value: datum.value,
            className: "form-control-sm"
          }));
        default:
          return /*#__PURE__*/React.createElement("div", {
            hidden: datum.display === false,
            className: "mb-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "form-label-sm me-2",
            htmlFor: datum.name
          }, datum.prompt, ": "), /*#__PURE__*/React.createElement("input", {
            type: "text",
            id: datum.name,
            name: datum.name,
            value: datum.value,
            className: "form-control-sm"
          }));
      }
    }), /*#__PURE__*/React.createElement("input", {
      type: "submit",
      value: command.prompt,
      className: "btn btn-primary btn-sm"
    })));
  }));
};

// This is the entrypoint for the React component.
var ConnectedComponent = Retool.connectReactComponent(MyCustomComponent);
var container = document.getElementById('react');
var root = ReactDOM.createRoot(container);
root.render( /*#__PURE__*/React.createElement(ConnectedComponent, null));