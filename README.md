# InputEvent

Need to be done

[uosc/discussions#307](https://github.com/tomasklaen/uosc/discussions/307)

## How to integrate with other scripts?

Here's an example  
press `Z` to bind the key, press `C` to test the event execution and press `X` to unbind.

test.lua

```lua
local utils = require("mp.utils")

local key = "c"
local on = {
    click = "show-text click",
    penta_click = "show-text penta-click",
    quatra_click = "show-text quatra-click",
    double_click = "show-text double-click",
    triple_click = "show-text triple-click",
    press = "show-text pressed",
    release = "show-text released",
}

function bind()
    local json, err = utils.format_json(on)
    mp.commandv('script-message-to', 'inputevent', 'bind', key, json)
end

function unbind()
    mp.commandv('script-message-to', 'inputevent', 'unbind', key)
end

mp.add_forced_key_binding("z", "test-z", bind)
mp.add_forced_key_binding("x", "test-x", unbind)
```
