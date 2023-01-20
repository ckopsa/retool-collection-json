"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var MyCustomComponent = function MyCustomComponent(_ref) {
  var triggerQuery = _ref.triggerQuery,
    model = _ref.model,
    modelUpdate = _ref.modelUpdate;
  var fullMode = false;
  var queries = model.cj.collection.queries;
  var commands = model.cj.collection.commands;
  var items = model.cj.collection.items;
  var _React$useState = React.useState(false),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    loading = _React$useState2[0],
    setLoading = _React$useState2[1];
  var _React$useState3 = React.useState(false),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    showApps = _React$useState4[0],
    setShowApps = _React$useState4[1];
  var triggerQueryWithLoading = React.useCallback(function () {
    setLoading(true);
    triggerQuery.apply(void 0, arguments);
  }, [triggerQuery]);
  var httpGet = function httpGet(e, href) {
    var currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    if (currentHistory.length > 0) {
      var lastHistory = currentHistory[currentHistory.length - 1];
      if (lastHistory !== href) {
        currentHistory.push(href);
      }
    } else {
      currentHistory.push(href);
    }
    sessionStorage.setItem('historyStack', JSON.stringify(currentHistory));
    sessionStorage.setItem('futureStack', JSON.stringify([]));
    modelUpdate({
      cj: model.cj,
      form: model.form,
      link: href
    });
    triggerQueryWithLoading("httpGet");
    e.preventDefault();
    return false;
  };
  var httpQuery = function httpQuery(e, href) {
    var q = 0;
    var form = e.target;
    var query = href + '/?';
    var nodes = form.elements;
    for (var i = 0, x = nodes.length; i < x; i++) {
      if (nodes[i].name && nodes[i].name !== '' && nodes[i].value && nodes[i].value !== '') {
        if (q++ !== 0) {
          query += "&";
        }
        query += nodes[i].name + "=" + escape(nodes[i].value);
      }
    }
    httpGet(e, query);
    return false;
  };
  var httpPost = function httpPost(e, href) {
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
      link: href,
      form: {
        template: {
          data: data
        }
      }
    });
    setTimeout(function () {
      return triggerQueryWithLoading(fullMode ? "httpPost" : form.name);
    }, 1000);
  };
  var goBack = function goBack() {
    var currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    var href = currentHistory.pop();
    sessionStorage.setItem('historyStack', JSON.stringify(currentHistory));
    var currentFuture = JSON.parse(sessionStorage.getItem('futureStack')) || [];
    currentFuture.push(href);
    sessionStorage.setItem('futureStack', JSON.stringify(currentFuture));
    modelUpdate({
      cj: model.cj,
      form: model.form,
      link: href
    });
    triggerQueryWithLoading("httpGet");
  };
  var historyStackIsEmpty = function historyStackIsEmpty() {
    var currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    return currentHistory.length === 0;
  };
  var goForward = function goForward() {
    var currentFuture = JSON.parse(sessionStorage.getItem('futureStack')) || [];
    var href = currentFuture.pop();
    sessionStorage.setItem('futureStack', JSON.stringify(currentFuture));
    var currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    currentHistory.push(href);
    sessionStorage.setItem('historyStack', JSON.stringify(currentHistory));
    modelUpdate({
      cj: model.cj,
      form: model.form,
      link: href
    });
    triggerQueryWithLoading("httpGet");
  };
  var futureStackIsEmpty = function futureStackIsEmpty() {
    var currentFuture = JSON.parse(sessionStorage.getItem('futureStack')) || [];
    return currentFuture.length === 0;
  };
  var queryToComponent = function queryToComponent(query, httpFunc) {
    return /*#__PURE__*/React.createElement("div", {
      className: "card p-3"
    }, /*#__PURE__*/React.createElement("h4", null, query.prompt), /*#__PURE__*/React.createElement("form", {
      className: "",
      action: query.href,
      method: "POST",
      name: query.name,
      onSubmit: function onSubmit(e) {
        return httpFunc(e, query.href);
      }
    }, query.data.map(function (datum) {
      switch (datum.type) {
        case 'select':
          return /*#__PURE__*/React.createElement("div", {
            hidden: datum.display === false,
            className: "mb-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "form-label me-2",
            htmlFor: datum.name
          }, datum.prompt, ": "), /*#__PURE__*/React.createElement("select", {
            id: datum.name,
            name: datum.name,
            defaultValue: datum.value,
            className: !!datum.readOnly ? "form-select" : "form-select text-dark",
            required: !!datum.required,
            disabled: !!datum.readOnly
          }, /*#__PURE__*/React.createElement("option", null), datum.suggest.map(function (sug) {
            return /*#__PURE__*/React.createElement("option", {
              value: sug.value
            }, sug.text);
          })));
        case 'bool':
          return /*#__PURE__*/React.createElement("div", {
            hidden: datum.display === false,
            className: "mb-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "form-label me-2",
            htmlFor: datum.name
          }, datum.prompt, ": "), /*#__PURE__*/React.createElement("input", {
            type: "checkbox",
            id: datum.name,
            name: datum.name,
            required: !!datum.required,
            defaultChecked: datum.value === "true" || false,
            className: "form-check-input",
            disabled: !!datum.readOnly
          }));
        case 'date':
          return /*#__PURE__*/React.createElement("div", {
            hidden: datum.display === false,
            className: "mb-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "form-label me-2",
            htmlFor: datum.name
          }, datum.prompt, ": "), /*#__PURE__*/React.createElement("input", {
            type: "date",
            id: datum.name,
            name: datum.name,
            defaultValue: datum.value || '',
            required: !!datum.required,
            className: !!datum.readOnly ? "form-control" : "form-control text-dark",
            disabled: !!datum.readOnly
          }));
        default:
          return /*#__PURE__*/React.createElement("div", {
            hidden: datum.display === false,
            className: "mb-3"
          }, /*#__PURE__*/React.createElement("label", {
            className: "form-label me-2",
            htmlFor: datum.name
          }, datum.prompt, ": "), /*#__PURE__*/React.createElement("input", {
            type: "text",
            id: datum.name,
            name: datum.name,
            defaultValue: datum.value || '',
            required: !!datum.required,
            className: !!datum.readOnly ? "form-control" : "form-control text-dark",
            disabled: !!datum.readOnly
          }));
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "justify-content-end d-flex"
    }, /*#__PURE__*/React.createElement("input", {
      type: "submit",
      value: query.prompt,
      className: "btn btn-primary btn me-3"
    }))));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "h-100 text-body bg-body",
    "data-bs-theme": "dark"
  }, fullMode && /*#__PURE__*/React.createElement("nav", {
    className: "navbar navbar-expand-lg rounded"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: goBack,
    hidden: historyStackIsEmpty()
  }, "Back"), /*#__PURE__*/React.createElement("div", {
    className: "collapse navbar-collapse justify-content-md-center"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "navbar-nav"
  }, /*#__PURE__*/React.createElement("li", {
    className: "nav-item"
  }, /*#__PURE__*/React.createElement("a", {
    className: "nav-link active",
    href: model.cj.collection.href,
    onClick: function onClick(e) {
      return httpGet(e, model.cj.collection.href);
    }
  }, model.cj.collection.title)), model.cj.collection.links.filter(function (link) {
    return link.rel.includes('local');
  }).map(function (link) {
    return /*#__PURE__*/React.createElement("li", {
      className: "nav-item",
      key: link.name
    }, /*#__PURE__*/React.createElement("a", {
      className: "nav-link",
      href: link.href,
      onClick: function onClick(e) {
        return httpGet(e, link.href);
      }
    }, link.prompt));
  }), /*#__PURE__*/React.createElement("li", {
    className: "nav-item dropdown"
  }, /*#__PURE__*/React.createElement("a", {
    className: "nav-link dropdown-toggle",
    id: "navbarDropdown",
    role: "button",
    onClick: function onClick() {
      return setShowApps(!showApps);
    }
  }, "Apps"), /*#__PURE__*/React.createElement("ul", {
    className: showApps ? "dropdown-menu show" : "dropdown-menu"
  }, model.cj.collection.links.filter(function (link) {
    return !link.rel.includes('local');
  }).map(function (l) {
    return /*#__PURE__*/React.createElement("li", {
      key: l.name
    }, /*#__PURE__*/React.createElement("a", {
      className: "dropdown-item",
      href: l.href,
      onClick: function onClick(e) {
        return httpGet(e, l.href);
      }
    }, l.prompt));
  }))))), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: goForward,
    hidden: futureStackIsEmpty()
  }, "Forward"))), /*#__PURE__*/React.createElement("div", {
    className: "progress",
    hidden: !loading
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-bar progress-bar-striped progress-bar-animated w-100",
    role: "progressbar",
    "aria-valuenow": "100",
    "aria-valuemin": "0",
    "aria-valuemax": "100"
  })), /*#__PURE__*/React.createElement("div", null, model.cj.collection.error && /*#__PURE__*/React.createElement("div", {
    className: "card bg-danger text-white m-2 p-2"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "card-title"
  }, model.cj.collection.error.code, " - ", model.cj.collection.error.title), /*#__PURE__*/React.createElement("div", {
    className: "card-body",
    style: {
      whiteSpace: "pre-wrap"
    }
  }, model.cj.collection.error.message))), /*#__PURE__*/React.createElement("div", {
    className: "row ps-4 w-100 d-flex justify-content-center"
  }, items.length !== 0 && /*#__PURE__*/React.createElement("div", {
    className: "col-6"
  }, items.map(function (it) {
    return /*#__PURE__*/React.createElement("div", {
      className: "card p-3 mb-3"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "list-group list-group-flush"
    }, it.data.map(function (itData, i) {
      return /*#__PURE__*/React.createElement("li", {
        name: itData.name,
        className: "list-group-item d-flex justify-content-between"
      }, itData.prompt, ": ", /*#__PURE__*/React.createElement("span", null, itData.value));
    })), /*#__PURE__*/React.createElement("div", {
      className: "card-body"
    }, fullMode && it.links && it.links.map(function (itLink, i) {
      return /*#__PURE__*/React.createElement("a", {
        href: itLink.href,
        className: "card-link btn btn-primary",
        onClick: function onClick(e) {
          return httpGet(e, itLink.href);
        }
      }, itLink.prompt);
    })));
  })), (queries.length !== 0 || commands.length !== 0) && /*#__PURE__*/React.createElement("div", {
    className: "col-6"
  }, queries.map(function (query) {
    return queryToComponent(query, httpQuery);
  }), commands.map(function (command) {
    return queryToComponent(command, httpPost);
  }))));
};
// This is the entrypoint for the React component.
var ConnectedComponent = Retool.connectReactComponent(MyCustomComponent);
var container = document.getElementById('react');
var root = ReactDOM.createRoot(container);
root.render( /*#__PURE__*/React.createElement(ConnectedComponent, null));