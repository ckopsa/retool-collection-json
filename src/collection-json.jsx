const MyCustomComponent = ({triggerQuery, model, modelUpdate}) => (
  <div>
    {model.cj.collection.commands.map(command =>
      <div className="card p-2">
        <h4>{command.prompt}</h4>
        <form className="" action={command.href} method="POST" onSubmit={(e) => {
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
            cj: model.cj,
            form: {template: {data: data}}
          })
          setTimeout(() => triggerQuery(command.name), 1000)
        }}>
          {command.data.map(datum => {
            switch (datum.type) {
              case 'select':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <select id={datum.name} name={datum.name} defaultValue={datum.value} className="form-select-sm"
                          disabled={!!datum.readOnly}>
                    <option></option>
                    {
                      datum.suggest.map(sug => {
                        return <option value={sug.value}>{sug.text}</option>
                      })
                    }
                  </select>
                </div>
              case 'bool':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="checkbox" id={datum.name} name={datum.name}
                         defaultChecked={datum.value === "true" || false}
                         className="form-check-input-sm" disabled={!!datum.readOnly}/>
                </div>
              case 'date':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="date" id={datum.name} name={datum.name} defaultValue={datum.value || ''}
                         className="form-control-sm" disabled={!!datum.readOnly}/>
                </div>
              default:
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label-sm me-2" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="text" id={datum.name} name={datum.name} defaultValue={datum.value || ''}
                         className="form-control-sm" disabled={!!datum.readOnly}/>
                </div>
            }

          })}
          <input type="submit" value={command.prompt} className="btn btn-primary btn-sm"/>
        </form>
      </div>
    )}
  </div>
)

// This is the entrypoint for the React component.
const ConnectedComponent = Retool.connectReactComponent(MyCustomComponent)
const container = document.getElementById('react')
const root = ReactDOM.createRoot(container)
root.render(<ConnectedComponent/>)