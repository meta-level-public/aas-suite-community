import moment from 'moment';

export class NewsItem {
  id?: number;
  description?: string;
  text?: string;
  date: Date | undefined;
  visible?: boolean;
  isPublic: boolean = false;

  static fromDto(dto: any) {
    const newsItem = new NewsItem();
    Object.assign(newsItem, dto);
    newsItem.date = moment(dto.date).toDate();
    return newsItem;
  }
}
