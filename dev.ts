import { gzipSync } from "zlib";

Bun.serve({
  port: 3000,
  async fetch(req) {
    let url = new URL(req.url);
    if (url.pathname === "/") {
      return new Response(Bun.file("index.html"));
    }
    if (url.pathname === "/index.js") {
      const result = await Bun.build({
        entrypoints: ["./index.ts"],
        sourcemap: "inline",
      });
      const content = gzipSync(await result.outputs[0].text());
      return new Response(content, {
        headers: {
          "Content-Encoding": "gzip",
          "Content-Length": content.length as any as string,
        },
      });
    }
    if (url.pathname === "/quack.js") {
      const result = await Bun.build({
        entrypoints: ["./quack.ts"],
        minify: true,
      });
      const content = gzipSync(await result.outputs[0].text());
      return new Response(content, {
        headers: {
          "Content-Encoding": "gzip",
          "Content-Length": content.length as any as string,
        },
      });
    }
    return new Response(null, {
      status: 404,
    });
  },
});
