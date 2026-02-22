import { type Client, isFullDatabase } from "@notionhq/client";
import { NotionDB, type Schema } from "./notionDb.js";

export async function createNotionDb<S extends Schema>({
  schema,
  parentId,
  parentType,
  client,
  name,
}: {
  schema: S;
  parentType: "page";
  parentId: string;
  client: Client;
  name: string;
}) {
  const parent = { type: "page_id", page_id: parentId } as const;
  const properties: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(schema)) {
    properties[key] = value.create();
  }
  
  const createDbResponse = await client.databases.create({
    parent,
    title: [
      {
        type: "text",
        text: {
          content: name,
        },
      },
    ],
    initial_data_source: {
      properties:
        properties as Parameters<typeof client.databases.create>[0]["initial_data_source"] extends {
          properties?: infer P;
        }
          ? P
          : never,
    },
  });

  if (!isFullDatabase(createDbResponse)) {
    throw new Error("createNotionDb: expected full database response");
  }

  const databaseName = createDbResponse.title[0]?.plain_text ?? name;
  const dataSourceId = createDbResponse.data_sources[0]?.id;

  if (!dataSourceId) {
    throw new Error(`createNotionDb: no data source for database ${createDbResponse.id}`);
  }

  const dbInstance = new NotionDB<S>({
    client,
    databaseId: createDbResponse.id,
    dataSourceId,
    schema,
    databaseName,
  });
  return dbInstance;
}
