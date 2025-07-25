import { Request } from 'express';

/**
 * Shared base class to build pagination URLs
 */
export class BasePagination<T> {
  protected buildUrl(
    page: number,
    route: string,
    query: Record<string, any> = {},
  ): string {
    const params = new URLSearchParams({
      ...query,
      page: page.toString(),
    });
    return `${route}?${params.toString()}`;
  }
}

/**
 * Basic pagination DTO (no links)
 */
export class MetaPaginationDto<T> {
  constructor(
    public page: number,
    public pages: number,
    public count: number,
    public results: T[],
  ) {}
}

/**
 * Link-based pagination DTO (next, prev links)
 */
export class LinkPaginationDto<T> extends BasePagination<T> {
  count: number;
  page: number;
  next: string | null;
  prev: string | null;
  results: T[];

  constructor(
    page: number,
    count: number,
    limit: number,
    req: Request,
    results: T[],
  ) {
    super();
    this.count = count;

    const pages = Math.ceil(count / limit);
    const route = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    this.next = page < pages ? this.buildUrl(page + 1, route, req.query) : null;
    this.prev = page > 1 ? this.buildUrl(page - 1, route, req.query) : null;
    this.results = results;
  }
}

/**
 * Full pagination DTO (all metadata + links)
 */
export class FullPaginationDto<T> extends BasePagination<T> {
  page: number;
  pages: number;
  count: number;
  next: string | null;
  prev: string | null;
  results: T[];

  constructor(
    page: number,
    count: number,
    limit: number,
    req: Request,
    results: T[],
  ) {
    super();
    this.page = page;
    this.pages = Math.ceil(count / limit);
    this.count = count;
    this.results = results;

    const hasNext = page < this.pages;
    const hasPrev = page > 1;
    const route = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;

    this.next = hasNext ? this.buildUrl(page + 1, route, req.query) : null;
    this.prev = hasPrev ? this.buildUrl(page - 1, route, req.query) : null;
  }
}
