import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { type HandlerModule } from "./middleware/handlerTypes.js";

const apiRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "api",
);

type RouteDefinition = {
  method: string;
  segments: string[];
  paramNames: string[];
  filePath: string;
};

const verbToMethod: Record<string, string> = {
  get: "GET",
  list: "GET",
  details: "GET",
  create: "POST",
  update: "PUT",
  delete: "DELETE",
};

const authActionVerbs: Record<string, string> = {
  login: "POST",
  register: "POST",
  logout: "POST",
  forgotPassword: "POST",
  changePassword: "PUT",
  session: "GET",
  upload: "POST",
  package: "POST",
  download: "POST",
};

export type ResolvedRoute = {
  module: HandlerModule;
  params: Record<string, string>;
};

function camelToKebab(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function paramNamesForResource(
  resourceSegments: string[],
  verb: string,
): string[] {
  const resource = resourceSegments[resourceSegments.length - 1];

  if (verb !== "details" && verb !== "update" && verb !== "delete") {
    return [];
  }

  if (resource === "products") {
    return ["slug"];
  }

  if (resource === "orders") {
    return ["orderId"];
  }

  if (resource === "categories") {
    return ["id"];
  }

  if (resource === "customers") {
    return ["id"];
  }

  if (verb === "details") {
    return ["id"];
  }

  return [];
}

async function listTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nested = await listTypeScriptFiles(fullPath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function buildRouteDefinition(filePath: string): RouteDefinition | null {
  const relativePath = path.relative(apiRoot, filePath);
  const parsed = path.parse(relativePath);
  const verb = parsed.name;
  const resourceSegments = parsed.dir === "." ? [] : parsed.dir.split(path.sep);

  const authMethod = authActionVerbs[verb];

  if (authMethod !== undefined) {
    return {
      method: authMethod,
      segments: [...resourceSegments, camelToKebab(verb)],
      paramNames: [],
      filePath,
    };
  }

  const method = verbToMethod[verb];

  if (method === undefined) {
    return null;
  }

  const paramNames = paramNamesForResource(resourceSegments, verb);

  return {
    method,
    segments: resourceSegments,
    paramNames,
    filePath,
  };
}

function patternMatches(
  route: RouteDefinition,
  method: string,
  segments: string[],
): Record<string, string> | null {
  if (route.method !== method) {
    return null;
  }

  if (route.paramNames.length === 0) {
    if (route.segments.length !== segments.length) {
      return null;
    }

    for (let index = 0; index < route.segments.length; index += 1) {
      if (route.segments[index] !== segments[index]) {
        return null;
      }
    }

    return {};
  }

  if (segments.length !== route.segments.length + route.paramNames.length) {
    return null;
  }

  for (let index = 0; index < route.segments.length; index += 1) {
    if (route.segments[index] !== segments[index]) {
      return null;
    }
  }

  const params: Record<string, string> = {};

  for (let index = 0; index < route.paramNames.length; index += 1) {
    const paramName = route.paramNames[index];
    const paramValue = segments[route.segments.length + index];

    if (paramName === undefined || paramValue === undefined) {
      return null;
    }

    params[paramName] = decodeURIComponent(paramValue);
  }

  return params;
}

let cachedRoutes: RouteDefinition[] | undefined;

async function loadRoutes(): Promise<RouteDefinition[]> {
  if (cachedRoutes !== undefined) {
    return cachedRoutes;
  }

  const files = await listTypeScriptFiles(apiRoot);
  cachedRoutes = files
    .map((routeFilePath) => buildRouteDefinition(routeFilePath))
    .filter((route): route is RouteDefinition => route !== null);

  return cachedRoutes;
}

const moduleCache = new Map<string, HandlerModule>();

async function loadHandlerModule(filePath: string): Promise<HandlerModule> {
  const cached = moduleCache.get(filePath);

  if (cached !== undefined) {
    return cached;
  }

  const moduleUrl = pathToFileURL(filePath).href;
  const imported = (await import(moduleUrl)) as HandlerModule;
  moduleCache.set(filePath, imported);
  return imported;
}

export async function resolveRoute(
  method: string,
  pathname: string,
): Promise<{ route: RouteDefinition; params: Record<string, string> } | null> {
  const normalizedPath = pathname.split("?")[0] ?? pathname;
  const segments = normalizedPath.split("/").filter((segment) => segment.length > 0);
  const routes = await loadRoutes();

  for (const route of routes) {
    const params = patternMatches(route, method.toUpperCase(), segments);

    if (params !== null) {
      return { route, params };
    }
  }

  return null;
}

export async function loadResolvedRoute(
  method: string,
  pathname: string,
): Promise<(ResolvedRoute & { route: RouteDefinition }) | null> {
  const resolved = await resolveRoute(method, pathname);

  if (resolved === null) {
    return null;
  }

  const module = await loadHandlerModule(resolved.route.filePath);

  return {
    module,
    params: resolved.params,
    route: resolved.route,
  };
}

export async function routeFileExists(filePath: string): Promise<boolean> {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile();
  } catch {
    return false;
  }
}
