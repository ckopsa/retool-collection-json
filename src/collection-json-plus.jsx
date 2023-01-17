const MyCustomComponent = ({triggerQuery, model, modelUpdate}) => {
  var [loading, setLoading] = React.useState(false);
  var [showApps, setShowApps] = React.useState(false);
  var triggerQueryWithLoading = React.useCallback((...args) => {
    setLoading(true);
    triggerQuery(...args);
  }, [triggerQuery]);

  var httpGet = (e, href) => {
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
  }

  var httpPost = (e, href) => {
    var form, nodes, data;
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
    setTimeout(() => triggerQueryWithLoading("httpPost"), 1000)
  }

  var goBack = () => {
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
  }

  var historyStackIsEmpty = () => {
    let currentHistory = JSON.parse(sessionStorage.getItem('historyStack')) || [];
    return currentHistory.length === 0;
  }

  var goForward = () => {
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
  }

  var futureStackIsEmpty = () => {
    let currentFuture = JSON.parse(sessionStorage.getItem('futureStack')) || [];
    return currentFuture.length === 0;
  }

  return (<div className="bg-light">
    <nav className="navbar navbar-expand-lg bg-light rounded">
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
            {/*  Dropdown list of nav items for remaining links*/}
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
    </nav>
    <div className="progress" hidden={!loading}>
      <div className="progress-bar progress-bar-striped progress-bar-animated w-100" role="progressbar"
           aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"/>
    </div>
    {model.cj.collection.commands.map(command => <div className="card p-2">
      <h4>{command.prompt}</h4>
      <form className="" action={command.href} method="POST" onSubmit={e => httpPost(e, command.href)}>
        {command.data.map(datum => {
          switch (datum.type) {
            case 'select':
              return <div hidden={datum.display === false} className="mb-3">
                <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                <select id={datum.name} name={datum.name} defaultValue={datum.value} className="form-select-sm"
                        required={!!datum.required} disabled={!!datum.readOnly}>
                  <option></option>
                  {datum.suggest.map(sug => {
                    return <option value={sug.value}>{sug.text}</option>
                  })}
                </select>
              </div>
            case 'bool':
              return <div hidden={datum.display === false} className="mb-3">
                <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                <input type="checkbox" id={datum.name} name={datum.name} required={!!datum.required}
                       defaultChecked={datum.value === "true" || false}
                       className="form-check-input-sm" disabled={!!datum.readOnly}/>
              </div>
            case 'date':
              return <div hidden={datum.display === false} className="mb-3">
                <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                <input type="date" id={datum.name} name={datum.name} defaultValue={datum.value || ''}
                       required={!!datum.required} className="form-control-sm" disabled={!!datum.readOnly}/>
              </div>
            default:
              return <div hidden={datum.display === false} className="mb-3">
                <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                <input type="text" id={datum.name} name={datum.name} defaultValue={datum.value || ''}
                       required={!!datum.required} className="form-control-sm" disabled={!!datum.readOnly}/>
              </div>
          }

        })}
        <input type="submit" value={command.prompt} className="btn btn-primary btn-sm"/>
      </form>
    </div>)}
    <div className="bg-light">
      {model.cj.collection.items.map(it => <div className="card p-2 mb-3">
        <div className="card-body">
          {it.data.map((itData, i) => <p name={itData.name} className="card-text">
            {itData.prompt}: {itData.value}
          </p>)}
          {it.links.map((itLink, i) => <a href={itLink.href} className="card-link btn btn-primary"
                                          onClick={(e) => httpGet(e, itLink.href)}>
            {itLink.prompt}
          </a>)}
        </div>
      </div>)}
    </div>
  </div>)
}
// This is the entrypoint for the React component.
const ConnectedComponent = Retool.connectReactComponent(MyCustomComponent)
const container = document.getElementById('react')
const root = ReactDOM.createRoot(container)
root.render(<ConnectedComponent/>)