# InputEvent

This script enhanced `input.conf` with better, conflict-free, low-latency event mechanism.

It allows mpv users to bind events by using this syntax in `input.conf`.

```ini
KEY             command                             #@event
```

Now the supported events are:  
`press`, `release`, `repeat`, `click`, `double_click`, `triple_click`, `quatra_click`, `penta_click`

Compound events e.g. `click` will be emitted as soon as possible to get lowest latency.

## Installation

1. Put `inputevent.lua` into ~~/scripts.
2. Modify your `input.conf`, See [**usage**](https://github.com/Natural-Harmonia-Gropius/InputEvent#usage) to get common uses.

- Suggestion: If you feel unresponsive due to clicking, add the following to your `mpv.conf`

  ```ini
  input-doubleclick-time=200
  ```

## Usage

If anyone has an idea, welcome to open a issue or make a PR.

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

It's convenient for 65-key keyboard users like me.  
`HOME/END` need be a combination of `fn` + `PGUP/PGDN`, which is not easy to press.

### Press to display stats, Click to toggle

```ini
i               script-binding stats/display-stats-toggle  #@click
i               script-binding stats/display-stats         #@repeat
i               script-binding stats/display-stats         #@press
```

Click to toggle displaying information and statistics (as default `shift+i`).  
Press to display information and statistics (as default `i`).  
The press line is not required, it just reduces the latency (Very little).

### Press to show uosc UI

```ini
MBTN_LEFT       script-message-to uosc set-min-visibility 1     #@press
MBTN_LEFT       script-message-to uosc set-min-visibility 0     #@release
```

Rather than click to show, click to hide it is more comfortable to show only when pressed.  
Requires [tomasklaen/uosc](https://github.com/tomasklaen/uosc).

### Handling repeat, Make it have a different event than click

```ini
.               frame-step; show-text "${estimated-frame-number}"       #@click
.               set pause no                                            #@press
.               set pause yes; show-text "${estimated-frame-number}"    #@release
.               show-text "${estimated-frame-number}"                   #@repeat
```

Here is an example of `frame-step`.  
The click here is the same as the default behavior.  
But the press of the default is stuttering, now the playback is smooth.

### Handling raw press，Make it have different click, double click events

```ini
PLAYPAUSE       cycle pause                         #@click
PLAYPAUSE       playlist-next                       #@double_click
```

Some headphones have a `PLAYPAUSE` button, click to play/pause and double click to play the next, just like some smart headphones.

[Press (the latter if key up/down can't be tracked)](https://mpv.io/manual/master/#lua-scripting-event) will be treated as a click.  
I don't know much about this, maybe there are keys that can `repeat`.

### Ideas that are currently impossible

#### Press LEFT to rewind

Unfortunately, mpv doesn't support rewind now.

#### Press MBTN_RIGHT to start mouse gesture, Release to execute the action

At some point in the future, maybe someone has already done it.  
See [christoph-heinrich/pointer_event#1](https://github.com/christoph-heinrich/pointer_event/issues/1)

## How does the auto-restore on release works?

```ini
KEY             ignore                              #@release
```

Writing the ignore command in the release event will enable automatic restore.  
What if you just need to **ignore** the release? Just don't write the line of release event.

In this example [press-to-speedup-release-to-restore](https://github.com/Natural-Harmonia-Gropius/InputEvent#press-to-speedup-release-to-restore).  
If you playing with `speed=0.5; pause=yes`, Press will change them to `speed=4; pause=no`.  
When released, they will restore to `speed=0.5; pause=yes`.

When you press, the script will record the current value of properties that will be changed.  
Then it executes the command in press.  
When you release, it will change the value of these properties to the value of the record.

The [command-prefixes](https://mpv.io/manual/master/#input-command-prefixes) of press will be retained as is.  
The restore for `no-osd set speed 4` will be `no-osd set speed 1`.

Only `set`, `cycle`, `add`, `multiply` are currently supported for auto-restore.  
A warning will be given for unsupported commands, `command doesn't support auto restore.`.  
But that doesn't mean it doesn't work at all, It will restore the reversible part.

```ini
SPACE           set speed 4; show-text 1            #@press
SPACE           ignore                              #@release
```

In this example, the speed will be restored, show-text cannot and will not be restored.

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
