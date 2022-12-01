// InputEvent
// https://github.com/Natural-Harmonia-Gropius/InputEvent

// TODO:
// mp.lua.d.ts https://mpv.io/manual/master/#differences-from-lua
// replace ie to something else

// local utils = require("mp.utils")

/// <reference path="./mp.d.ts" />

const bind_map: Record<string, ieInputEvent> = {};

function debounce(func: Function, wait: number = 0) {
  // let timer = null;
  // const timer_end = () => {
  //   timer.kill();
  //   timer = null;
  //   func();
  // };
  // return () => {
  //   if (timer) {
  //     timer.kill();
  //   }
  //   timer = mp.add_timeout(wait, timer_end);
  // };
}

function now(): number {
  return mp.get_time() * 1000;
}

function command(command: string) {
  return mp.command(command);
}

function command_invert(command: string): string {
  const command_list = command.split(";").map((v) => v.trim());
  // for (const v of command_list) {
  //   const trimed = v.trim();
  //   const subsa = trimed.split("%s*");
  //   const prefix = InputCommandsPerfixes.has(subsa[1]) ? subsa[1] : "";
  //   const command = subsa[prefix == "" ? 1 : 2];
  //   const property = subsa[prefix == "" ? 2 : 3];
  //   const value = mp.get_property(property);
  // }

  const invert: string[] = [];
  if (InputCommands.has(command)) {
    // invert.push(`${prefix} set ${property} ${value}`)
  } else {
    // mp.msg.warn("\"" .. trimed .. "\" doesn't support auto restore.")
  }
  return invert.join(";");
}

// https://mpv.io/manual/master/#list-of-input-commands
const InputCommands = new Set(["set", "cycle", "add", "multiply"]);

// https://mpv.io/manual/master/#input-command-prefixes
const InputCommandsPerfixes = new Set([
  "osd-auto",
  "no-osd",
  "osd-bar",
  "osd-msg",
  "osd-msg-bar",
  "raw",
  "expand-properties",
  "repeatable",
  "async",
  "sync",
]);

// https://mpv.io/manual/master/#lua-scripting-event
type mpKeyEvent = "down" | "repeat" | "up" | "press";

type ieKeyEvent =
  | "penta_click"
  | "quatra_click"
  | "triple_click"
  | "double_click"
  | "click"
  | "press"
  | "release"
  | "repeat";

interface IEventPattern {
  to: ieKeyEvent;
  from: string;
  length: number;
}

const EventPatterns: IEventPattern[] = [
  {
    to: "penta_click",
    from: "down,up,down,up,down,up,down,up,down,up",
    length: 10,
  },
  { to: "quatra_click", from: "down,up,down,up,down,up,down,up", length: 8 },
  { to: "triple_click", from: "down,up,down,up,down,up", length: 6 },
  { to: "double_click", from: "down,up,down,up", length: 4 },
  { to: "click", from: "down,up", length: 2 },
  { to: "press", from: "down", length: 1 },
  { to: "release", from: "up", length: 1 },
];

class ieInputEvent {
  key: string;
  name: string;
  on: Partial<Record<ieKeyEvent, string>>;
  queue: string[];
  queue_max: object;
  duration: number;

  constructor(key: string, on: object) {
    this.key = key;
    this.name = `@${this.key}`;
    this.on = { click: "", ...on };
    this.queue = [];
    this.queue_max = { length: 0 };
    this.duration = mp.get_property_number("input-doubleclick-time", 300);

    for (const event of EventPatterns) {
      if (this.on[event.to] && event.length > 1) {
        this.queue_max = { event: event.to, length: event.length };
        break;
      }
    }

    return this;
  }

  handler(event: mpKeyEvent) {
    // if event == "press" then
    //     self:handler("down")
    //     self:handler("up")
    //     return
    // end
    // if event == "down" then
    //     self.on["repeat-ignore"] = now()
    // end
    // if event == "repeat" then
    //     self:emit(event)
    //     return
    // end
    // if event == "up" then
    //     if #self.queue == 0 then
    //         self:emit("release")
    //         return
    //     end
    //     if #self.queue + 1 == self.queue_max.length then
    //         self.queue = {}
    //         self:emit(self.queue_max.event)
    //         return
    //     end
    // end
    // self.queue = table.push(self.queue, event)
    // self.exec_debounced()
  }

