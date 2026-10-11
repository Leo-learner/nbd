import test from "node:test";
import assert from "node:assert/strict";
import { fixture } from "./fixture.js";
import { apiContract, dereference } from "../src/contract.js";
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
