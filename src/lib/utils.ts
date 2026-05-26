let _counter = 0;

export function generateId(prefix = 'ID'): string {
  _counter++;
  return `${prefix}-${Date.now()}-${_counter}`;
}

export function nowStr(): string {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** Sample students for demo */
export const DEMO_STUDENTS = [
  { name: 'Nguyen Thi A', school: '한양대', country: '베트남' },
  { name: 'Zhang Wei', school: '동국대', country: '중국' },
  { name: 'Tanaka Yuki', school: '가천대', country: '일본' },
  { name: 'Erdene B', school: '서울신학대', country: '몽골' },
  { name: 'Li Ming', school: '한양대', country: '중국' },
];