  emit(event: ieKeyEvent) {
    // local ignore = event .. "-ignore"
    // if self.on[ignore] then
    //     if now() - self.on[ignore] < self.duration then
    //         return
    //     end
    //     self.on[ignore] = nil
    // end
    // if event == "press" and self.on["release"] == "ignore" then
    //     self.on["release-auto"] = command_invert(self.on["press"])
    // end
    // if event == "release" and self.on[event] == "ignore" then
    //     event = "release-auto"
    // end
    // local cmd = self.on[event]
    // if not cmd or cmd == "" then
    //     return
    // end
    // command(cmd)
  }

  ignore(timeout: number) {
    const ft = now() + timeout;
  }

  exec() {
    // if #self.queue == 0 then
    //     return
    // end
    // local separator = ","
    // local queue_string = table.join(self.queue, separator)
    // for _, v in ipairs(event_pattern) do
    //     if self.on[v.to] then
    //         queue_string = queue_string:replace(v.from, v.to)
    //     end
    // end
    // self.queue = queue_string:split(separator)
    // for _, event in ipairs(self.queue) do
    //     self:emit(event)
    // end
    // self.queue = {}
  }

  bind() {
    // self.exec_debounced = debounce(function() self:exec() end, self.duration)
    mp.add_forced_key_binding(
      this.key,
      this.name,
      (e) => {
        const event = e?.event;
        if (event) this.handler(event);
      },
      { complex: true }
    );
  }

  unbind() {
    mp.remove_key_binding(this.name);
  }

  rebind(diff: Partial<ieInputEvent>) {
    for (const key in diff) {
      // this[key] = diff[key];
    }

    this.unbind();
    this.bind();
  }
}

function bind_from_json(json: string): void {}

function bind_from_conf(path?: string): void {
  // local input_conf = mp.get_property_native("input-conf")
  // local input_conf_path = mp.command_native({ "expand-path", input_conf == "" and "~~/input.conf" or input_conf })
  // local input_conf_meta, meta_error = utils.file_info(input_conf_path)
  // if not input_conf_meta or not input_conf_meta.is_file then return end -- File doesn"t exist
  // local parsed = {}
  // for line in io.lines(input_conf_path) do
  //     line = line:trim()
  //     if line ~= "" then
  //         local key, cmd, comment = line:match("%s*([%S]+)%s+(.-)%s+#%s*(.-)%s*$")
  //         if comment and key:sub(1, 1) ~= "#" then
  //             local comments = comment:split("#")
  //             local events = table.filter(comments, function(i, v) return v:match("^@") end)
  //             if events and #events > 0 then
  //                 local event = events[1]:match("^@(.*)"):trim()
  //                 if event and event ~= "" then
  //                     if parsed[key] == nil then
  //                         parsed[key] = {}
  //                     end
  //                     parsed[key][event] = cmd
  //                 end
  //             end
  //         end
  //     end
  // end
  // for key, on in pairs(parsed) do
  //     bind(key, on)
  // end
}

function bind_from_script_message(key: unknown, on: unknown): void {
  if (typeof key !== "string" || typeof on !== "string") {
    return;
  }

  if (key.length === 1) {
    key = key.toUpperCase();
  }

  // on = utils.parse_json(on);
  on = JSON.parse(on);

  const binded = bind_map[key];
  if (binded) {
    on = { ...binded.on, ...on };
    binded.unbind();
  }

  bind_map[key] = new InputEvent(key, on);
  bind_map[key].bind();
}

function unbind_from_script_message(key: unknown): void {
  if (typeof key !== "string") return;

  bind_map[key]?.unbind();
}

mp.observe_property("focused", "native", (_, focused) => {
  if (!focused) return;

  const binding: ieInputEvent = bind_map["MBTN_LEFT"];
  if (!binding) return;

  binding.ignore(100);
});

mp.register_script_message("bind", bind_from_script_message);
mp.register_script_message("unbind", unbind_from_script_message);

bind_from_conf();
