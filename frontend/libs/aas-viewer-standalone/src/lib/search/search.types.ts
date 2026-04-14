export interface SearchHit {
  submodelId: string;
  submodelIdShort: string;
  idShortPath: string; // path like Foo.Bar[2].Baz
  elementType: string;
  snippet: string; // display value around the match
}
