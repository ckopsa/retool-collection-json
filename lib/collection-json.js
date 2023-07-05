"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var MyCustomComponent = function MyCustomComponent(_ref) {
  var triggerQuery = _ref.triggerQuery,
    model = _ref.model,
    modelUpdate = _ref.modelUpdate;
  var fullMode = false;
  var queries = model.cj.collection.queries;
  var commands = model.cj.collection.commands;
  var items = model.cj.collection.items;
  var contextItems = model.cj.collection.items.filter(function (it) {
    return it.rel.includes("context");
  });
  var normalItems = model.cj.collection.items.filter(function (it) {
    return !it.rel.includes("context") && !it.table;
  });
  var _React$useState = React.useState(model.loading),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    loading = _React$useState2[0],
    setLoading = _React$useState2[1];
  var _React$useState3 = React.useState(new Map()),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    tableItems = _React$useState4[0],
    setTableItems = _React$useState4[1];
  var triggerQueryWithLoading = React.useCallback(function () {
    triggerQuery.apply(void 0, arguments);
  }, [triggerQuery]);
  React.useEffect(function () {
    setLoading(model.loading);
  }, [model.loading]);
  React.useEffect(function () {
    if (contextItems.length > 0) document.getElementById("contextButton").click();
  }, [contextItems]);
  React.useEffect(function () {
    // multimap of table items
    var newTableItems = new Map();
    items.filter(function (it) {
      return it.table;
    }).forEach(function (it) {
      if (!newTableItems.has(it.table)) {
        newTableItems.set(it.table, []);
      }
      newTableItems.get(it.table).push(it);
    });
    setTableItems(newTableItems);
  }, [items]);
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
      link: href,
      loading: true
    });
    triggerQueryWithLoading("httpGet");
    e.preventDefault();
    return false;
  };
  var httpQuery = function httpQuery(e, href) {
    var q = 0;
    var form = e.target;
    var query = href + '?';
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
      return triggerQueryWithLoading("httpPost");
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
  var Query = function Query(_ref2) {
    var query = _ref2.query,
      httpFunc = _ref2.httpFunc;
    var _React$useState5 = React.useState(new Map()),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      formData = _React$useState6[0],
      setFormData = _React$useState6[1];
    var _React$useState7 = React.useState(new Map()),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      suggests = _React$useState8[0],
      setSuggests = _React$useState8[1];
    React.useEffect(function () {
      query.data.filter(function (datum) {
        return datum.type === "select";
      }).forEach(function (datum) {
        suggests.set(datum.name, datum.suggest);
        setSuggests(new Map(suggests));
      });
      query.data.forEach(function (datum) {
        formData.set(datum.name, datum.value);
        setFormData(new Map(formData));
      });
    }, []);
    React.useEffect(function () {
      query.data.filter(function (datum) {
        return datum.type === "select";
      }).forEach(function (datum) {
        suggests.set(datum.name, datum.suggest.filter(function (sug) {
          if (sug.filterName) {
            return formData.get(sug.filterName) === sug.filterValue;
          }
          return true;
        }));
        setSuggests(new Map(suggests));
      });
    }, [formData]);
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
            value: formData.get(datum.name),
            className: "form-select",
            onChange: function onChange(e) {
              formData.set(e.target.name, e.target.value);
              return setFormData(new Map(formData));
            },
            required: !!datum.required,
            disabled: !!datum.readOnly
          }, /*#__PURE__*/React.createElement("option", null), suggests.get(datum.name) && suggests.get(datum.name).map(function (sug) {
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
            defaultChecked: !!datum.value && datum.value.toLowerCase() === "true",
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
            className: "form-control" + (datum.readOnly ? "-plaintext" : ""),
            readOnly: !!datum.readOnly
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
            className: "form-control" + (datum.readOnly ? "-plaintext" : ""),
            readOnly: !!datum.readOnly
          }));
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "justify-content-end d-flex"
    }, /*#__PURE__*/React.createElement("input", {
      disabled: loading,
      type: "submit",
      value: query.prompt,
      className: "btn btn-primary btn me-3"
    }))));
  };
  var ItemCard = function ItemCard(_ref3) {
    var item = _ref3.item,
      id = _ref3.id;
    var categoryItemData = item.data.filter(function (datum) {
      return !!datum.category;
    });
    var noCategoryItemData = item.data.filter(function (datum) {
      return !datum.category;
    });
    var _React$useState9 = React.useState(new Map()),
      _React$useState10 = _slicedToArray(_React$useState9, 2),
      categoryData = _React$useState10[0],
      setCategoryData = _React$useState10[1];
    React.useEffect(function () {
      // Store category data in multimap with category name as key
      var categoryData = new Map();
      categoryItemData.forEach(function (datum) {
        if (!categoryData.has(datum.category)) {
          categoryData.set(datum.category, []);
        }
        categoryData.get(datum.category).push(datum);
      });
      setCategoryData(categoryData);
    }, [item]);
    if (item.rel.includes("items-title")) {
      return /*#__PURE__*/React.createElement("div", {
        className: "row py-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "col"
      }, /*#__PURE__*/React.createElement("h2", null, item.data[0].value), /*#__PURE__*/React.createElement("hr", null)));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "card mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "card-body"
    }, /*#__PURE__*/React.createElement("ul", {
      className: "card-text list-group list-group-flush"
    }, noCategoryItemData.map(function (itData) {
      var displayTag = itData.display === "false" ? " d-none" : "";
      return /*#__PURE__*/React.createElement("li", {
        name: itData.name,
        hidden: itData.display === "false",
        className: "list-group-item d-flex justify-content-between" + displayTag
      }, /*#__PURE__*/React.createElement("span", {
        className: "me-2"
      }, itData.prompt, ":"), " ", /*#__PURE__*/React.createElement("span", null, itData.value));
    }), categoryItemData.length > 0 && /*#__PURE__*/React.createElement("div", null, Array.from(categoryData).map(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
        category = _ref5[0],
        itemData = _ref5[1];
      var categoryName = "".concat(category.replace(/\s/g, '')).concat(id);
      return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
        className: "list-group-item d-flex w-100 border-0 justify-content-between",
        type: "button",
        "data-bs-toggle": "collapse",
        "data-bs-target": "#collapse".concat(categoryName)
      }, /*#__PURE__*/React.createElement("span", null, category, " - ", itemData.length), " ", /*#__PURE__*/React.createElement("span", null, "\uD83D\uDC47")), /*#__PURE__*/React.createElement("div", {
        id: "collapse".concat(categoryName),
        className: "collapse"
      }, /*#__PURE__*/React.createElement("ul", {
        className: "list-group list-group-flush"
      }, itemData.map(function (itData) {
        var displayTag = itData.display === "false" ? " d-none" : "";
        return /*#__PURE__*/React.createElement("li", {
          name: itData.name,
          hidden: itData.display === "false",
          className: "list-group-item d-flex justify-content-between" + displayTag
        }, /*#__PURE__*/React.createElement("span", {
          className: "me-2"
        }, itData.prompt, ":"), /*#__PURE__*/React.createElement("span", null, itData.value));
      }))));
    }))), item.links && (item.links.length < 3 ? item.links.map(function (itLink, i) {
      return /*#__PURE__*/React.createElement("a", {
        href: itLink.href,
        className: "ms-2 btn btn-primary float-end",
        onClick: function onClick(e) {
          return httpGet(e, itLink.href);
        }
      }, itLink.prompt);
    }) : /*#__PURE__*/React.createElement("div", {
      className: "dropdown float-end"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-secondary dropdown-toggle",
      type: "button",
      "data-bs-toggle": "dropdown",
      "aria-expanded": "false"
    }, "Actions"), /*#__PURE__*/React.createElement("ul", {
      className: "dropdown-menu",
      "aria-labelledby": "dropdownMenuButton"
    }, item.links.map(function (itLink, i) {
      return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
        className: "dropdown-item",
        href: itLink.href,
        onClick: function onClick(e) {
          return httpGet(e, itLink.href);
        }
      }, itLink.prompt));
    }))))));
  };
  function ItemsTable(_ref6) {
    var tableName = _ref6.tableName,
      tableItems = _ref6.tableItems;
    var codeTableName = tableName.replace(/ /g, '');
    var _React$useState11 = React.useState(-1),
      _React$useState12 = _slicedToArray(_React$useState11, 2),
      selectedRow = _React$useState12[0],
      setSelectedRow = _React$useState12[1];
    return /*#__PURE__*/React.createElement("div", {
      id: "".concat(codeTableName, "-table"),
      className: "card p-3 mb-3"
    }, /*#__PURE__*/React.createElement("h2", null, tableName), /*#__PURE__*/React.createElement("div", {
      className: "overflow-auto",
      style: {
        maxHeight: '500px'
      }
    }, /*#__PURE__*/React.createElement("table", {
      className: "table table-sm"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      scope: "col"
    }, "#"), tableItems[0].data.map(function (d) {
      return /*#__PURE__*/React.createElement("th", {
        hidden: d.display === "false",
        scope: "col"
      }, d.prompt);
    }))), /*#__PURE__*/React.createElement("tbody", null, tableItems.map(function (item, i) {
      var displayTag = item.display === "false" ? " d-none" : "";
      return /*#__PURE__*/React.createElement("tr", {
        "data-bs-toggle": "collapse",
        className: (selectedRow === i ? "table-active" : "") + displayTag,
        onClick: function onClick() {
          return setSelectedRow(i === selectedRow ? -1 : i);
        },
        "data-bs-target": "#".concat(codeTableName, "-").concat(i, "-collapse")
      }, /*#__PURE__*/React.createElement("th", {
        scope: "row"
      }, i + 1), item.data.map(function (d) {
        return /*#__PURE__*/React.createElement("td", {
          hidden: d.display === "false"
        }, d.value);
      }));
    })))), tableItems.map(function (item, i) {
      return /*#__PURE__*/React.createElement("div", {
        id: "".concat(codeTableName, "-").concat(i, "-collapse"),
        className: "w-100 collapse",
        "data-bs-parent": "#".concat(codeTableName, "-table")
      }, item.links && (item.links.length < 4 ? item.links.map(function (itLink, i) {
        return /*#__PURE__*/React.createElement("a", {
          href: itLink.href,
          className: "btn btn-primary btn float-end ms-2",
          onClick: function onClick(e) {
            return httpGet(e, itLink.href);
          }
        }, itLink.prompt);
      }) : /*#__PURE__*/React.createElement("div", {
        className: "dropdown float-end"
      }, /*#__PURE__*/React.createElement("button", {
        className: "btn btn-secondary dropdown-toggle btn",
        type: "button",
        "data-bs-toggle": "dropdown",
        "aria-expanded": "false"
      }, "Actions"), /*#__PURE__*/React.createElement("ul", {
        className: "dropdown-menu",
        "aria-labelledby": "dropdownMenuButton"
      }, item.links.map(function (itLink, i) {
        return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("a", {
          className: "dropdown-item",
          href: itLink.href,
          onClick: function onClick(e) {
            return httpGet(e, itLink.href);
          }
        }, itLink.prompt));
      })))));
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "text-body bg-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "row w-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col",
    hidden: !fullMode
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: goBack,
    hidden: historyStackIsEmpty()
  }, "\u2B05\uFE0F"), /*#__PURE__*/React.createElement("a", {
    className: "btn",
    href: model.cj.collection.href,
    onClick: function onClick(e) {
      return httpGet(e, model.cj.collection.href);
    }
  }, "\uD83D\uDD03"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: goForward,
    hidden: futureStackIsEmpty()
  }, "\u27A1\uFE0F")), contextItems.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "col-auto"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    type: "button",
    "data-bs-toggle": "offcanvas",
    "data-bs-target": "#offcanvasScrolling",
    id: "contextButton"
  }, "\u2753"), /*#__PURE__*/React.createElement("div", {
    className: "offcanvas offcanvas-end",
    "data-bs-scroll": "true",
    "data-bs-backdrop": "false",
    tabIndex: "-1",
    id: "offcanvasScrolling"
  }, /*#__PURE__*/React.createElement("div", {
    className: "offcanvas-header"
  }, /*#__PURE__*/React.createElement("h5", {
    className: "offcanvas-title",
    id: "offcanvasScrollingLabel"
  }, "Context"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn-close",
    "data-bs-dismiss": "offcanvas"
  })), /*#__PURE__*/React.createElement("div", {
    className: "offcanvas-body"
  }, contextItems.map(function (it, i) {
    return /*#__PURE__*/React.createElement(ItemCard, {
      item: it,
      id: "context".concat(i)
    });
  }))))), /*#__PURE__*/React.createElement("nav", {
    className: "navbar navbar-expand-lg rounded"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container-fluid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "collapse navbar-collapse"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "navbar-nav"
  }, model.cj.collection.links.filter(function (link) {
    return link.rel.includes('local');
  }).map(function (link) {
    return /*#__PURE__*/React.createElement("li", {
      className: "nav-item",
      key: link.name
    }, /*#__PURE__*/React.createElement("a", {
      className: "nav-link " + link.rel,
      href: link.href,
      onClick: function onClick(e) {
        return httpGet(e, link.href);
      }
    }, link.prompt));
  }), fullMode && /*#__PURE__*/React.createElement("li", {
    className: "nav-item dropdown"
  }, /*#__PURE__*/React.createElement("a", {
    className: "nav-link dropdown-toggle",
    id: "navbarDropdown",
    role: "button",
    "data-bs-toggle": "dropdown"
  }, "Apps"), /*#__PURE__*/React.createElement("ul", {
    className: "dropdown-menu"
  }, model.cj.collection.links.filter(function (link) {
    return !link.rel.includes('local');
  }).map(function (l) {
    return /*#__PURE__*/React.createElement("li", {
      key: l.name
    }, /*#__PURE__*/React.createElement("a", {
      className: "dropdown-item " + l.rel,
      href: l.href,
      onClick: function onClick(e) {
        return httpGet(e, l.href);
      }
    }, l.prompt));
  }))))))), /*#__PURE__*/React.createElement("div", {
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
  }, Array.from(tableItems).map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
      tableName = _ref8[0],
      tableItems = _ref8[1];
    return /*#__PURE__*/React.createElement(ItemsTable, {
      tableName: tableName,
      tableItems: tableItems
    });
  }), normalItems.map(function (it, i) {
    return /*#__PURE__*/React.createElement(ItemCard, {
      item: it,
      id: "normal".concat(i)
    });
  })), (queries.length !== 0 || commands.length !== 0) && /*#__PURE__*/React.createElement("div", {
    className: "col-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, queries.map(function (query) {
    return /*#__PURE__*/React.createElement(Query, {
      query: query,
      httpFunc: httpQuery
    });
  })), /*#__PURE__*/React.createElement("div", {
    className: "mb-3"
  }, commands.map(function (query) {
    return /*#__PURE__*/React.createElement(Query, {
      query: query,
      httpFunc: httpPost
    });
  })))));
};
// This is the entrypoint for the React component.
var ConnectedComponent = Retool.connectReactComponent(MyCustomComponent);
var container = document.getElementById('react');
var root = ReactDOM.createRoot(container);
root.render( /*#__PURE__*/React.createElement(ConnectedComponent, null));