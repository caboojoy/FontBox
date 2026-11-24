// 폰트 이름으로 URL 용 slug 를 만든다.
// 한글은 국어의 로마자 표기법 글자 대응으로 바꾼다 (음운 변화는 반영하지 않음). 예) 천의체 → cheonuiche
// 영문·숫자 외 글자는 버리고, 띄어쓰기는 '-' 로 잇는다.

const INITIALS = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
const MEDIALS  = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
const FINALS   = ['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t']

function romanizeHangul(text: string): string {
  let out = ''
  for (const ch of text.normalize('NFC')) {
    const code = ch.charCodeAt(0) - 0xac00
    if (code < 0 || code > 11171) { out += ch; continue }
    out += INITIALS[Math.floor(code / 588)] + MEDIALS[Math.floor((code % 588) / 28)] + FINALS[code % 28]
  }
  return out
}

export function toSlug(name: string): string {
  return romanizeHangul(name)
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug)
}
