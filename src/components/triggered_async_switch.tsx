import * as React from "react";
import { LinearProgress } from "material-ui";
import { Section } from "./section";

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
  return class extends React.Component<
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

      this.ProgressToContent = progressToContentSwitch(TriggeredComponent);
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
            <Section heading="Stats">
              <this.ProgressToContent {...this.state.triggeredProps} />
            </Section>
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
  return class extends React.Component<P | {}, {}> {
    render() {
      return Object.keys(this.props).length === 0 ? (
        <Progress />
      ) : (
        <ContentComponent {...this.props} />
      );
    }
  };
}
