export class SnippetVerwendung {
  datum: Date | null = null;
  snippetName: string = '';
  snippetTyp: string = '';
  snippetId: number = 0;

  static fromDto(dto: any) {
    const snippetVerwendung = new SnippetVerwendung();
    Object.assign(snippetVerwendung, dto);

    snippetVerwendung.datum = new Date(dto.datum);

    return snippetVerwendung;
  }
}
