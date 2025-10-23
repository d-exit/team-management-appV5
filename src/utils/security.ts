// XSS対策のためのHTMLエスケープ
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// CSRFトークン生成
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// パスワード強度チェック
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('大文字を含む必要があります')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('小文字を含む必要があります')
  }
  
  if (!/\d/.test(password)) {
    errors.push('数字を含む必要があります')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('特殊文字を含む必要があります')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 入力値のサニタイズ
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // 基本的なHTMLタグを除去
    .replace(/javascript:/gi, '') // JavaScriptプロトコルを除去
    .replace(/on\w+=/gi, '') // イベントハンドラーを除去
}

// ファイル名の安全な検証
export function validateFileName(fileName: string): boolean {
  const dangerousPatterns = [
    /\.\./, // ディレクトリトラバーサル
    /[<>:"|?*]/, // Windows禁止文字
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows予約名
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(fileName))
}

// ファイルサイズの検証
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize
}

// ファイルタイプの検証
export function validateFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

// レート制限の実装
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []
    
    // 古いリクエストを削除
    const recentRequests = userRequests.filter(time => now - time < this.windowMs)
    
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    return true
  }

  reset(identifier: string): void {
    this.requests.delete(identifier)
  }
} 