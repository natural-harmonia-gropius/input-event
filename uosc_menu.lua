local utils = require("mp.utils")

function string:trim()
    return (self:gsub("^%s*(.-)%s*$", "%1"))
end

function string:split(separator)
    local fields = {}
    local separator = separator or ":"
    local pattern = string.format("([^%s]+)", separator)
    local copy = self:gsub(pattern, function(c) fields[#fields + 1] = c end)
    return fields
end

function table:push(element)
    self[#self + 1] = element
    return self
end

function table:filter(filter)
    local nt = {}
    for index, value in ipairs(self) do
        if (filter(index, value)) then
            nt = table.push(nt, value)
        end
    end
    return nt
end

local function create_menu()
    local input_conf = mp.get_property_native("input-conf")
    local input_conf_path = mp.command_native({ "expand-path", input_conf == "" and "~~/input.conf" or input_conf })
    local input_conf_meta, meta_error = utils.file_info(input_conf_path)
    if not input_conf_meta or not input_conf_meta.is_file then return end -- File doesn"t exist

    local main_menu = { items = {}, items_by_command = {} }
    local by_id = {}

    for line in io.lines(input_conf_path) do
        local key, command, comment = string.match(line, "%s*([%S]+)%s+(.-)%s+#%s*(.-)%s*$")
        local title = ""

        if comment then
            local comments = comment:split("#")

            local titles = table.filter(comments, function(i, v) return v:match("^!") or v:match("^menu:") end)
            if titles and #titles > 0 then
                title = titles[1]
                title = title:match("^!%s*(.*)%s*") or title:match("^menu:%s*(.*)%s*")
                title = title:trim()
            end

            local events = table.filter(comments, function(i, v) return v:match("^@") end)
            if events and #events > 0 then
                local event = events[1]
                event = event:match("^@(.*)")
                event = event:trim()
                event = event:gsub("_", "-")
                key = key .. "@" .. event
            end
        end
        if title ~= "" then
            local is_dummy = key:sub(1, 1) == "#"
            local submenu_id = ""
            local target_menu = main_menu
            local title_parts = title:split(">")

            for index, title_part in ipairs(#title_parts > 0 and title_parts or { "" }) do
                if index < #title_parts then
                    submenu_id = submenu_id .. title_part

                    if not by_id[submenu_id] then
                        local items = {}
                        by_id[submenu_id] = { items = items, items_by_command = {} }
                        target_menu.items[#target_menu.items + 1] = { title = title_part, items = items }
                    end

                    target_menu = by_id[submenu_id]
                else
                    if command == "ignore" then break end
                    -- If command is already in menu, just append the key to it
                    if target_menu.items_by_command[command] then
                        local hint = target_menu.items_by_command[command].hint
                        target_menu.items_by_command[command].hint = hint and hint .. ", " .. key or key
                    else
                        local item = {
                            title = title_part,
                            hint = not is_dummy and key or nil,
                            value = command,
                        }
                        target_menu.items_by_command[command] = item
                        target_menu.items[#target_menu.items + 1] = item
                    end
                end
            end
        end
    end

    return main_menu
end

local function menu()
    local data = create_menu()
    local json, error = utils.format_json(data)
    mp.commandv("script-message-to", "uosc", "open-menu", json)
end

mp.add_forced_key_binding(nil, "menu", menu)
