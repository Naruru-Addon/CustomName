import { world, system } from "@minecraft/server";
import { setting } from "./setting";
import { settingMenu } from "./form";

system.run(() => {
    if (!world.getDynamicProperty("setting")) {
        world.setDynamicProperty("setting", JSON.stringify(setting));
    }
});

world.beforeEvents.chatSend.subscribe(ev => {
    const { sender, message } = ev;
    const settingString = world.getDynamicProperty("setting");
    const setting = JSON.parse(settingString);

    if (sender.isOp() && message === "cnsetting") {
        ev.cancel = true;
        system.run(() => {
            settingMenu(sender, true);
        });
        return;
    }

    if (setting.chatName) {
        const tags = sender.getTags();

        for (const tag of tags) {
            if (tag.startsWith("cn_")) {
                ev.cancel = true;
                world.sendMessage(`§r§f<${sender.nameTag}§r§f> ${message}`);
                return;
            }
        }
    }
});

system.runInterval(() => {
    const settingString = world.getDynamicProperty("setting");
    const setting = JSON.parse(settingString);
    const players = world.getAllPlayers();

    ForPlayer: for (const player of players) {
        if (!player.cnTags) player.cnTags = {
            old: [],
            new: []
        }

        if (player.cnTags.new.length > 0) {
            player.cnTags.old = player.cnTags.new;
        }

        player.cnTags.new = player.getTags();

        const addedElements = player.cnTags.new.filter(item => !player.cnTags.old.includes(item));

        for (const addelement of addedElements) {
            if (addelement.startsWith("cn_")) {
                for (const tag of player.getTags()) {
                    if (tag === addelement) continue;
                    player.removeTag(tag);
                }
            }
        }

        if (setting.nameTag) {
            for (const tag of player.getTags()) {
                if (tag.startsWith("cn_")) {
                    if (tag === "cn_reset") {
                        player.nameTag = player.name;
                        player.removeTag(tag);
                    } else if (tag.startsWith("cn_prefix_")) {
                        player.nameTag = tag.replace("cn_prefix_", "") + player.name;
                    } else if (tag.startsWith("cn_suffix")) {
                        player.nameTag = player.name + tag.replace("cn_suffix_", "");
                    } else if (tag === "cn_none") {
                        player.nameTag = "";
                    } else {
                        player.nameTag = tag.replace("cn_", "");
                    }
    
                    continue ForPlayer;
                }
            }

            player.nameTag = player.name;
        }
    }
});