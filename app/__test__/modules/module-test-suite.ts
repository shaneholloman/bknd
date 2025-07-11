import { beforeEach, describe, expect, it } from "bun:test";

import { Hono } from "hono";
import { Guard } from "../../src/auth";
import { DebugLogger } from "../../src/core";
import { EventManager } from "../../src/core/events";
import { Default, stripMark } from "../../src/core/utils";
import { EntityManager } from "../../src/data";
import { Module, type ModuleBuildContext } from "../../src/modules/Module";
import { getDummyConnection } from "../helper";
import { ModuleHelper } from "modules/ModuleHelper";

export function makeCtx(overrides?: Partial<ModuleBuildContext>): ModuleBuildContext {
   const { dummyConnection } = getDummyConnection();
   const ctx = {
      connection: dummyConnection,
      server: new Hono(),
      em: new EntityManager([], dummyConnection),
      emgr: new EventManager(),
      guard: new Guard(),
      flags: Module.ctx_flags,
      logger: new DebugLogger(false),
      ...overrides,
   };
   return {
      ...ctx,
      helper: new ModuleHelper(ctx as any),
   } as any;
}

export function moduleTestSuite(module: { new (): Module }) {
   let ctx: ModuleBuildContext;

   beforeEach(() => {
      ctx = makeCtx();
   });

   describe("Module Tests", () => {
      it("should build without exceptions", async () => {
         const m = new module();
         await m.setContext(ctx).build();
         expect(m.toJSON()).toBeDefined();
      });

      it("uses the default config", async () => {
         const m = new module();
         await m.setContext(ctx).build();
         expect(stripMark(m.toJSON())).toEqual(Default(m.getSchema(), {}));
      });
   });
}
