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
    constructor(props: Props) {
      super(props);

      this.state = {
        triggered: false,
        triggeredProps: undefined
      };
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
              {this.state.triggeredProps === undefined ? (
                <LinearProgress />
              ) : (
                <TriggeredComponent {...this.state.triggeredProps} />
              )}
            </Section>
          )}
        </div>
      );
    }
  };
}
