# Create PDF API

A simple REST API endpoint to create PDF files from HTML or Markdown templates, and store them in a Google Cloud Storage bucket.

Uses [Puppeteer](https://pptr.dev/) to generate the PDF files, [Marked](https://marked.js.org/) to convert Markdown to HTML, and [Handlebars](https://handlebarsjs.com/) to render templates.
Uses [Google Cloud Storage](https://cloud.google.com/storage) to store the generated PDF files.

## Getting started

Create a `.env` file with:

- `BUCKET_NAME`: The name of the Google Cloud Storage bucket where to store the generated PDF files.
- `GOOGLE_APPLICATION_CREDENTIALS` (optional): The path to your Google credentials. The account must have the permission to write to the bucket above.

Install libraries, build the project and start the webapp:

```bash
npm install
npm run build
npm run start
```

Build the Docker image:

```bash
docker build --no-cache --progress=plain --pull -t create-pdf-api .
```

Start a Docker container:

```bash
docker run -d -p 3000:3000 create-pdf-api
```

The webapp is stateless which makes it easy to deploy in a serverless environment (e.g. Google Cloud Run, etc.). This means the API will incur costs only when it is used at a certain scale.

## API

Simple request to generate and store a PDF file:

```bash
curl -X POST http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -d '{
    "markdown": "# Hello world",
   }'
```

The response will contain the URL of the generated PDF file in the Google Cloud Storage bucket.

```json
{
  "id": "<FILE_ID>",
  "url": "https://storage.googleapis.com/<BUCKET_NAME>/<FILE_ID>.pdf"
}
```

List of parameters (either `markdown` or `html` is required):

- `markdown`: The markdown content to convert to PDF. (optional)
- `html`: The HTML content to convert to PDF. (optional)
- `useHandlebars`: If set to `true`, the HTML or Markdown content will be processed as a Handlebars template. (optional)
- `context`: The context to use for the Handlebars template. (optional)
- `css`: Override the default CSS styles to apply to the HTML. (optional)
- `markedOptions`: The options to pass to the `marked` library when converting Markdown to HTML. (optional). See [marked documentation](https://marked.js.org/using_advanced#options).
- `pdfOptions`: The options to pass to the `puppeteer` library when generating the PDF. (optional). See [puppeteer documentation](https://pptr.dev/api/puppeteer.pdfoptions).

## Rendering a Handlebars template

To render a Handlebars template, set the `useHandlebars` parameter to `true` and provide the `context` parameter with the data to use for rendering.

```bash
curl -X POST http://localhost:3000/ \
  -H 'Content-Type: application/json' \
  -d '{
    "markdown": "# {{title}}\n\n{{content}}",
    "useHandlebars": true,
    "context": {
      "title": "Hello world",
      "content": "This is a test"
    }
  }'
```