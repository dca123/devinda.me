import {
  Client,
  isFullDatabase,
  isFullPage,
  isFullPageOrDataSource,
} from "@notionhq/client";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.js";

type NonNullableObj<T> = { [K in keyof T]: NonNullable<T[K]> };

type OutputProperties = PageObjectResponse["properties"]["string"];
type OString = Extract<OutputProperties, { type?: "rich_text" }>;
export type OTitle = Extract<OutputProperties, { type?: "title" }>;
type OSelect = NonNullableObj<Extract<OutputProperties, { type?: "select" }>>;
type ODate = NonNullableObj<Extract<OutputProperties, { type?: "date" }>>;

export type Schema = Record<
  string,
  | ReturnType<typeof title>
  | ReturnType<typeof text>
  | ReturnType<typeof select>
  | ReturnType<typeof date>
>

export class NotionDB<
  S extends Schema,
  A = {
    [P in keyof S]: S[P] extends ReturnType<typeof text>
    ? OString
    : S[P] extends ReturnType<typeof title>
    ? OTitle
    : S[P] extends ReturnType<typeof select>
    ? OSelect
    : S[P] extends ReturnType<typeof date>
    ? ODate
    : never;
  },
> {
  static async create<S extends Schema>(config: {
    databaseId: string;
    schema: S;
    client: Client;
    databaseName?: string | undefined;
  }): Promise<NotionDB<S>> {
    const database = await config.client.databases.retrieve({
      database_id: config.databaseId,
    });

    if (!isFullDatabase(database)) {
      throw new Error(
        `Could not retrieve full database for ID: ${config.databaseId}`,
      );
    }

    const dataSourceId = database.data_sources[0]?.id;
    if (!dataSourceId) {
      throw new Error(`No data source found for database ID: ${config.databaseId}`);
    }

    const databaseName =
      config.databaseName ?? database.title[0]?.plain_text ?? undefined;

    return new NotionDB({
      client: config.client,
      databaseId: config.databaseId,
      schema: config.schema,
      databaseName,
      dataSourceId,
    });
  }

  private client: Client;
  public databaseName?: string | undefined
  public databaseId: string;
  /** The data source ID - in v5, this is required for queries */
  public dataSourceId: string;
  private schema: S;

  constructor(config: {
    databaseId: string;
    schema: S;
    client: Client;
    databaseName?: string | undefined;
    dataSourceId: string;
  }) {
    this.client = config.client;
    this.databaseId = config.databaseId;
    this.databaseName = config.databaseName;
    this.dataSourceId = config.dataSourceId;
    this.schema = config.schema;
  }

  async insert<T extends { [P in keyof S]: Parameters<S[P]["insert"]>[0] }>(
    data: T,
  ) {
    const transformedData = this.schemaToNotion(data);
    const response = await this.client.pages.create({
      parent: {
        type: "data_source_id",
        data_source_id: this.dataSourceId,
      },
      properties: transformedData,
    });

    //console.dir(response, { depth: null });
    if (isFullPage(response)) {
      return response as Omit<PageObjectResponse, "properties"> & {
        properties: A;
      };
    }
    throw new Error("Not full page");
  }

  async findAll() {
    const response = await this.client.dataSources.query({
      data_source_id: this.dataSourceId,
    });

    const results = response.results.flatMap((r) => {
      if (!isFullPageOrDataSource(r)) {
        return [];
      }
      if (r.object === "data_source") {
        return [];
      }
      if (isFullPage(r)) {
        return [this.notionToSchema(r)];
      }
      throw new Error(`${(r as { id: string }).id} is not a full page`);
    });

    return results;
  }

  private notionToSchema(data: PageObjectResponse) {
    const res = {};

    for (const [key, value] of Object.entries(data.properties)) {
      const schemaEntry = this.schema[key];
      if (!schemaEntry) {
        continue;
      }
      const transformer = schemaEntry.read as (data: unknown) => unknown;
      //@ts-expect-error
      res[key] = transformer(value);
    }

    return res as {
      [K in keyof S]: ReturnType<S[K]["read"]>;
    };
  }

  private schemaToNotion<
    T extends { [P in keyof S]: Parameters<S[P]["insert"]>[0] },
  >(data: T) {
    const res = {};

    for (const [key, value] of Object.entries(data)) {
      const transformer = this.schema[key].insert;
      //@ts-expect-error
      res[key] = transformer(value);
    }

    return res as CreatePageParametersProperties;
  }
}

type CreatePageParametersProperties = CreatePageParameters["properties"];

export function title() {
  return {
    insert: (data: string) => {
      return {
        title: [
          {
            type: "text" as const,
            text: {
              content: data,
            },
          },
        ],
      };
    },
    read: (data: OTitle) => data.title[0].plain_text,
    create: () => ({ title: {} })
  };
}

export function text() {
  return {
    insert: (data: string) => {
      return {
        type: "rich_text" as const,
        rich_text: [
          {
            type: "text" as const,
            text: {
              content: data,
            },
          },
        ],
      };
    },
    read: (data: OString) => data.rich_text[0].plain_text,
    create: () => ({ rich_text: {} })
  };
}

export function select<const T extends string>(options: Array<T>) {
  return {
    insert: <F extends T>(data: F) => {
      return {
        type: "select" as const,
        select: {
          name: data,
        },
      };
    },
    read: (data: OSelect) => data.select.name as T,
    create: () => ({ select: { options: options.map(n => ({ name: n })) } })
  };
}

export function date() {
  return {
    insert: (data: Date) => {
      return {
        type: "date" as const,
        date: {
          start: data.toISOString(),
        },
      };
    },
    read: (data: ODate) => new Date(data.date.start),
    create: () => ({ date: {} })
  };
}
