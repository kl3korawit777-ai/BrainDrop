type ClassValue = string | number | null | false | undefined | ClassValue[]

/** join class names, skipping falsy values — minimal `cn` ที่ใช้แทน clsx ในไฟล์ shadcn-style */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  const walk = (v: ClassValue) => {
    if (!v) return
    if (Array.isArray(v)) v.forEach(walk)
    else out.push(String(v))
  }
  inputs.forEach(walk)
  return out.join(' ')
}
