declare module 'juice' {
  interface JuiceOptions {
    extraCss?: string;
    applyStyleTags?: boolean;
    removeStyleTags?: boolean;
    preserveMediaQueries?: boolean;
    preserveFontFaces?: boolean;
    preserveKeyFrames?: boolean;
    insertPreservedExtraCss?: boolean;
    applyWidthAttributes?: boolean;
    applyHeightAttributes?: boolean;
    applyAttributesTableElements?: boolean;
    xmlMode?: boolean;
    preserveImportant?: boolean;
  }

  function juice(html: string, options?: JuiceOptions): string;
  namespace juice {
    function inlineContent(html: string, css: string, options?: JuiceOptions): string;
    function inlineDocument(cheerio: any, css: string, options?: JuiceOptions): void;
  }

  export = juice;
}
