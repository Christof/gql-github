import * as React from "react";
import { LinearProgress } from "material-ui";

export function triggeredAsyncSwitch<
  P extends object,
  PTriggered extends object
>(
  TriggerComponent: React.ComponentType<P>,
  triggerCallbackKey: keyof P,
  TriggeredComponent: React.ComponentType<PTriggered>,
  Progress: React.ComponentType = LinearProgress
) {
  type Props = Partial<P> & {
    onLoad: (...params: any[]) => Promise<PTriggered>;
  };
  return class TriggeredAsyncSwitch extends React.Component<
    Props,
    {
      triggered: boolean;
      triggeredProps: PTriggered;
    }
  > {
    private ProgressToContent: React.ComponentType<PTriggered | {}>;

    constructor(props: Props) {
      super(props);

      this.state = {
        triggered: false,
        triggeredProps: undefined
      };

      this.ProgressToContent = progressToContentSwitch(
        TriggeredComponent,
        Progress
      );
    }

    createTriggerProperty() {
      return {
        [triggerCallbackKey]: (...params: any[]) => {
          this.setState({ triggered: true });
          this.props
            .onLoad(...params)
            .then(triggeredProps => this.setState({ triggeredProps }));
        }
      };
    }

    render() {
      return (
        <div>
          <TriggerComponent {...this.props} {...this.createTriggerProperty()} />
          {this.state.triggered && (
            <this.ProgressToContent {...this.state.triggeredProps} />
          )}
        </div>
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
