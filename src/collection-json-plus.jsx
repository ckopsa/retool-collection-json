const MyCustomComponent = ({triggerQuery, model, modelUpdate}) => {
  let fullMode = true;
  let queries = model.cj.collection.queries;
  let commands = model.cj.collection.commands;
  let items = model.cj.collection.items;
  let [loading, setLoading] = React.useState(false);
  let [showApps, setShowApps] = React.useState(false);
  let triggerQueryWithLoading = React.useCallback((...args) => {
    setLoading(true);
    triggerQuery(...args);
  }, [triggerQuery]);

  let httpGet = (e, href) => {
    let currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    if (currentHistory.length > 0) {
      let lastHistory = currentHistory[currentHistory.length - 1];
      if (lastHistory !== href) {
        currentHistory.push(href);
      }
    } else {
      currentHistory.push(href);
    }
    sessionStorage.setItem('historyStack', JSON.stringify(currentHistory));
    sessionStorage.setItem('futureStack', JSON.stringify([]));
    modelUpdate({
      cj: model.cj, form: model.form, link: href
    });
    triggerQueryWithLoading("httpGet")
    e.preventDefault();
    return false;
  };
  let httpQuery = (e, href) => {
    let q = 0
    let form = e.target
    let query = href + '/?'
    let nodes = form.elements
    for (let i = 0, x = nodes.length; i < x; i++) {
      if (nodes[i].name && nodes[i].name !== '' && nodes[i].value && nodes[i].value !== '') {
        if (q++ !== 0) {
          query += "&";
        }
        query += nodes[i].name + "=" + escape(nodes[i].value);
      }
    }
    httpGet(e, query)
    return false
  };

  let httpPost = (e, href) => {
    let form, nodes, data;
    data = [];
    form = e.target;
    nodes = form.elements;
    for (let i = 0, x = nodes.length; i < x; i++) {
      if (nodes[i].name && nodes[i].name !== '') {
        switch (nodes[i].type) {
          case 'checkbox':
            data.push({name: nodes[i].name, value: nodes[i].checked + ""});
            break;
          default:
            data.push({name: nodes[i].name, value: nodes[i].value + ""});
            break;
        }
      }
    }
    e.preventDefault();
    modelUpdate({
      cj: model.cj, link: href, form: {template: {data: data}}
    })
    setTimeout(() => triggerQueryWithLoading(fullMode ? "httpPost" : form.name), 1000)
  };

  let goBack = () => {
    let currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    let href = currentHistory.pop();
    sessionStorage.setItem('historyStack', JSON.stringify(currentHistory));

    let currentFuture = JSON.parse(sessionStorage.getItem('futureStack')) || [];
    currentFuture.push(href);
    sessionStorage.setItem('futureStack', JSON.stringify(currentFuture));

    modelUpdate({
      cj: model.cj, form: model.form, link: href
    });
    triggerQueryWithLoading("httpGet")
  };

  let historyStackIsEmpty = () => {
    let currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    return currentHistory.length === 0;
  };

  let goForward = () => {
    let currentFuture = JSON.parse(sessionStorage.getItem('futureStack')) || [];
    let href = currentFuture.pop();
    sessionStorage.setItem('futureStack', JSON.stringify(currentFuture));

    let currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    currentHistory.push(href);
    sessionStorage.setItem('historyStack', JSON.stringify(currentHistory));

    modelUpdate({
      cj: model.cj, form: model.form, link: href
    });
    triggerQueryWithLoading("httpGet")
  };

  let futureStackIsEmpty = () => {
    let currentFuture = JSON.parse(sessionStorage.getItem('futureStack')) || [];
    return currentFuture.length === 0;
  };

  let queryToComponent = (query, httpFunc) => {
    return (<div className="card p-3">
        <h4>{query.prompt}</h4>
        <form className="" action={query.href} method="POST" name={query.name} onSubmit={e => httpFunc(e, query.href)}>
          {query.data.map(datum => {
            switch (datum.type) {
              case 'select':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <select id={datum.name} name={datum.name} defaultValue={datum.value}
                          className={!!datum.readOnly ? "form-select" : "form-select text-dark"}
                          required={!!datum.required} disabled={!!datum.readOnly}>
                    <option></option>
                    {datum.suggest.map(sug => {
                      return <option value={sug.value}>{sug.text}</option>
                    })}
                  </select>
                </div>
              case 'bool':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="checkbox" id={datum.name} name={datum.name} required={!!datum.required}
                         defaultChecked={datum.value === "true" || false}
                         className="form-check-input" disabled={!!datum.readOnly}/>
                </div>
              case 'date':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="date" id={datum.name} name={datum.name} defaultValue={datum.value || ''}
                         required={!!datum.required}
                         className={!!datum.readOnly ? "form-control" : "form-control text-dark"}
                         disabled={!!datum.readOnly}/>
                </div>
              default:
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="text" id={datum.name} name={datum.name} defaultValue={datum.value || ''}
                         required={!!datum.required}
                         className={!!datum.readOnly ? "form-control" : "form-control text-dark"}
                         disabled={!!datum.readOnly}/>
                </div>
            }

          })}
          <div className="justify-content-end d-flex">
            <input type="submit" value={query.prompt} className="btn btn-primary btn me-3"/>
          </div>
        </form>
      </div>

    )
  };

  return (<div className="h-100 text-body bg-body" data-bs-theme="dark">
    {fullMode && <nav className="navbar navbar-expand-lg rounded">
      <div className="container-fluid">
        <button className="btn" onClick={goBack} hidden={historyStackIsEmpty()}>
          Back
        </button>

        <div className="collapse navbar-collapse justify-content-md-center">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active"
                 href={model.cj.collection.href}
                 onClick={(e) => httpGet(e, model.cj.collection.href)}>
                {model.cj.collection.title}
              </a>
            </li>
            {model.cj.collection.links.filter(link => link.rel.includes('local'))
              .map(link => <li className="nav-item" key={link.name}>
                <a className="nav-link" href={link.href}
                   onClick={(e) => httpGet(e, link.href)}>{link.prompt}</a>
              </li>)}
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button"
                 onClick={() => setShowApps(!showApps)}
              >
                Apps
              </a>
              <ul className={showApps ? "dropdown-menu show" : "dropdown-menu"}>
                {model.cj.collection.links.filter(link => !link.rel.includes('local')).map(l => {
                  return <li key={l.name}>
                    <a className="dropdown-item" href={l.href}
                       onClick={(e) => httpGet(e, l.href)}>{l.prompt}</a>
                  </li>
                })}
              </ul>
            </li>
          </ul>
        </div>

        <button className="btn" onClick={goForward} hidden={futureStackIsEmpty()}>
          Forward
        </button>
      </div>
    </nav>}
    <div className="progress" hidden={!loading}>
      <div className="progress-bar progress-bar-striped progress-bar-animated w-100" role="progressbar"
           aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"/>
    </div>
    <div>
      {model.cj.collection.error && <div className="card bg-danger text-white m-2 p-2"><h4
        className="card-title">{model.cj.collection.error.code} - {model.cj.collection.error.title}</h4>
        <div className="card-body" style={{whiteSpace: "pre-wrap"}}>
          {model.cj.collection.error.message}
        </div>
      </div>}
    </div>
    <div className="row ps-4 w-100 d-flex justify-content-center">
      {fullMode && items.length !== 0 && <div className="col-6">
        {items.map(it => <div className="card p-3 mb-3">
          <ul className="list-group list-group-flush">
            {it.data.map((itData, i) => <li
              name={itData.name}
              className="list-group-item d-flex justify-content-between">
              {itData.prompt}: <span>{itData.value}</span>
            </li>)}
          </ul>
          <div className="card-body">
            {fullMode && it.links && it.links.map((itLink, i) => <a
              href={itLink.href} className="card-link btn btn-primary"
              onClick={(e) => httpGet(e, itLink.href)}>
              {itLink.prompt}
            </a>)}
          </div>
        </div>)}
      </div>}
      {(queries.length !== 0 || commands.length !== 0) && <div className="col-6">
        {queries.map(query => queryToComponent(query, httpQuery))}
        {commands.map(command => queryToComponent(command, httpPost))}
      </div>}
    </div>
  </div>)
}
// This is the entrypoint for the React component.
const ConnectedComponent = Retool.connectReactComponent(MyCustomComponent)
const container = document.getElementById('react')
const root = ReactDOM.createRoot(container)
root.render(<ConnectedComponent/>)