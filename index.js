/*
 * MIT License
 * 
 * Copyright (c) 2020 Sebastian Law
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * *AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');

let original;

module.exports = class UnblockNSFW extends Plugin {
    async startPlugin () {
        this.a = await getModule(['getCurrentUser']);

        const ConnectionStore = await getModule(['isTryingToConnect', 'isConnected'])
        const listener = () => {
            if (!ConnectionStore.isConnected()) return;

            ConnectionStore.removeChangeListener(listener)
            this.onDiscordStart()
        }
        if (ConnectionStore.isConnected()) listener()
        else ConnectionStore.addChangeListener(listener)
        powercord.api.commands.registerCommand({
            command: 'nsfw',
            aliases: [],
            description: 'Toggle The Discord NSFW control',
            usage: '{c} <subcommand>',
            executor: (args) => {
                const subcommand = args[0];
                var stat = null;
                if (!subcommand) 
                    return {
                        send: false,
                        result: {
                          type: "rich",
                          title: "Invalid subcommand",
                          description: `${args[0]} is not a valid subcommand. Specify one of enable or disable`
                        },
                   };
                if (subcommand === "enable") {
                    stat = true;
                } else {
                    if (subcommand === "disable") {
                        stat = false;
                    } else {
                        return {
                            send: false,
                            result: {
                            type: "rich",
                            title: "Invalid subcommand",
                            description: `${args[0]} is not a valid subcommand. Specify one of enable or disable`
                        }
                    };
                };
                };
                this.setNSFW(stat);
                 return {
                    send: false,
                    result: {
                    type: "rich",
                    title: "Sucess",
                    description: `Toggled NSFW settings to ${stat} `
                       }
                 }
           },
            autocomplete: (args) => {
                if (args[0] !== void 0 && args.length === 1) {
                  return {
                    commands: [
                        {
                            command: "enable",
                            description: "Enable NSFW"
                        },
                        {
                            command: "disable",
                            description: "disable NSFW"
                        }],
                    header: "unblock-nsfw subcommands",
                  };
                }

                const subcommand = ["enable","disable"].includes(args[0]);
                if (!subcommand || !subcommand.autocomplete) {
                  return false;
                }

                return subcommand.autocomplete(args.slice(1));
              },
      });
   }

    setNSFW(b) {
        Object.defineProperty(this.a.getCurrentUser(), 'nsfwAllowed', {get: () => b});
    }
    
    async onDiscordStart() {
        original = this.a.getCurrentUser().nsfwAllowed;
        this.setNSFW(true);
    }
    
    pluginWillUnload () { 
        this.setNSFW(original); 
        powercord.api.commands.unregisterCommand('nsfw');
    }
}

 
