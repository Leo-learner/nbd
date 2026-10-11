import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Ajv } from "ajv";
import { fixture } from "./fixture.js";
import { apiContract, dereference, mcpContract } from "../src/contract.js";
const addFormats = createRequire(import.meta.url)(
  "ajv-formats",
) as import("ajv-formats").FormatsPlugin;
test("服务端生成契约包含全部 48 个操作，路径、输入必填字段和状态码一致", async () => {
  const f = await fixture();
  try {
    const generated = f.app.swagger() as any;
    let count = 0;
    for (const [path, operations] of Object.entries(apiContract.paths) as [
      string,
      any,
    ][]) {
      for (const [method, original] of Object.entries(operations) as [
        string,
        any,
      ][]) {
        count++;
        const actual = generated.paths[path]?.[method];
        assert.ok(actual, path + " " + method);
        assert.equal(actual.operationId, original.operationId);
        assert.deepEqual(
          Object.keys(actual.responses).sort(),
          Object.keys(original.responses).sort(),
          original.operationId,
        );
        if (original.requestBody) {
          const before = dereference(
              original.requestBody.content["application/json"].schema,
            ),
            after = actual.requestBody.content["application/json"].schema;
          assert.deepEqual(
            after.required,
            before.required,
            original.operationId,
          );
          assert.equal(after.additionalProperties, before.additionalProperties);
        }
      }
    }
    assert.equal(count, 48);
  } finally {
    await f.close();
  }
});

test("所有 JSON 示例都符合其 OpenAPI 或 MCP 输入/输出 schema", () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const specId = "https://nbd.invalid/openapi.yaml";
  ajv.addSchema(apiContract, specId);
  const examplesDir = fileURLToPath(
    new URL("../docs/examples/", import.meta.url),
  );
  const filenames = readdirSync(examplesDir)
    .filter((filename) => filename.endsWith(".json"))
    .sort();
  const assertValid = (schema: unknown, value: unknown, label: string) => {
    const validate = ajv.compile(schema as object);
    assert.equal(
      validate(value),
      true,
      `${label}: ${JSON.stringify(validate.errors)}`,
    );
  };
  const apiError = apiContract.components.schemas.Error;
  const mcpError = structuredClone(apiError);
  mcpError.required = ["error", "auditId"];
  delete mcpError.properties.requestId;
  mcpError.properties.auditId = { type: "integer", minimum: 1 };

  assert.ok(filenames.length > 0, "No docs/examples/*.json examples found");
  for (const filename of filenames) {
    const example = JSON.parse(
      readFileSync(`${examplesDir}/${filename}`, "utf8"),
    );
    if (example.kind) {
      assert.ok(
        ["request", "response", "error"].includes(example.kind),
        filename,
      );
      assert.equal(
        typeof example.schema,
        "string",
        `${filename}: schema name required`,
      );
      const validate = ajv.getSchema(
        `${specId}#/components/schemas/${example.schema}`,
      );
      assert.ok(
        validate,
        `${filename}: missing OpenAPI schema ${example.schema}`,
      );
      assert.equal(
        validate(example.value),
        true,
        `${filename}: ${JSON.stringify(validate.errors)}`,
      );
      continue;
    }

    assert.equal(
      typeof example.tool,
      "string",
      `${filename}: unknown example kind`,
    );
    const tool = mcpContract.tools.find(
      (candidate: any) => candidate.name === example.tool,
    );
    assert.ok(
      tool,
      `${filename}: MCP tool ${example.tool} is not in docs/mcp-tools.json`,
    );
    assert.equal(
      example.request.method,
      "tools/call",
      `${filename}: request method`,
    );
    assert.equal(
      example.request.params.name,
      example.tool,
      `${filename}: request tool name`,
    );
    assertValid(
      tool.inputSchema,
      example.request.params.arguments,
      `${filename} request`,
    );

    const result = example.response.result;
    const textContent = result.content?.find(
      (item: any) => item.type === "text",
    );
    assert.ok(textContent, `${filename}: missing text result`);
    const textValue = JSON.parse(textContent.text);
    if (result.isError) {
      assertValid(mcpError, textValue, `${filename} MCP error response`);
    } else {
      assert.ok(
        result.structuredContent,
        `${filename}: missing structuredContent`,
      );
      assertValid(
        tool.outputSchema,
        result.structuredContent,
        `${filename} MCP response`,
      );
      assert.deepEqual(
        textValue,
        result.structuredContent,
        `${filename}: text/structuredContent mismatch`,
      );
    }
  }
});
