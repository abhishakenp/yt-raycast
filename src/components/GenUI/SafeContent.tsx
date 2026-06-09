import { Component, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

/**
 * Error boundary that isolates content crashes from the chrome (TopBar).
 * If the preview/content throws, this catches it and shows a fallback.
 */
export class SafeContent extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error("[SafeContent] Caught error:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback ?? (
					<div className="flex min-h-svh w-full flex-col items-center justify-center gap-3 bg-background px-4 text-center">
						<p className="text-sm text-destructive">Something went wrong.</p>
						<p className="text-xs text-muted-foreground">
							{this.state.error?.message}
						</p>
					</div>
				)
			);
		}
		return this.props.children;
	}
}
