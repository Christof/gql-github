import * as React from "react";
import { Slide, Snackbar } from "material-ui";
import { SlideProps } from "material-ui/transitions";

export function TransitionLeft(props: SlideProps) {
  return <Slide direction="left" {...props} />;
}

export function withSnackbar<P extends Object>(
  Component: React.ComponentType<P>,
  asyncTrigger: keyof P
) {
  type Props = P & { snackbarMessage: JSX.Element };
  return class ComponentWithSnackbar extends React.Component<
    Props,
    { showSnackbar: boolean }
  > {
    constructor(props: Props) {
      super(props);
      this.state = { showSnackbar: false };
    }

    render() {
      const { snackbarMessage, ...otherProps } = this.props as any;
      const props = Object.assign(otherProps, {
        [asyncTrigger]: (...params: any[]) => {
          (this.props[asyncTrigger] as any)(params).then((result: any) => {
            this.setState({ showSnackbar: true });
            return result;
          });
        }
      });

      return (
        <>
          <Component {...props} />
          <Snackbar
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            autoHideDuration={2000}
            TransitionComponent={TransitionLeft}
            onClose={() => this.setState({ showSnackbar: false })}
            open={this.state.showSnackbar}
            message={snackbarMessage}
          />
        </>
      );
    }
  };
}
