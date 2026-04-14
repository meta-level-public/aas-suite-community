export class PagedResult {
  result: any;
  pagingMetadata: PagingMetadata = new PagingMetadata();

  static fromDto(dto: any) {
    const result = new PagedResult();
    Object.assign(result, dto);
    result.pagingMetadata = PagingMetadata.fromDto(dto.pagingMetadata);
    return result;
  }
}

export class PagingMetadata {
  cursor: string = '';

  static fromDto(dto: any) {
    const result = new PagingMetadata();
    Object.assign(result, dto);
    return result;
  }
}
