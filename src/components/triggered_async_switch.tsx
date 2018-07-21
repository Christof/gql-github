import * as React from "react";
import { LinearProgress } from "material-ui";
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

export function triggeredAsyncSwitch<
  P extends object,
  PTriggered extends object
>(
  TriggerComponent: React.ComponentType<P>,
  triggerCallbackKey: keyof P,
  TriggeredComponent: React.ComponentType<PTriggered>
) {
  type Props = Partial<P> & {
    onLoad: (...params: any[]) => Promise<PTriggered>;
  };

  interface State {
    triggered: boolean;
    triggeredProps: PTriggered;
  }

  return class TriggeredAsyncSwitch extends React.Component<Props, State> {
    constructor(props: Props) {
      super(props);

      this.state = {
        triggered: false,
        triggeredProps: undefined
      };
    }

    trigger(...params: any[]) {
      this.setState({ triggered: true, triggeredProps: undefined });
      this.props
        .onLoad(...params)
        .then(triggeredProps => this.setState({ triggeredProps }));
    }

    render() {
      return (
        <>
          <TriggerComponent
            {...this.props}
            {...{ [triggerCallbackKey]: this.trigger.bind(this) }}
          />
          {this.state.triggered && (
            <TriggeredComponent {...this.state.triggeredProps} />
          )}
        </>
      );
    }
  };
}

export function progressToContentSwitch<P extends object>(
  ContentComponent: React.ComponentType<P>,
  Progress: React.ComponentType = LinearProgress
) {
  return class ProgressToContentSwitch extends React.Component<P | {}, {}> {
    render() {
      return Object.keys(this.props).length === 0 ? (
        <Progress />
      ) : (
        <ContentComponent {...this.props} />
      );
    }
  };
}

export function container<PContainer extends object, PContainee extends object>(
  Container: React.ComponentType<PContainer>,
  containerProps: PContainer,
  Containee: React.ComponentType<PContainee>
) {
  return (props: PContainee) => (
    <Container {...containerProps}>
      <Containee {...props} />
    </Container>
  );
}

export type Unpromisify<T> = T extends Promise<infer U> ? U : T;
type UnpromisifiedObject<T> = { [k in keyof T]: Unpromisify<T[k]> };

export async function awaitAllProperties<
  T extends { [key: string]: Promise<any> | any }
>(obj: T): Promise<UnpromisifiedObject<T>> {
  const results = await Promise.all(Object.values(obj));

  return zipObj(Object.keys(obj), results) as UnpromisifiedObject<T>;
}
