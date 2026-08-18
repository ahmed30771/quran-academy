import app from "../server/src/app.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

function headerValue(req, name) {
  const value = req.headers?.[name];
  return String(Array.isArray(value) ? value[0] : value || "");
}

function restoreApiUrl(req) {
  const forwarded = headerValue(req, "x-forwarded-uri") || headerValue(req, "x-invoke-path");
  const originalPath = forwarded.split("?")[0];
  const current = String(req.url || "");
  const currentPath = current.split("?")[0];
  if (!originalPath.startsWith("/api/")) return;
  if (currentPath === "/api" || currentPath === "/api/" || currentPath === "/" || !currentPath.startsWith("/api/")) {
    const qs = forwarded.includes("?")
      ? forwarded.slice(forwarded.indexOf("?"))
      : current.includes("?")
        ? current.slice(current.indexOf("?"))
        : "";
    req.url = originalPath + qs;
  }
}

export default function handler(req, res) {
  restoreApiUrl(req);
  return app(req, res);
}
