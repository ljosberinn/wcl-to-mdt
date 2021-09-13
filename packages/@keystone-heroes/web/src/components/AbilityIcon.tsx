type AbilityIconProps = {
  icon?: string | null;
  alt: string;
  className?: string;
  title?: string;
};

export const STATIC_ICON_PREFIX = "/static/icons/";
export const BLOODLUST_ICON = `${STATIC_ICON_PREFIX}spell_nature_bloodlust.jpg`;
export const SHROUD_ICON = `${STATIC_ICON_PREFIX}ability_rogue_shroudofconcealment.jpg`;
export const INVIS_POTION_ICON = `${STATIC_ICON_PREFIX}inv_alchemy_80_potion02orange.jpg`;
export const QUESTIONMARK_ICON = "inv_misc_questionmark";

export function AbilityIcon({
  icon,
  alt,
  className,
  title,
}: AbilityIconProps): JSX.Element {
  return (
    <img
      src={`${STATIC_ICON_PREFIX}${icon ?? QUESTIONMARK_ICON}.jpg`}
      alt={alt}
      title={title ?? alt}
      className={className}
    />
  );
}
