const MyCustomComponent = ({triggerQuery, model, modelUpdate}) => {
    let fullMode = false;
    let queries = model.cj.collection.queries;
    let commands = model.cj.collection.commands;
    let items = model.cj.collection.items;
    let contextItems = model.cj.collection.items.filter(it => it.rel.includes("context"));
    let normalItems = model.cj.collection.items.filter(it => !it.rel.includes("context"));
    let [loading, setLoading] = React.useState(false);
    let triggerQueryWithLoading = React.useCallback((...args) => {
        setLoading(true);
        triggerQuery(...args);
    }, [triggerQuery]);

    React.useEffect(() => {
        if (contextItems.length > 0)
            document.getElementById("contextButton").click()
    }, [contextItems])

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
        let query = href + '?'
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
        setTimeout(() => triggerQueryWithLoading("httpPost"), 1000)
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

    const Query = ({query, httpFunc}) => {
        let [formData, setFormData] = React.useState(new Map());
        let [suggests, setSuggests] = React.useState(new Map());
        React.useEffect(() => {
            query.data.filter(datum => datum.type === "select").forEach(datum => {
                suggests.set(datum.name, datum.suggest);
                setSuggests(new Map(suggests));
            })
            query.data.forEach(datum => {
                formData.set(datum.name, datum.value);
                setFormData(new Map(formData));
            })
        }, [])
        React.useEffect(() => {
            query.data.filter(datum => datum.type === "select").forEach(datum => {
                suggests.set(datum.name, datum.suggest.filter(sug => {
                    if (sug.filterName) {
                        return formData.get(sug.filterName) === sug.filterValue;
                    }
                    return true;
                }));
                setSuggests(new Map(suggests));
            })
        }, [formData])

        return (<div className="card p-3">
                <h4>{query.prompt}</h4>
                <form className="" action={query.href} method="POST" name={query.name}
                      onSubmit={e => httpFunc(e, query.href)}>
                    {query.data.map(datum => {
                        switch (datum.type) {
                            case 'select':
                                return <div hidden={datum.display === false} className="mb-3">
                                    <label className="form-label me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                                    <select id={datum.name} name={datum.name} defaultValue={datum.value}
                                            value={formData.get(datum.name)}
                                            className={!!datum.readOnly ? "form-select" : "form-select text-dark"}
                                            onChange={e => {
                                                formData.set(e.target.name, e.target.value);
                                                return setFormData(new Map(formData));
                                            }}
                                            required={!!datum.required} disabled={!!datum.readOnly}>
                                        <option></option>
                                        {suggests.get(datum.name) && suggests.get(datum.name).map(sug => {
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
                                    <input type="date" id={datum.name} name={datum.name}
                                           defaultValue={datum.value || ''}
                                           required={!!datum.required}
                                           className={!!datum.readOnly ? "form-control" : "form-control text-dark"}
                                           disabled={!!datum.readOnly}/>
                                </div>
                            default:
                                return <div hidden={datum.display === false} className="mb-3">
                                    <label className="form-label me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                                    <input type="text" id={datum.name} name={datum.name}
                                           defaultValue={datum.value || ''}
                                           required={!!datum.required}
                                           className={!!datum.readOnly ? "form-control" : "form-control text-dark"}
                                           disabled={!!datum.readOnly}/>
                                </div>
                        }

                    })}
                    <div className="justify-content-end d-flex">
                        <input disabled={loading} type="submit" value={query.prompt}
                               className="btn btn-primary btn me-3"/>
                    </div>
                </form>
            </div>

        )
    };

    const ItemCard = ({item}) => {
        if (item.rel.includes("items-title")) {
            return <div className="row py-3">
                <div className="col">
                    <h2>{item.data[0].value}</h2>
                    <hr/>
                </div>
            </div>
        }
        return <div className="card p-3 mb-3">
            <ul className="list-group list-group-flush">
                {item.data.map((itData, i) => <li
                    name={itData.name}
                    hidden={itData.display === "false"}
                    className="list-group-item d-flex justify-content-between">
                    {itData.prompt}: <span>{itData.value}</span>
                </li>)}
            </ul>
            <div className="card-body">
                {item.links && (item.links.length < 3 ? item.links.map((itLink, i) => <a
                    href={itLink.href} className="card-link btn btn-primary"
                    onClick={(e) => httpGet(e, itLink.href)}>
                    {itLink.prompt}
                </a>) : <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                        Actions
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        {item.links.map((itLink, i) => <li>
                            <a className="dropdown-item" href={itLink.href}
                               onClick={(e) => httpGet(e, itLink.href)}>{itLink.prompt}</a>
                        </li>)}
                    </ul>
                </div>)}
            </div>
        </div>;
    }

    return <div className="text-body bg-body">
        <div className="row">
            <div className="col">
                <button className="btn" onClick={goBack} hidden={historyStackIsEmpty()}>
                    ⬅️
                </button>
                <a className="btn"
                   href={model.cj.collection.href}
                   onClick={(e) => httpGet(e, model.cj.collection.href)}>
                    🔃
                </a>
                <button className="btn" onClick={goForward} hidden={futureStackIsEmpty()}>
                    ➡️
                </button>

            </div>
            {contextItems.length > 0 && <div className="col-auto">
                <button className="btn" type="button" data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasScrolling" id="contextButton">
                    ❓
                </button>

                <div className="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false"
                     tabIndex="-1"
                     id="offcanvasScrolling">
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="offcanvasScrollingLabel">Context</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="offcanvas"></button>
                    </div>
                    <div className="offcanvas-body">
                        {contextItems.map(it => <ItemCard item={it}/>)}
                    </div>
                </div>
            </div>}
        </div>
        <nav className="navbar navbar-expand-lg rounded">
            <div className="container-fluid">
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav">
                        {model.cj.collection.links.filter(link => link.rel.includes('local'))
                            .map(link => <li className="nav-item" key={link.name}>
                                <a className={"nav-link " + link.rel} href={link.href}
                                   onClick={(e) => httpGet(e, link.href)}>{link.prompt}</a>
                            </li>)}
                        {fullMode && <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" id="navbarDropdown" role="button"
                               data-bs-toggle="dropdown">
                                Apps
                            </a>
                            <ul className="dropdown-menu">
                                {model.cj.collection.links.filter(link => !link.rel.includes('local')).map(l => {
                                    return <li key={l.name}>
                                        <a className={"dropdown-item " + l.rel} href={l.href}
                                           onClick={(e) => httpGet(e, l.href)}>{l.prompt}</a>
                                    </li>
                                })}
                            </ul>
                        </li>}
                    </ul>
                </div>

            </div>
        </nav>
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
            {items.length !== 0 && <div className="col-6">
                {normalItems.map(it => <ItemCard item={it}/>)}
            </div>}
            {(queries.length !== 0 || commands.length !== 0) && <div className="col-6">
                <div className="mb-3">
                    {queries.map(query => <Query query={query} httpFunc={httpQuery}/>)}
                </div>
                <div className="mb-3">
                    {commands.map(query => <Query query={query} httpFunc={httpPost}/>)}
                </div>
            </div>}
        </div>
    </div>
}
// This is the entrypoint for the React component.
const ConnectedComponent = Retool.connectReactComponent(MyCustomComponent)
const container = document.getElementById('react')
const root = ReactDOM.createRoot(container)
root.render(<ConnectedComponent/>)