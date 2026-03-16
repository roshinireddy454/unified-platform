import { UR } from 'stream-chat';
export declare const mergeDeep: <TObject extends UR, TSource extends UR>(target: TObject, source: TSource) => TObject & TSource;
export declare const mergeDeepUndefined: <TObject extends UR, TSource extends UR>(target: TObject, source: TSource) => TObject & TSource;
