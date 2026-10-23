/* eslint-disable @typescript-eslint/no-namespace */
declare namespace React.JSX {
  interface IntrinsicElements {
    'palmframe-widget': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      project?: string
      mode?: string
    }
  }
}
