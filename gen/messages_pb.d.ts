// package: christiangeorgelucas.ansi_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class AnsiText extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnsiText.AsObject;
  static toObject(includeInstance: boolean, msg: AnsiText): AnsiText.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AnsiText, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnsiText;
  static deserializeBinaryFromReader(message: AnsiText, reader: jspb.BinaryReader): AnsiText;
}

export namespace AnsiText {
  export type AsObject = {
    text: string,
  }
}

export class StripResult extends jspb.Message {
  getPlainText(): string;
  setPlainText(value: string): void;

  getCodesRemoved(): number;
  setCodesRemoved(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StripResult.AsObject;
  static toObject(includeInstance: boolean, msg: StripResult): StripResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StripResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StripResult;
  static deserializeBinaryFromReader(message: StripResult, reader: jspb.BinaryReader): StripResult;
}

export namespace StripResult {
  export type AsObject = {
    plainText: string,
    codesRemoved: number,
    error: string,
  }
}

export class DetectResult extends jspb.Message {
  getHasAnsi(): boolean;
  setHasAnsi(value: boolean): void;

  getCodeCount(): number;
  setCodeCount(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetectResult.AsObject;
  static toObject(includeInstance: boolean, msg: DetectResult): DetectResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DetectResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetectResult;
  static deserializeBinaryFromReader(message: DetectResult, reader: jspb.BinaryReader): DetectResult;
}

export namespace DetectResult {
  export type AsObject = {
    hasAnsi: boolean,
    codeCount: number,
    error: string,
  }
}

export class Span extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getFg(): string;
  setFg(value: string): void;

  getBg(): string;
  setBg(value: string): void;

  clearDecorationsList(): void;
  getDecorationsList(): Array<string>;
  setDecorationsList(value: Array<string>): void;
  addDecorations(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Span.AsObject;
  static toObject(includeInstance: boolean, msg: Span): Span.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Span, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Span;
  static deserializeBinaryFromReader(message: Span, reader: jspb.BinaryReader): Span;
}

export namespace Span {
  export type AsObject = {
    text: string,
    fg: string,
    bg: string,
    decorationsList: Array<string>,
  }
}

export class ParseResult extends jspb.Message {
  clearSpansList(): void;
  getSpansList(): Array<Span>;
  setSpansList(value: Array<Span>): void;
  addSpans(value?: Span, index?: number): Span;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseResult.AsObject;
  static toObject(includeInstance: boolean, msg: ParseResult): ParseResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseResult;
  static deserializeBinaryFromReader(message: ParseResult, reader: jspb.BinaryReader): ParseResult;
}

export namespace ParseResult {
  export type AsObject = {
    spansList: Array<Span.AsObject>,
    error: string,
  }
}

export class ToHtmlRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getUseClasses(): boolean;
  setUseClasses(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToHtmlRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ToHtmlRequest): ToHtmlRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ToHtmlRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToHtmlRequest;
  static deserializeBinaryFromReader(message: ToHtmlRequest, reader: jspb.BinaryReader): ToHtmlRequest;
}

export namespace ToHtmlRequest {
  export type AsObject = {
    text: string,
    useClasses: boolean,
  }
}

export class HtmlResult extends jspb.Message {
  getHtml(): string;
  setHtml(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HtmlResult.AsObject;
  static toObject(includeInstance: boolean, msg: HtmlResult): HtmlResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HtmlResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HtmlResult;
  static deserializeBinaryFromReader(message: HtmlResult, reader: jspb.BinaryReader): HtmlResult;
}

export namespace HtmlResult {
  export type AsObject = {
    html: string,
    error: string,
  }
}

export class StyleRange extends jspb.Message {
  getStart(): number;
  setStart(value: number): void;

  getEnd(): number;
  setEnd(value: number): void;

  getFg(): string;
  setFg(value: string): void;

  getBg(): string;
  setBg(value: string): void;

  clearDecorationsList(): void;
  getDecorationsList(): Array<string>;
  setDecorationsList(value: Array<string>): void;
  addDecorations(value: string, index?: number): string;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StyleRange.AsObject;
  static toObject(includeInstance: boolean, msg: StyleRange): StyleRange.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StyleRange, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StyleRange;
  static deserializeBinaryFromReader(message: StyleRange, reader: jspb.BinaryReader): StyleRange;
}

export namespace StyleRange {
  export type AsObject = {
    start: number,
    end: number,
    fg: string,
    bg: string,
    decorationsList: Array<string>,
  }
}

export class StyleMapResult extends jspb.Message {
  getPlainText(): string;
  setPlainText(value: string): void;

  clearStylesList(): void;
  getStylesList(): Array<StyleRange>;
  setStylesList(value: Array<StyleRange>): void;
  addStyles(value?: StyleRange, index?: number): StyleRange;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StyleMapResult.AsObject;
  static toObject(includeInstance: boolean, msg: StyleMapResult): StyleMapResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StyleMapResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StyleMapResult;
  static deserializeBinaryFromReader(message: StyleMapResult, reader: jspb.BinaryReader): StyleMapResult;
}

export namespace StyleMapResult {
  export type AsObject = {
    plainText: string,
    stylesList: Array<StyleRange.AsObject>,
    error: string,
  }
}

export class WidthResult extends jspb.Message {
  getWidth(): number;
  setWidth(value: number): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WidthResult.AsObject;
  static toObject(includeInstance: boolean, msg: WidthResult): WidthResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: WidthResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WidthResult;
  static deserializeBinaryFromReader(message: WidthResult, reader: jspb.BinaryReader): WidthResult;
}

export namespace WidthResult {
  export type AsObject = {
    width: number,
    error: string,
  }
}

export class TruncateRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getWidth(): number;
  setWidth(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TruncateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TruncateRequest): TruncateRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TruncateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TruncateRequest;
  static deserializeBinaryFromReader(message: TruncateRequest, reader: jspb.BinaryReader): TruncateRequest;
}

export namespace TruncateRequest {
  export type AsObject = {
    text: string,
    width: number,
  }
}

export class TruncateResult extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getTruncated(): boolean;
  setTruncated(value: boolean): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TruncateResult.AsObject;
  static toObject(includeInstance: boolean, msg: TruncateResult): TruncateResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TruncateResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TruncateResult;
  static deserializeBinaryFromReader(message: TruncateResult, reader: jspb.BinaryReader): TruncateResult;
}

