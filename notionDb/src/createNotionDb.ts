import { type Client } from '@notionhq/client'
import { NotionDB, type Schema } from './notionDb.js'

export async function createNotionDb<S extends Schema>({
  schema, parentId, parentType, client, name
}: { schema: S, parentType: 'page' | 'database', parentId: string, client: Client, name: string }) {
  const parent = parentType === 'page' ? { type: "page_id", page_id: parentId } as const : { type: 'database_id', database_id: parentId } as const
  const properties = {}

  for (const [key, value] of Object.entries(schema)) {
    properties[key] = value.create()
  }
  const createDbResponse = await client.databases.create({
    parent,
    title: [{
      type: "text",
      text: {
        content: name
      }
    }],
    properties
  })

  const dbInstance = new NotionDB<S>({
    client,
    databaseId: createDbResponse.id,
    schema,
    databaseName: (createDbResponse as unknown as { title: [{ text: { content: string } }] }).title[0].text.content
  })
  return dbInstance
}
