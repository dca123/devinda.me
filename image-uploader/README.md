# image-uploader

# Setup

`bun install`

# Setup secret keys

export NOTION_TOKEN=
export CLOUDINARY_URL=cloudinary://xxx:xxx@xxx


# Optimizer

Optimize images for cloudinary by ensuring the filesize is less than 10Mb.
`bun run optimizer.ts folder_name`

# Publish album
The notion database needs to be a clone of this. 
https://devinda.notion.site/7d533299b95744248622af63ccddbbbf?v=162e9d59d5684f0eb68a247978a36d7f

`pnpm tsx album-publisher.ts folder_name album_name_on_cloudinary "notion_database_id"`