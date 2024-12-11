export interface VariantValueInterface {
  id: string;
  size: number;
}
export interface MediaFileVariantsInterface {
  "128"?: VariantValueInterface;
  "240"?: VariantValueInterface;
  "360"?: VariantValueInterface;
  "720"?: VariantValueInterface;
  "1080"?: VariantValueInterface;
  thumbnail?: VariantValueInterface;
}

export interface MediaFileInterface {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  extension: string;
  status?: number;
  physicalPath?: string;
  type?: number;
  variants?: MediaFileVariantsInterface;
}
