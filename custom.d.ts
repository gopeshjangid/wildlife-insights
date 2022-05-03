// Support for non JS files
declare module "*.svg" {
  const content: any;
  export default content;
}

declare module "*.png" {
  const content: any;
  export default content;
}

declare module "*.graphql" {
  const content: any;
  export default content;
}

declare module "*.json" {
  const content: any;
  export default content;
}

// Some fixes for Next files
declare namespace NodeJS {
  interface Process {
    browser: boolean;
  }

  interface Global {
    fetch: Function;
  }
}

// Global libraries
declare const Transifex: any;
declare const google: any;
