import { system, world } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";

export async function settingMenu(player, busy) {
    const settingString = world.getDynamicProperty("setting");
    const setting = JSON.parse(settingString);
    const form = new UI.ModalFormData();

    form.toggle("チャット名変更", setting.chatName);
    form.toggle("ネームタグ変更", setting.nameTag);

    const { formValues, canceled } = busy
        ? await formbusy(player, form)
        : await form.show(player);
    if (canceled) return;
    
    setting.chatName = formValues[0];
    setting.nameTag = formValues[1];
    world.setDynamicProperty("setting", JSON.stringify(setting));
}

function formbusy(player, form) {
    return new Promise(res => {
        system.run(async function run() {
            const response = await form.show(player);
            const { canceled, cancelationReason: reason } = response;
            if (canceled && reason === UI.FormCancelationReason.UserBusy) return system.run(run);
            res(response);
        });
    });
}