import type { Book } from '../models/Book';
import type { BookResponse } from '../api/books';

export function getBookCoverSvg(_id: string, title: string, author: string, themeColor?: string) {
  // Dynamic design using theme color
  const color = themeColor || '#F66398';
  return (
    <svg className="book-cover" width="180" height="260" viewBox="0 0 180 260">
      <rect width="180" height="260" fill="#F9FAFB" rx="4" stroke="#E5E7EB" strokeWidth="1" />
      <path d="M 0,0 L 25,0 L 25,260 L 0,260 Z" fill={color} opacity="0.9" />
      <rect x="35" y="40" width="130" height="4" fill={color} />
      <text x="35" y="70" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#4B5563">INKPULSE PRESS</text>
      <text x="35" y="95" fontFamily="sans-serif" fontSize="14" fontWeight="900" fill="#111827">
        {title.length > 25 ? title.substring(0, 22) + '...' : title}
      </text>
      <text x="35" y="140" fontFamily="sans-serif" fontSize="10" fontStyle="italic" fill="#6B7280">Bản in chất lượng cao</text>
      <text x="35" y="235" fontFamily="sans-serif" fontSize="9" fontWeight="600" fill="#9CA3AF">
        {author.toUpperCase()}
      </text>
    </svg>
  );
}

export function mapResponseToBook(res: BookResponse): Book {
  const authorStr = res.authors && res.authors.length > 0 ? res.authors.join(', ') : 'Tác giả InkPulse';

  // Custom theme colors for covers
  let coverColor = '#F66398';
  if (res.title.toLowerCase().includes('database') || res.title.toLowerCase().includes('redis')) {
    coverColor = '#3B82F6';
  } else if (res.title.toLowerCase().includes('architecture') || res.title.toLowerCase().includes('system')) {
    coverColor = '#10B981';
  }

  return {
    id: res.id,
    title: res.title,
    author: authorStr,
    price: res.priceDisplay,
    wasPrice: res.wasPriceDisplay || undefined,
    tag: res.badgeText || '',
    tagClass: res.badgeText ? res.badgeText.toLowerCase() : '',
    badgeTextColor: res.badgeTextColor || undefined,
    badgeBgColor: res.badgeBgColor || undefined,
    desc: res.introduce || '',
    svgCover: getBookCoverSvg(res.id, res.title, res.authors && res.authors.length > 0 ? res.authors[0] : 'InkPulse', coverColor),
    attributes: {
      'Nhà xuất bản': 'NXB Tri Thức',
      'Hình thức': 'Bìa Cứng',
    },
    otherVersions: res.otherVersions,
    thumbnailUrl: res.thumbnailUrl || undefined
  };
}
