import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '날짜 정보 없음';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return '날짜 정보 없음';
    }
    
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ko,
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '날짜 정보 없음';
  }
};
