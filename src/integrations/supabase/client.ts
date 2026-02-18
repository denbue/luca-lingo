type Filter = { type: "eq"; field: string; value: string } | { type: "in"; field: string; values: string[] };

const PB_URL = import.meta.env.VITE_PB_URL;

if (!PB_URL) {
  throw new Error("Missing VITE_PB_URL. Set it in your environment (e.g. .env).");
}

const FIELD_MAP: Record<string, Record<string, string>> = {
  dictionaries: { id: "legacy_id" },
  dictionary_entries: {
    id: "legacy_id",
    dictionary_id: "dictionary_legacy_id",
  },
  definitions: {
    id: "legacy_id",
    entry_id: "entry_legacy_id",
  },
  dictionary_translations: {
    id: "legacy_id",
    dictionary_id: "dictionary_legacy_id",
  },
  entry_translations: {
    id: "legacy_id",
    entry_id: "entry_legacy_id",
  },
  definition_translations: {
    id: "legacy_id",
    definition_id: "definition_legacy_id",
  },
};

function mapField(table: string, field: string) {
  return FIELD_MAP[table]?.[field] || field;
}

function mapRowFromPb(table: string, row: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    out[k] = v;
  }

  if (out.legacy_id) out.id = out.legacy_id;
  if (table === "dictionary_entries") out.dictionary_id = row.dictionary_legacy_id;
  if (table === "definitions") out.entry_id = row.entry_legacy_id;
  if (table === "dictionary_translations") out.dictionary_id = row.dictionary_legacy_id;
  if (table === "entry_translations") out.entry_id = row.entry_legacy_id;
  if (table === "definition_translations") out.definition_id = row.definition_legacy_id;
  return out;
}

function mapPayloadToPb(table: string, payload: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[mapField(table, k)] = v;
  }
  return out;
}

function escapeFilter(v: string) {
  return String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function pbFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${PB_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data?.message || `PocketBase error ${res.status}`);
    (err as any).details = data;
    throw err;
  }
  return data;
}

class QueryBuilder {
  private table: string;
  private mode: "select" | "update" | "insert" | "upsert" | "delete" = "select";
  private selectColumns = "*";
  private payload: any = null;
  private filters: Filter[] = [];
  private sortField = "";
  private upsertConflict = "";

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string) {
    this.mode = "select";
    this.selectColumns = columns;
    return this;
  }

  update(payload: Record<string, any>) {
    this.mode = "update";
    this.payload = payload;
    return this;
  }

  insert(payload: Record<string, any> | Record<string, any>[]) {
    this.mode = "insert";
    this.payload = payload;
    return this;
  }

  upsert(payload: Record<string, any>, opts?: { onConflict?: string }) {
    this.mode = "upsert";
    this.payload = payload;
    this.upsertConflict = opts?.onConflict || "";
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ type: "eq", field: mapField(this.table, field), value: String(value) });
    return this;
  }

  in(field: string, values: any[]) {
    this.filters.push({
      type: "in",
      field: mapField(this.table, field),
      values: values.map((v) => String(v)),
    });
    return this;
  }

  order(field: string) {
    this.sortField = mapField(this.table, field);
    return this;
  }

  async single() {
    const result = await this.execSelect();
    if (result.error) return { data: null, error: result.error };
    if (!result.data?.length) return { data: null, error: new Error("No row found") };
    return { data: result.data[0], error: null };
  }

  async maybeSingle() {
    const result = await this.execSelect();
    if (result.error) return { data: null, error: result.error };
    return { data: result.data?.[0] || null, error: null };
  }

  then(resolve: (v: any) => void, reject: (e: any) => void) {
    this.execute().then(resolve).catch(reject);
  }

  private buildFilter() {
    const clauses: string[] = [];
    for (const f of this.filters) {
      if (f.type === "eq") {
        clauses.push(`${f.field}="${escapeFilter(f.value)}"`);
      } else {
        const inner = f.values.map((v) => `${f.field}="${escapeFilter(v)}"`).join(" || ");
        clauses.push(`(${inner})`);
      }
    }
    return clauses.join(" && ");
  }

  private async listRaw() {
    const filter = this.buildFilter();
    const sort = this.sortField ? `&sort=${encodeURIComponent(this.sortField)}` : "";
    const data = await pbFetch(
      `/api/collections/${encodeURIComponent(this.table)}/records?page=1&perPage=500${filter ? `&filter=${encodeURIComponent(filter)}` : ""}${sort}`
    );
    return data.items || [];
  }

  private async execSelect() {
    try {
      const rows = await this.listRaw();
      const data = rows.map((r: any) => mapRowFromPb(this.table, r));
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async execUpdate() {
    try {
      const rows = await this.listRaw();
      const payload = mapPayloadToPb(this.table, this.payload || {});
      for (const row of rows) {
        await pbFetch(
          `/api/collections/${encodeURIComponent(this.table)}/records/${row.id}`,
          { method: "PATCH", body: JSON.stringify(payload) }
        );
      }
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async execInsert() {
    try {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      for (const row of rows) {
        await pbFetch(
          `/api/collections/${encodeURIComponent(this.table)}/records`,
          { method: "POST", body: JSON.stringify(mapPayloadToPb(this.table, row)) }
        );
      }
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async execUpsert() {
    try {
      const payload = mapPayloadToPb(this.table, this.payload || {});
      const conflictFields = this.upsertConflict
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .map((f) => mapField(this.table, f));

      const filter = conflictFields
        .filter((f) => payload[f] != null)
        .map((f) => `${f}="${escapeFilter(String(payload[f]))}"`)
        .join(" && ");

      let existing: any = null;
      if (filter) {
        const data = await pbFetch(
          `/api/collections/${encodeURIComponent(this.table)}/records?page=1&perPage=1&filter=${encodeURIComponent(filter)}`
        );
        existing = data.items?.[0] || null;
      }

      if (existing) {
        await pbFetch(
          `/api/collections/${encodeURIComponent(this.table)}/records/${existing.id}`,
          { method: "PATCH", body: JSON.stringify(payload) }
        );
      } else {
        await pbFetch(
          `/api/collections/${encodeURIComponent(this.table)}/records`,
          { method: "POST", body: JSON.stringify(payload) }
        );
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  private async execDelete() {
    try {
      const rows = await this.listRaw();
      for (const row of rows) {
        await pbFetch(
          `/api/collections/${encodeURIComponent(this.table)}/records/${row.id}`,
          { method: "DELETE" }
        );
      }
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async execute() {
    if (this.mode === "select") return this.execSelect();
    if (this.mode === "update") return this.execUpdate();
    if (this.mode === "insert") return this.execInsert();
    if (this.mode === "upsert") return this.execUpsert();
    return this.execDelete();
  }
}

export const supabase = {
  from(table: string) {
    return new QueryBuilder(table);
  },
};
