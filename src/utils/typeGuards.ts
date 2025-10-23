/**
 * 型ガードと型安全性ユーティリティ
 */

/**
 * 値がnullまたはundefinedでないことを確認
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * 値が文字列であることを確認
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 値が数値であることを確認
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 値が真の数値であることを確認（NaNを除外）
 */
export function isFiniteNumber(value: unknown): value is number {
  return isNumber(value) && isFinite(value);
}

/**
 * 値が配列であることを確認
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * 値がオブジェクトであることを確認
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 値が関数であることを確認
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * 値がPromiseであることを確認
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

/**
 * 値がDateであることを確認
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

/**
 * 値が有効な日付であることを確認
 */
export function isValidDate(value: unknown): value is Date {
  return isDate(value) && !isNaN(value.getTime());
}

/**
 * 値がURLであることを確認
 */
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * 値がメールアドレスであることを確認
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * 値が指定された型の配列であることを確認
 */
export function isArrayOf<T>(
  value: unknown,
  typeGuard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(typeGuard);
}

/**
 * 値が指定されたキーを持つオブジェクトであることを確認
 */
export function hasProperty<K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> {
  return isObject(value) && key in value;
}

/**
 * 値が指定されたキーを持つオブジェクトであることを確認（型安全）
 */
export function hasProperties<K extends string>(
  value: unknown,
  keys: K[]
): value is Record<K, unknown> {
  return isObject(value) && keys.every(key => key in value);
}

/**
 * 値が指定された型のプロパティを持つオブジェクトであることを確認
 */
export function isObjectWith<T extends Record<string, unknown>>(
  value: unknown,
  shape: Record<keyof T, (val: unknown) => boolean>
): value is T {
  if (!isObject(value)) return false;
  
  for (const [key, typeGuard] of Object.entries(shape)) {
    if (!(key in value) || !typeGuard(value[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * 型安全な型アサーション
 */
export function assertType<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  errorMessage = 'Type assertion failed'
): T {
  if (!typeGuard(value)) {
    throw new Error(errorMessage);
  }
  return value;
}

/**
 * 型安全な型変換
 */
export function safeCast<T>(
  value: unknown,
  typeGuard: (val: unknown) => val is T,
  fallback: T
): T {
  return typeGuard(value) ? value : fallback;
}

/**
 * オプショナルチェーン用のヘルパー
 */
export function optional<T, R>(
  value: T | null | undefined,
  transform: (val: T) => R,
  fallback: R
): R {
  return isNotNull(value) ? transform(value) : fallback;
} 