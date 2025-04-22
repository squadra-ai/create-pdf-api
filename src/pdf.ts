import fs from "fs/promises";
import { marked } from "marked";
import type { Browser, Page } from "puppeteer";
import handlebars from "handlebars";
import * as uuid from "uuid";
import { z } from "zod";
import { getDestination } from "./storage";

const puppeteer = require('puppeteer');
const browser: Browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
const defaultCss = await fs.readFile('src/default-css.css', 'utf-8');

const createPDFOptions = z.object({
  html: z.string().min(1, "HTML content is required").optional(),
  markdown: z.string().min(1, "Markdown content is required").optional(),
  css: z.string().optional(),
  useHandlebars: z.boolean().optional(),
  context: z.record(z.any()).optional(),
  markedOptions: z.object({
    gfm: z.boolean().optional(),
    breaks: z.boolean().optional(),
    pedantic: z.boolean().optional(),
    sanitize: z.boolean().optional(),
    smartLists: z.boolean().optional(),
    smartypants: z.boolean().optional(),
    xhtml: z.boolean().optional(),
  }).optional(),
  pdfOptions: z.record(z.any()).optional(),
});

export async function createPDF(rawOptions: any) {

  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    return Response.json({
      error: 'BUCKET_NAME environment variable is not set'
    }, {status: 500});
  }

  let page: Page|undefined = undefined;
  let html: string|undefined = undefined;
  let options: z.infer<typeof createPDFOptions>;

  try {

    options = createPDFOptions.parse(rawOptions);

    html = options.html;
    if(html) {
      if (options.useHandlebars) {
        const template = handlebars.compile(html);
        html = template(options.context || {});
      }
    }
    else if (options.markdown) {
      let markdown = options.markdown;
      if (options.useHandlebars) {
        const template = handlebars.compile(markdown);
        markdown = template(options.context || {});
      }
      html = await marked(markdown, {async: true, ...options.markedOptions});
    }
    else {
      throw new Error('Either HTML or Markdown content is required');
    }

    html = `<html><head><meta charset="utf-8"></head><body><style>${options.css ?? defaultCss}</style>${html}</body></html>`;

  }
  catch (error) {
    return Response.json({
      error: 'Invalid options or data',
      message: (error as Error).message
    }, {status: 400});
  }

  try {
    const id = uuid.v4();
    const [writeStream, url] = getDestination(bucketName, id);
    
    page = await browser.newPage();
    await page.setContent(html, {waitUntil: 'networkidle0'});
    const stream = await page.createPDFStream({
      format: 'A4',
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      },
      landscape: false,
      ...options.pdfOptions
    });
    await stream.pipeTo(writeStream);
    
    return Response.json({
      id,
      url
    });
  }
  catch (error) {
    return Response.json({ error: 'Failed to create PDF',
      message: (error as Error).message
    }, {status: 500});
  }
  finally {
    await page?.close();
  }

}
