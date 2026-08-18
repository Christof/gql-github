import * as React from "react";

class DynamicImport<Component> extends React.Component<
  { load: () => Promise<Component>; children: (c: any) => React.ReactElement | null },
  { component: Component }
> {
  state = {
    component: null as any
  };

  UNSAFE_componentWillMount() {
    this.props.load().then(component => this.setState(() => ({ component })));
  }

  render() {
    return (this.props.children as any)(this.state.component);
  }
}

export function createDynamicImport<P>(
  load: () => Promise<React.ComponentType<P>>
): React.FC<P> {
  return (props: P) => (
    <DynamicImport load={load}>
      {(Component: typeof React.Component) =>
        Component ? <Component {...props} /> : <h1>Loading!</h1>
      }
    </DynamicImport>
  );
}
