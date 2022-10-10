# InputEvent

Need to be done

## Installation

1. Put `inputevent.lua` into ~~/scripts.
2. Modify your `input.conf`, See [**Usage**](https://github.com/Natural-Harmonia-Gropius/InputEvent#usage) to learn how to use.

- Suggestion: If you feel unresponsive due to clicking, add the following to your `mpv.conf`

  ```ini
  input-doubleclick-time=200
  ```

## Usage

### Click to pause, Double click to fullscreen

```ini
MBTN_LEFT       cycle pause                         #@click
MBTN_LEFT       cycle fullscreen                    #@double_click
MBTN_LEFT_DBL   ignore                              # avoid conflicts
```

Like Youtube, you can click to pause and double click to full screen.  
But I'm an mpv user and I wanted to do the same, so I added these into input.conf.

```ini
MBTN_LEFT       cycle pause
MBTN_LEFT_DBL   cycle fullscreen
```

Hmm, it does work, but it also pauses when double click, and I don't want that.  
So here is the solution.

### Press to speedup, Release to restore

```ini
SPACE           cycle pause                         #@click
SPACE           no-osd set speed 4; set pause no    #@press
SPACE           ignore                              #@release
```

When you press the `SPACE` the playback speed will be 4x faster.  
When you release it, changes will [automatically restore](https://github.com/Natural-Harmonia-Gropius/InputEvent#how-does-the-auto-restore-on-release-works).

Of course, you can bind it to the right arrow key by simply replacing `SPACE` to `RIGHT`.  
I just personally prefer the space.

This was requested in [hooke007/MPV_lazy#183](https://github.com/hooke007/MPV_lazy/discussions/183).  
At that time I created [pressaction.lua](https://github.com/Natural-Harmonia-Gropius/mpv_config/blob/990a19fcd7ca91ff5f9cdfa01184c8d25a7932e8/scripts/pressaction.lua), which is now deprecated because this is the perfect replacement.

[po5/evafast](https://github.com/po5/evafast) also does this and is more powerful.  
if you want to use it while having custom keybind, this is an example of integrating it.

```ini
RIGHT           seek 5                              #@click
RIGHT           script-binding evafast/speedup      #@press
RIGHT           script-binding evafast/slowdown     #@release
```

### Press to maximize/minimize volume

```ini
UP              add volume  10                      #@click
UP              set volume  100                     #@press
DOWN            add volume -10                      #@click
DOWN            set volume  0                       #@press
```

For the default volume adjustment, repeatedly pressing or holding is annoying, slow and imprecise.  
Now just one step, press.

### Click to next/prev chapter, Press to next/prev playlist item

```ini
PGUP            add chapter -1                      #@click
PGUP            playlist-prev                       #@press
PGDWN           add chapter  1                      #@click
PGDWN           playlist-next                       #@press
```

It's convenient for 65-key keyboard users like me. `HOME/END` need be a combination of `fn` + `PGUP/PGDN`.

### Press to display stats, Click to toggle

```ini
i               script-binding stats/display-stats-toggle  #@click
i               script-binding stats/display-stats         #@repeat
i               script-binding stats/display-stats         #@press
```

Click to toggle displaying information and statistics (as default `shift+i`).  
Press to display information and statistics (as default `i`).  
The press line is not required, it just reduces the latency (Possibly).

### Press to peek uosc UI

```ini
TAB             script-binding uosc/toggle-ui       #@press
TAB             script-binding uosc/toggle-ui       #@release
```

For [tomasklaen/uosc](https://github.com/tomasklaen/uosc) users, Rather than click to show click to hide it is more comfortable to show only when pressed.

### Prevent repeat of frame-step

```ini
.               frame-step; show-text "${estimated-frame-number}";      #@click
.               set pause no                                            #@press
.               set pause yes; show-text "${estimated-frame-number}"    #@release
```

The click here is the same as the default behavior.  
But the press of the default is stuttering, now the playback is smooth.

### Handling raw press

```ini
PLAYPAUSE       cycle pause                         #@click
```

[Press (the latter if key up/down can't be tracked)](https://mpv.io/manual/master/#lua-scripting-event) will be treated as a click.  
I don't know what's the point, and it doesn't support multiple clicks. Maybe there are keys that can `repeat`.

### More usages will be added

If anyone has an idea, welcome to open a issue or make a PR.

### Ideas that are currently impossible

#### Press LEFT to rewind

Unfortunately, mpv doesn't support rewind now.

#### Press MBTN_RIGHT to start mouse gesture, Release to execute the action

At some point in the future, maybe someone has already done it.  
See [christoph-heinrich/pointer_event#1](https://github.com/christoph-heinrich/pointer_event/issues/1)

## How does the auto-restore on release works?

TODO

## How to integrate with other scripts?

Here's an example  
press `Z` to bind the key, press `C` to test the event execution and press `X` to unbind.

Save it as `test.lua` in your ~~/scripts

```lua
local utils = require("mp.utils")

local key = "c"
local on = {
    click = "show-text click",
    double_click = "show-text double-click",
    triple_click = "show-text triple-click",
    quatra_click = "show-text quatra-click",
    penta_click = "show-text penta-click",
    press = "show-text pressed",
    release = "show-text released",
    ["repeat"] = "show-text repeat",
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
