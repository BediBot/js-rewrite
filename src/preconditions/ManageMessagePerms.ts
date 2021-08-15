import {Precondition} from '@sapphire/framework';
import {Message, Permissions} from 'discord.js';

export class BotPermManageChannelPrecondition extends Precondition {
  public run(message: Message) {
    if (message.guild && message.guild.me?.permissions.has("MANAGE_MESSAGES")) 
    {
        return this.ok();
    }
    return this.error({message: 'Bot does not have proper permissions: missing `MANAGE MESSAGES` permission'});
  }
}
