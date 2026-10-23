import assert from "node:assert/strict";
import test from "node:test";
import {
  DEVICE_SCREEN_DROPZONE_SELECTOR,
  LOCAL_DROPZONE_SELECTOR,
  isDeviceScreenDropTarget,
  isLocalDropTarget,
} from "../lib/drop-routing";

test("global image drops yield to device screen drop targets", () => {
  let receivedSelector = "";
  const deviceChild = {
    closest: (selector: string) => {
      receivedSelector = selector;
      return {};
    },
  } as unknown as EventTarget;
  const canvas = {
    closest: () => null,
  } as unknown as EventTarget;

  assert.equal(isDeviceScreenDropTarget(deviceChild), true);
  assert.equal(receivedSelector, DEVICE_SCREEN_DROPZONE_SELECTOR);
  assert.equal(isDeviceScreenDropTarget(canvas), false);
  assert.equal(isDeviceScreenDropTarget(null), false);
});

test("global image drops yield to local tool drop zones", () => {
  const selectors: string[] = [];
  const toolChild = {
    closest: (selector: string) => {
      selectors.push(selector);
      return selector === LOCAL_DROPZONE_SELECTOR ? {} : null;
    },
  } as unknown as EventTarget;
  const elsewhere = { closest: () => null } as unknown as EventTarget;

  assert.equal(isLocalDropTarget(toolChild), true);
  assert.ok(selectors.includes(LOCAL_DROPZONE_SELECTOR));
  assert.equal(isDeviceScreenDropTarget(toolChild), false);
  assert.equal(isLocalDropTarget(elsewhere), false);
  assert.equal(isLocalDropTarget(null), false);
});
