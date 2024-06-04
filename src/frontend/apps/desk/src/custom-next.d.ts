/* eslint-disable @typescript-eslint/no-unused-vars */

declare module '*.svg' {
  import * as React from 'react';

  const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string;
    }
  >;

  export default ReactComponent;
}

declare module '*.svg?url' {
  const content: string;
  export default content;
}

namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_ORIGIN?: string;
  }
}
