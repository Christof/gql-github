import * as React from "react";
import { zipObj } from "ramda";

interface Props<TriggeredProps> {
  renderTrigger(
    triggerCallback: (loadPromise: Promise<TriggeredProps>) => void
  ): JSX.Element;
  renderTriggered(props: TriggeredProps): JSX.Element;
}
interface State<TriggeredProps> {
  triggered: boolean;
  triggeredProps: TriggeredProps;
}

export class TriggeredAsyncSwitch<TriggeredProps> extends React.Component<
  Props<TriggeredProps>,
  State<TriggeredProps>
> {
  constructor(props: Props<TriggeredProps>) {
    super(props);

    this.state = { triggered: false, triggeredProps: undefined };
  }

  private triggerCallback = (loadPromise: Promise<TriggeredProps>) => {
    this.setState({ triggered: true, triggeredProps: undefined });
    loadPromise.then(triggeredProps => this.setState({ triggeredProps }));
  };

  render() {
    return (
      <>
        {this.props.renderTrigger(this.triggerCallback)}
        {this.state.triggered &&
          this.props.renderTriggered(this.state.triggeredProps)}
      </>
    );
  }
}

export class TriggeredAsyncSwitchFromLoadType<
  TypeOfLoad extends (...args: any[]) => any
> extends TriggeredAsyncSwitch<Unpromisify<ReturnType<TypeOfLoad>>> {}

export type Unpromisify<T> = T extends Promise<infer U> ? U : T;
type UnpromisifiedObject<T> = { [k in keyof T]: Unpromisify<T[k]> };

export async function awaitAllProperties<
  T extends { [key: string]: Promise<any> | any }
>(obj: T): Promise<UnpromisifiedObject<T>> {
  const results = await Promise.all(Object.values(obj));

  return zipObj(Object.keys(obj), results) as UnpromisifiedObject<T>;
}
