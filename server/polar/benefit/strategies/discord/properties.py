from ..base.properties import BenefitGrantProperties, BenefitProperties


class BenefitDiscordProperties(BenefitProperties):
    guild_id: str
    role_id: str
    kick_member: bool


class BenefitGrantDiscordProperties(BenefitGrantProperties, total=False):
    account_id: str
    guild_id: str
    role_id: str
