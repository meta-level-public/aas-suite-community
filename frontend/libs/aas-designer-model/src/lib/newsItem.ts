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
    // like moment(dto.date): a missing date means now
    newsItem.date = new Date(dto.date ?? Date.now());
    return newsItem;
  }
}