export namespace TruncateResult {
  export type AsObject = {
    text: string,
    truncated: boolean,
    error: string,
  }
}

export class SliceRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getStart(): number;
  setStart(value: number): void;

  getEnd(): number;
  setEnd(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SliceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SliceRequest): SliceRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SliceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SliceRequest;
  static deserializeBinaryFromReader(message: SliceRequest, reader: jspb.BinaryReader): SliceRequest;
}

export namespace SliceRequest {
  export type AsObject = {
    text: string,
    start: number,
    end: number,
  }
}

export class SliceResult extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SliceResult.AsObject;
  static toObject(includeInstance: boolean, msg: SliceResult): SliceResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SliceResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SliceResult;
  static deserializeBinaryFromReader(message: SliceResult, reader: jspb.BinaryReader): SliceResult;
}

export namespace SliceResult {
  export type AsObject = {
    text: string,
    error: string,
  }
}

export class ExtractedCode extends jspb.Message {
  getRaw(): string;
  setRaw(value: string): void;

  clearParamsList(): void;
  getParamsList(): Array<number>;
  setParamsList(value: Array<number>): void;
  addParams(value: number, index?: number): number;

  getOccurrences(): number;
  setOccurrences(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractedCode.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractedCode): ExtractedCode.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractedCode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractedCode;
  static deserializeBinaryFromReader(message: ExtractedCode, reader: jspb.BinaryReader): ExtractedCode;
}

export namespace ExtractedCode {
  export type AsObject = {
    raw: string,
    paramsList: Array<number>,
    occurrences: number,
  }
}

export class ExtractCodesResult extends jspb.Message {
  clearCodesList(): void;
  getCodesList(): Array<ExtractedCode>;
  setCodesList(value: Array<ExtractedCode>): void;
  addCodes(value?: ExtractedCode, index?: number): ExtractedCode;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ExtractCodesResult.AsObject;
  static toObject(includeInstance: boolean, msg: ExtractCodesResult): ExtractCodesResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ExtractCodesResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ExtractCodesResult;
  static deserializeBinaryFromReader(message: ExtractCodesResult, reader: jspb.BinaryReader): ExtractCodesResult;
}

export namespace ExtractCodesResult {
  export type AsObject = {
    codesList: Array<ExtractedCode.AsObject>,
    error: string,
  }
}

export class ClassifyRequest extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  getStripSgr(): boolean;
  setStripSgr(value: boolean): void;

  getStripCursor(): boolean;
  setStripCursor(value: boolean): void;

  getStripOsc(): boolean;
  setStripOsc(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClassifyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ClassifyRequest): ClassifyRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClassifyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClassifyRequest;
  static deserializeBinaryFromReader(message: ClassifyRequest, reader: jspb.BinaryReader): ClassifyRequest;
}

export namespace ClassifyRequest {
  export type AsObject = {
    text: string,
    stripSgr: boolean,
    stripCursor: boolean,
    stripOsc: boolean,
  }
}

export class ClassifyResult extends jspb.Message {
  getSgrCount(): number;
  setSgrCount(value: number): void;

  getCursorCount(): number;
  setCursorCount(value: number): void;

  getOscCount(): number;
  setOscCount(value: number): void;

  getStrippedText(): string;
  setStrippedText(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ClassifyResult.AsObject;
  static toObject(includeInstance: boolean, msg: ClassifyResult): ClassifyResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ClassifyResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ClassifyResult;
  static deserializeBinaryFromReader(message: ClassifyResult, reader: jspb.BinaryReader): ClassifyResult;
}

export namespace ClassifyResult {
  export type AsObject = {
    sgrCount: number,
    cursorCount: number,
    oscCount: number,
    strippedText: string,
    error: string,
  }
}

export class ColorCodeRequest extends jspb.Message {
  getMode(): string;
  setMode(value: string): void;

  getIndex(): number;
  setIndex(value: number): void;

  getR(): number;
  setR(value: number): void;

  getG(): number;
  setG(value: number): void;

  getB(): number;
  setB(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ColorCodeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ColorCodeRequest): ColorCodeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ColorCodeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ColorCodeRequest;
  static deserializeBinaryFromReader(message: ColorCodeRequest, reader: jspb.BinaryReader): ColorCodeRequest;
}

export namespace ColorCodeRequest {
  export type AsObject = {
    mode: string,
    index: number,
    r: number,
    g: number,
    b: number,
  }
}

export class ColorRgbResult extends jspb.Message {
  getR(): number;
  setR(value: number): void;

  getG(): number;
  setG(value: number): void;

  getB(): number;
  setB(value: number): void;

  getHex(): string;
  setHex(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ColorRgbResult.AsObject;
  static toObject(includeInstance: boolean, msg: ColorRgbResult): ColorRgbResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ColorRgbResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ColorRgbResult;
  static deserializeBinaryFromReader(message: ColorRgbResult, reader: jspb.BinaryReader): ColorRgbResult;
}

export namespace ColorRgbResult {
  export type AsObject = {
    r: number,
    g: number,
    b: number,
    hex: string,
    error: string,
  }
}

