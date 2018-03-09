import * as React from "react";

class DynamicImport<Component> extends React.Component<
  { load: () => Promise<Component> },
  { component: Component }
> {
  state = {
    component: null as any
  };

  componentWillMount() {
    this.props.load().then(component => this.setState(() => ({ component })));
  }

  render() {
    return (this.props.children as any)(this.state.component);
  }
}

export function createDynamicImport(load: () => Promise<any>) {
  return (props: any) => (
    <DynamicImport load={load}>
      {(Component: any) =>
        Component === null ? <h1>Loading!</h1> : <Component {...props} />
      }
    </DynamicImport>
  );
}
