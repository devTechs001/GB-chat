// server/utils/pagination.js
/**
 * One pagination contract for the whole API.
 *
 * Offset (`?page=&limit=`) is what the UI uses — it can jump to page 3 and show
 * "1–25 of 412". Cursor (`?cursor=<ISO date>`) is what long lists use: it stays
 * correct while new rows are being inserted at the head, which offset paging
 * cannot do (a new message shifts everything down and you see duplicates).
 *
 * Both are opt-in: a request with no pagination params gets the defaults, so
 * adding this to an endpoint cannot change an existing caller's behaviour as
 * long as `defaultLimit` matches what that endpoint used before.
 */

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const parsePagination = (
  query = {},
  { defaultLimit = 25, maxLimit = 100, pageSizeParam = 'limit' } = {}
) => {
  const rawLimit = Number.parseInt(query[pageSizeParam], 10);
  const limit = clamp(Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit, 1, maxLimit);

  const rawPage = Number.parseInt(query.page, 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const cursor = typeof query.cursor === 'string' && query.cursor.trim() ? query.cursor.trim() : null;

  return { page, limit, skip: (page - 1) * limit, cursor, sort: query.sort || null };
};

/**
 * Metadata block for a response. `hasMore` is what the client actually needs;
 * `pages`/`total` are only sent when a count was cheap enough to run.
 */
export const buildPageMeta = ({ page, limit, total = null, returned = 0, cursor = null, hasMore }) => {
  const meta = {
    page,
    limit,
    returned,
    hasMore:
      typeof hasMore === 'boolean' ? hasMore : total !== null ? page * limit < total : returned === limit,
  };
  if (total !== null) {
    meta.total = total;
    meta.pages = Math.max(Math.ceil(total / limit), 1);
  }
  if (cursor) meta.cursor = cursor;
  return meta;
};

/**
 * Run a query with an extra row to detect "there is more" without a count,
 * which is the cheap path for large collections.
 */
export const paginateQuery = async (Model, filter, { page = 1, limit = 25, sort = { createdAt: -1 }, populate = null, select = null } = {}) => {
  let query = Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit + 1);
  if (select) query = query.select(select);
  if (populate) {
    (Array.isArray(populate) ? populate : [populate]).forEach((spec) => {
      query = query.populate(spec);
    });
  }

  const rows = await query.exec();
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  return { items, hasMore, meta: buildPageMeta({ page, limit, returned: items.length, hasMore }) };
};

/**
 * Cursor filter for timestamp-sorted collections.
 * `?cursor=<ISO date>` means "the next page starts before this instant".
 */
export const cursorFilter = (field, cursor, direction = 'before') => {
  if (!cursor) return {};
  const date = new Date(cursor);
  if (Number.isNaN(date.getTime())) return {};
  return { [field]: direction === 'before' ? { $lt: date } : { $gt: date } };
};

/**
 * Expose the same numbers in headers for endpoints that must keep returning a
 * bare JSON array for backwards compatibility.
 */
export const setPaginationHeaders = (res, meta) => {
  if (!res?.setHeader) return;
  if (meta.total !== undefined) res.setHeader('X-Total-Count', String(meta.total));
  res.setHeader('X-Page', String(meta.page));
  res.setHeader('X-Page-Limit', String(meta.limit));
  res.setHeader('X-Has-More', meta.hasMore ? 'true' : 'false');
  if (meta.cursor) res.setHeader('X-Next-Cursor', String(meta.cursor));
};

export default { parsePagination, buildPageMeta, paginateQuery, cursorFilter, setPaginationHeaders };
