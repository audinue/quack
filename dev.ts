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
      return new Response(result.outputs[0]);
    }
    if (url.pathname === "/quack.js") {
      const result = await Bun.build({
        entrypoints: ["./quack.ts"],
        minify: true,
      });
      return new Response(result.outputs[0]);
    }
    return new Response(null, {
      status: 404,
    });
  },
});
