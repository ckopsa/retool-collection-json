const MyCustomComponent = ({triggerQuery, model, modelUpdate}) => (
  <div>
    {model.cj.collection.commands.map(command =>
      <div className="card p-5">
        <div className="title-container">
          <h1>{command.prompt}</h1>
        </div>
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
          }).then(() => {
            triggerQuery(command.name)
          });
        }}>
          {/* The text below is dynamic and specified by the model. */}
          {command.data.map(datum => {
            switch (datum.type) {
              case 'select':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label" htmlFor={datum.name}>{datum.prompt}: </label>
                  <select id={datum.name} name={datum.name} value={datum.value} className="form-select">
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
                  <label className="form-label" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="checkbox" id={datum.name} name={datum.name} value={datum.value === "true"}
                         className="form-check-input"/>
                </div>
              case 'date':
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="date" id={datum.name} name={datum.name} value={datum.value} className="form-control"/>
                </div>
              default:
                return <div hidden={datum.display === false} className="mb-3">
                  <label className="form-label" htmlFor={datum.name}>{datum.prompt}: </label>
                  <input type="text" id={datum.name} name={datum.name} value={datum.value} className="form-control"/>
                </div>
            }

          })}
          <input type="submit" value={command.prompt} className="btn btn-primary"/>
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